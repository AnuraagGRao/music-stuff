"""
Setup and utility scripts for the music player
These scripts were used during development for data processing and manifest generation
They are preserved here for reference and future use

MANIFEST GENERATION PIPELINE:
1. extract_thumbnails.py - Extract JPG thumbnails from MP4 files
2. generate_lyrics.py - Generate thematic lyrics for all tracks
3. extract_durations.py - Extract accurate duration from MP3 files using mutagen

USAGE:
  cd z:\Coding\Weekend Stuff\ThirdQ\music-stuff
  uv run python scripts/extract_durations.py
  uv run python scripts/generate_lyrics.py
  uv run python scripts/extract_thumbnails.py

DEPENDENCIES:
  - mutagen (for MP3 metadata)
  - PIL/Pillow (for image processing)
"""
