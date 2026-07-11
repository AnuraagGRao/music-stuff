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
    from lyrics_transcriber import LyricsTranscriber
except ImportError:  # fallback path
    LyricsTranscriber = None

if not firebase_admin._apps:
    firebase_admin.initialize_app()

DB = firestore.client()
BUCKET = storage.bucket()


@dataclass
class LyricLine:
    time: float
    text: str


def parse_srt_like_lines(segments: Iterable[dict]) -> list[LyricLine]:
    lines: list[LyricLine] = []
    for segment in segments:
        text = (segment.get("text") or "").strip()
        if not text:
            continue
        lines.append(LyricLine(time=float(segment.get("start", 0.0)), text=text))
    return lines


def to_lrc(lines: list[LyricLine]) -> str:
    def stamp(seconds: float) -> str:
        minutes = int(seconds // 60)
        remainder = seconds - minutes * 60
        return f"[{minutes:02d}:{remainder:05.2f}]"

    return "\n".join(f"{stamp(line.time)}{line.text}" for line in lines)


def transcribe_audio(local_audio_path: str) -> list[LyricLine]:
    if LyricsTranscriber is None:
        raise RuntimeError("Install lyrics-transcriber or wire OpenAI Whisper client before deploy.")

    transcriber = LyricsTranscriber(model_name="base")
    result = transcriber.transcribe(local_audio_path)
    segments = result.get("segments", [])
    return parse_srt_like_lines(segments)


def process_track(track_id: str, file_path: str) -> None:
    track_ref = DB.collection("tracks").document(track_id)
    track_ref.update({"status": "processing"})

    blob = BUCKET.blob(file_path)

    with tempfile.TemporaryDirectory() as tmp_dir:
        local_path = os.path.join(tmp_dir, os.path.basename(file_path))
        blob.download_to_filename(local_path)
        lines = transcribe_audio(local_path)

    payload = [asdict(line) for line in lines]
    lrc = to_lrc(lines)

    track_ref.update(
        {
            "status": "completed",
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
