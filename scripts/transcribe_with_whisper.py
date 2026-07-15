#!/usr/bin/env python3
"""
Transcribe MP3 files using faster-whisper and generate lyrics from transcriptions.
"""

import json
from pathlib import Path
from faster_whisper import WhisperModel

def transcribe_audio(audio_path: str, model_size: str = "tiny") -> dict:
    """Transcribe audio file and return segments with timestamps."""
    print(f"  Transcribing: {Path(audio_path).name}")
    
    try:
        # Load model (tiny is fastest, base is more accurate)
        model = WhisperModel(model_size, device="cpu", compute_type="int8")
        
        # Transcribe
        segments, info = model.transcribe(
            audio_path, 
            language="en"
        )
        
        # Convert segments to list (generator to list)
        segments_list = list(segments)
        
        if not segments_list:
            return {"success": False, "text": "", "segments": []}
        
        # Combine all text
        full_text = " ".join([seg.text.strip() for seg in segments_list])
        
        return {
            "success": True,
            "text": full_text,
            "segments": [
                {
                    "start": seg.start,
                    "end": seg.end,
                    "text": seg.text.strip()
                }
                for seg in segments_list
                if seg.text.strip()  # Only include non-empty segments
            ]
        }
    except Exception as e:
        print(f"    Error: {e}")
        return {"success": False, "text": "", "segments": [], "error": str(e)}

def chunk_lyrics(segments: list, duration: int, target_chunks: int = 4) -> list:
    """Break transcription into lyrics-sized chunks with proper timestamp coverage."""
    if not segments:
        return []
    
    lyrics = []
    
    # If we have fewer segments than target chunks, return as-is, evenly distributed
    if len(segments) <= target_chunks:
        interval = duration / (len(segments) + 1)
        for i, seg in enumerate(segments):
            lyrics.append({
                "time": round(interval * (i + 1), 1),
                "text": seg["text"].strip()
            })
        return lyrics
    
    # Distribute segments into target chunks as evenly as possible
    chunk_size = len(segments) / target_chunks
    
    for chunk_idx in range(target_chunks):
        start_idx = int(chunk_idx * chunk_size)
        end_idx = int((chunk_idx + 1) * chunk_size)
        
        # Handle rounding for last chunk
        if chunk_idx == target_chunks - 1:
            end_idx = len(segments)
        
        if start_idx < len(segments):
            chunk_segments = segments[start_idx:end_idx]
            
            if chunk_segments:
                # Use the start time of the first segment in this chunk
                chunk_time = chunk_segments[0]["start"]
                
                # Combine text from all segments in this chunk
                chunk_text = " ".join([seg["text"] for seg in chunk_segments])
                chunk_text = chunk_text.strip()
                
                if chunk_text:
                    lyrics.append({
                        "time": round(chunk_time, 1),
                        "text": chunk_text
                    })
    
    return lyrics

def main():
    manifest_path = Path("public/publicManifest.json")
    audio_dir = Path("public/audio/mp3")
    
    if not manifest_path.exists():
        print(f"Error: {manifest_path} not found")
        return
    
    if not audio_dir.exists():
        print(f"Error: {audio_dir} not found")
        return
    
    # Load manifest
    with open(manifest_path, "r") as f:
        data = json.load(f)
    
    print(f"Transcribing {len(data['tracks'])} tracks with faster-whisper...\n")
    print("=" * 70)
    
    successful = 0
    failed = 0
    
    for i, track in enumerate(data["tracks"]):
        title = track.get("title", "Unknown")
        duration = track.get("duration", 180)
        audio_url = track.get("audioUrl", "")
        
        if not audio_url:
            print(f"⊘ {i+1:3d}. {title:40s} - No audio URL")
            failed += 1
            continue
        
        # Build full path to MP3
        filename = audio_url.split("/")[-1]
        audio_path = audio_dir / filename
        
        if not audio_path.exists():
            print(f"⊘ {i+1:3d}. {title:40s} - File not found")
            failed += 1
            continue
        
        print(f"→ {i+1:3d}. {title:40s} ({duration:3d}s)", end=" ")
        
        # Transcribe
        result = transcribe_audio(str(audio_path), model_size="tiny")
        
        if result["success"] and result["segments"]:
            # Generate lyrics from segments
            lyrics = chunk_lyrics(result["segments"], duration, target_chunks=4)
            track["lyrics"] = lyrics
            successful += 1
            
            print(f"✓ {len(lyrics)} lyrics")
            # Show preview
            if lyrics:
                preview = lyrics[0]['text'][:50]
                print(f"     └─ {preview}...")
        else:
            print(f"✗ No segments extracted")
            failed += 1
        
        # Save progress every 5 tracks
        if (i + 1) % 5 == 0:
            with open(manifest_path, "w") as f:
                json.dump(data, f, indent=2)
            print(f"    └─ Checkpointed: {i+1}/{len(data['tracks'])}")
    
    # Final save
    with open(manifest_path, "w") as f:
        json.dump(data, f, indent=2)
    
    print("=" * 70)
    print(f"Transcription Complete!")
    print(f"  ✓ Successful: {successful:3d}")
    print(f"  ✗ Failed:     {failed:3d}")
    print(f"  Total:       {len(data['tracks']):3d}")
    print("=" * 70)

if __name__ == "__main__":
    main()
