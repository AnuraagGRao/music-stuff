"""
Lyrics transcription service using faster-whisper with VAD (Voice Activity Detection).

Features:
- Voice Activity Detection (VAD) filters out non-speech sections
- Disables previous text conditioning to prevent hallucinations
- Aggressive no_speech threshold to catch instrumental tracks
- Detects instrumental-only tracks automatically
"""

from __future__ import annotations

from typing import Any
from faster_whisper import WhisperModel


class LyricsTranscriber:
    """Transcribe audio to lyrics using Whisper with VAD enabled."""

    def __init__(self, model_name: str = "base") -> None:
        """Initialize the Whisper model.
        
        Args:
            model_name: Model size ('tiny', 'base', 'small', 'medium', 'large')
        """
        self.model = WhisperModel(model_name, device="cpu", compute_type="int8")

    def transcribe(self, audio_path: str) -> dict[str, Any]:
        """Transcribe audio to lyrics with VAD and anti-hallucination parameters.
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Dictionary with 'segments' list containing transcribed lyrics
        """
        try:
            # Transcribe with VAD and anti-hallucination parameters
            segments, info = self.model.transcribe(
                audio_path,
                
                # 1. Enable Voice Activity Detection (the bouncer)
                # VAD filters out non-speech sections BEFORE they reach Whisper
                vad_filter=True,
                vad_parameters=dict(
                    # Treat 500ms of quiet as a break between speech segments
                    min_silence_duration_ms=500,
                    # How strict the voice detector is (0.0 to 1.0)
                    # 0.5 is balanced; lower (0.3) = more permissive, higher (0.7) = stricter
                    threshold=0.5
                ),
                
                # 2. Prevent hallucination loops
                # If Whisper makes a mistake and generates "Thank you", this prevents
                # it from using that as context for the next 30 seconds
                condition_on_previous_text=False,
                
                # 3. Aggressively flag non-speech segments
                # If Whisper detects no speech, it returns empty
                # 0.6 = require 60% confidence of speech presence
                no_speech_threshold=0.6,
                
                # Language hint (optional, helps Whisper narrow down)
                language="en",
            )
            
            # Convert segments to list of dictionaries
            result_segments = []
            has_speech = False
            
            for segment in segments:
                text = (segment.text or "").strip()
                
                # Skip empty segments
                if not text:
                    continue
                
                has_speech = True
                result_segments.append({
                    "id": segment.id,
                    "start": segment.start,
                    "end": segment.end,
                    "text": text,
                    "confidence": segment.confidence,
                })
            
            return {
                "segments": result_segments,
                "language": info.language,
                "duration": info.duration,
                "is_instrumental": not has_speech,  # Mark instrumental tracks
            }
            
        except Exception as e:
            print(f"Error transcribing {audio_path}: {e}")
            return {
                "segments": [],
                "language": None,
                "duration": 0,
                "is_instrumental": True,
                "error": str(e),
            }


def is_instrumental_from_result(result: dict[str, Any]) -> bool:
    """Check if transcription result indicates an instrumental track.
    
    Args:
        result: Result dictionary from transcribe()
        
    Returns:
        True if track is likely instrumental
    """
    return result.get("is_instrumental", True) or len(result.get("segments", [])) == 0
