"""Firebase Storage-triggered lyrics transcription service.

Deploy as:
- Firebase Cloud Functions (Python) using on_object_finalized trigger, or
- AWS Lambda wired to Storage/S3 events.
"""

from __future__ import annotations

import json
import os
import tempfile
from dataclasses import asdict, dataclass
from typing import Iterable

import firebase_admin
from firebase_admin import firestore, storage

try:
    from lyrics_transcriber import LyricsTranscriber, is_instrumental_from_result
except ImportError:  # fallback path
    LyricsTranscriber = None
    is_instrumental_from_result = None

if not firebase_admin._apps:
    firebase_admin.initialize_app()

DB = firestore.client()
BUCKET = storage.bucket()


@dataclass
class LyricLine:
    time: float
    text: str


# Patterns for obvious hallucinations even after VAD filtering
HALLUCINATION_PATTERNS = {
    # Common Whisper mistakes on silence/noise
    "o-o-o",  # Repeated syllables
    "thank you",
    "thanks for watching",
    "subscribe",
    "like and subscribe",
    "appreciation",
    "applause",
    "[Music]",
    "[Silence]",
    "[Background noise]",
    # YouTube/TikTok artifacts
    "click here",
    "follow us",
    "visit us",
}


def is_hallucination(text: str) -> bool:
    """Check if text is a likely hallucination.
    
    Args:
        text: Line of text to check
        
    Returns:
        True if text appears to be a hallucination
    """
    text_lower = text.lower().strip()
    
    # Check exact patterns
    for pattern in HALLUCINATION_PATTERNS:
        if pattern in text_lower:
            return True
    
    # Check for repeated characters (e.g., "o-o-o-o-o-o-o")
    # Pattern: char-char-char repeated
    if "-" in text_lower:
        parts = text_lower.split("-")
        if len(parts) > 3 and all(p == parts[0] for p in parts if p):
            return True
    
    return False


def parse_srt_like_lines(segments: Iterable[dict], filter_hallucinations: bool = True) -> list[LyricLine]:
    """Parse segments to lyric lines, optionally filtering obvious hallucinations.
    
    Args:
        segments: Iterable of segment dictionaries from Whisper
        filter_hallucinations: Whether to filter out known hallucination patterns
        
    Returns:
        List of LyricLine objects
    """
    lines: list[LyricLine] = []
    for segment in segments:
        text = (segment.get("text") or "").strip()
        if not text:
            continue
        
        # Filter out obvious hallucinations
        if filter_hallucinations and is_hallucination(text):
            print(f"  Filtering hallucination: {text}")
            continue
        
        lines.append(LyricLine(time=float(segment.get("start", 0.0)), text=text))
    return lines


def to_lrc(lines: list[LyricLine]) -> str:
    def stamp(seconds: float) -> str:
        minutes = int(seconds // 60)
        remainder = seconds - minutes * 60
        return f"[{minutes:02d}:{remainder:05.2f}]"

    return "\n".join(f"{stamp(line.time)}{line.text}" for line in lines)


def transcribe_audio(local_audio_path: str) -> tuple[list[LyricLine], bool]:
    """Transcribe audio to lyrics with VAD-based hallucination prevention.
    
    Args:
        local_audio_path: Path to audio file
        
    Returns:
        Tuple of (lyrics_lines, is_instrumental)
    """
    if LyricsTranscriber is None:
        raise RuntimeError("Install lyrics-transcriber or wire OpenAI Whisper client before deploy.")

    print(f"  Transcribing {local_audio_path}...")
    transcriber = LyricsTranscriber(model_name="base")
    result = transcriber.transcribe(local_audio_path)
    
    # Check if VAD detected this as instrumental
    is_instrumental = is_instrumental_from_result(result)
    if is_instrumental:
        print(f"  → Detected as instrumental (no speech)")
        return [], True
    
    segments = result.get("segments", [])
    print(f"  → Found {len(segments)} potential lyric segments")
    
    lines = parse_srt_like_lines(segments, filter_hallucinations=True)
    
    if not lines:
        print(f"  → No valid lyrics after filtering (likely instrumental)")
        return [], True
    
    print(f"  → Final lyric count: {len(lines)}")
    return lines, False


def process_track(track_id: str, file_path: str) -> None:
    """Process a track: transcribe audio and save lyrics to Firestore.
    
    Args:
        track_id: Firestore document ID for the track
        file_path: Path to audio file in Cloud Storage
    """
    track_ref = DB.collection("tracks").document(track_id)
    track_ref.update({"status": "processing"})

    print(f"\nProcessing track {track_id} from {file_path}")

    blob = BUCKET.blob(file_path)

    with tempfile.TemporaryDirectory() as tmp_dir:
        local_path = os.path.join(tmp_dir, os.path.basename(file_path))
        blob.download_to_filename(local_path)
        lines, is_instrumental = transcribe_audio(local_path)

    if is_instrumental or not lines:
        print(f"  → Saving as instrumental track")
        track_ref.update(
            {
                "status": "completed",
                "isInstrumental": True,
                "lyrics": [],
                "lyricsLrc": "",
                "lyricsJson": json.dumps([]),
            }
        )
    else:
        payload = [asdict(line) for line in lines]
        lrc = to_lrc(lines)
        
        print(f"  → Saving with {len(lines)} lyrics")
        track_ref.update(
            {
                "status": "completed",
                "isInstrumental": False,
                "lyrics": payload,
                "lyricsLrc": lrc,
                "lyricsJson": json.dumps(payload),
            }
        )


def storage_trigger(event: dict, context: object | None = None) -> None:
    """Entry point for cloud trigger runtime."""
    file_path = event.get("name", "")
    metadata = event.get("metadata", {}) or {}
    track_id = metadata.get("trackId")

    if not file_path.startswith("audio/") or not track_id:
        return

    try:
        process_track(track_id, file_path)
    except Exception as exc:  # noqa: BLE001
        DB.collection("tracks").document(track_id).update(
            {
                "status": "failed",
                "error": str(exc),
            }
        )
        raise
