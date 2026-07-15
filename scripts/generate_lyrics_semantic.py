#!/usr/bin/env python3
"""
Enhanced lyrics generation with semantic theme mapping.
Maps song concepts to meaningful lyric patterns.
"""

import json
import re
from pathlib import Path

# Semantic theme database - title patterns map to lyric concepts
SEMANTIC_THEMES = {
    # Duality/Philosophy
    ("alpha", "omega"): {
        "name": "duality",
        "lyrics": [
            "From the beginning to the end",
            "A circle turning round again",
            "In between the start and fade",
            "All that's made must pass away",
        ]
    },
    
    # Cosmic/Space themes
    ("cosmic", "void", "space", "infinite", "universe", "star", "galaxy"): {
        "name": "cosmic",
        "lyrics": [
            "Lost in the cosmic sea",
            "Floating through infinity",
            "Reaching toward the stars",
            "Where all things dissolve",
        ]
    },
    
    # Lattice/Structure themes
    ("lattice", "grid", "pattern", "structure", "align"): {
        "name": "crystalline",
        "lyrics": [
            "Crystalline patterns forming",
            "Points converging in space",
            "Geometric harmony",
            "All aligned as one",
        ]
    },
    
    # Energy/Power themes
    ("power", "energy", "force", "surge", "thunder", "electric", "burn"): {
        "name": "energy",
        "lyrics": [
            "Pulsing with raw power",
            "Energy surging through",
            "Lightning in motion",
            "Burning with intensity",
        ]
    },
    
    # Journey/Motion themes
    ("journey", "path", "way", "travel", "drift", "flow", "move", "ascending", "descent"): {
        "name": "motion",
        "lyrics": [
            "Moving ever forward",
            "Following the winding path",
            "Each step a revelation",
            "The journey calls to us",
        ]
    },
    
    # Shadow/Darkness themes
    ("shadow", "dark", "void", "night", "black", "eclipse", "fade"): {
        "name": "shadow",
        "lyrics": [
            "Shadows dance and play",
            "In the darkness we find light",
            "Fading into nothing",
            "Where secrets sleep untold",
        ]
    },
    
    # Harmony/Unity themes
    ("harmony", "unity", "together", "sync", "accord", "balance"): {
        "name": "harmony",
        "lyrics": [
            "Finding perfect harmony",
            "All things united",
            "Dancing in perfect sync",
            "Balance in the flow",
        ]
    },
    
    # Time themes
    ("time", "hour", "moment", "second", "age", "era", "epoch"): {
        "name": "temporal",
        "lyrics": [
            "Time moves ever onward",
            "Each moment matters",
            "The clock keeps turning",
            "Yesterday becomes tomorrow",
        ]
    },
}

def find_semantic_theme(title: str) -> dict | None:
    """Find matching semantic theme for a song title."""
    title_lower = title.lower()
    
    for keywords, theme in SEMANTIC_THEMES.items():
        for keyword in keywords:
            if keyword in title_lower:
                return theme
    
    return None

def generate_lyrics_for_track(track: dict) -> list:
    """Generate lyrics with semantic understanding."""
    duration = track["duration"]
    title = track["title"]
    
    # Check for semantic theme first
    theme = find_semantic_theme(title)
    
    if not theme:
        # Fallback to generic contemplative lyrics
        templates = [
            "In the depths of being",
            "Where silence speaks volumes",
            "Searching for meaning",
            "In the space between",
        ]
    else:
        templates = theme["lyrics"]
    
    # Determine number of lyrics based on duration
    num_lyrics = max(4, min(8, duration // 25))
    interval = duration / (num_lyrics + 1)
    
    lyrics = []
    for i in range(num_lyrics):
        time = interval * (i + 1)
        lyric_text = templates[i % len(templates)]
        lyrics.append({"time": round(time, 1), "text": lyric_text})
    
    return lyrics

def main():
    manifest_path = Path("public/publicManifest.json")
    
    if not manifest_path.exists():
        print(f"Error: {manifest_path} not found")
        return
    
    with open(manifest_path, "r") as f:
        data = json.load(f)
    
    print(f"Generating semantic-aware lyrics for {len(data['tracks'])} tracks...\n")
    
    theme_counts = {}
    
    for i, track in enumerate(data["tracks"]):
        title = track.get("title", "Unknown")
        duration = track.get("duration", 180)
        
        new_lyrics = generate_lyrics_for_track(track)
        track["lyrics"] = new_lyrics
        
        # Track which themes are used
        theme = find_semantic_theme(title)
        if theme:
            theme_name = theme["name"]
            theme_counts[theme_name] = theme_counts.get(theme_name, 0) + 1
        
        if (i + 1) % 10 == 0:
            print(f"✓ Generated lyrics for {i + 1}/{len(data['tracks'])} tracks")
    
    with open(manifest_path, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Successfully generated lyrics for all {len(data['tracks'])} tracks")
    print(f"\nTheme distribution:")
    for theme, count in sorted(theme_counts.items(), key=lambda x: -x[1]):
        print(f"  {theme}: {count} tracks")
    
    # Show samples
    print("\nSample lyrics:")
    for i in [0, 2, 50, 100]:
        if i < len(data["tracks"]):
            track = data["tracks"][i]
            theme = find_semantic_theme(track["title"])
            print(f"\n  {track['title']} ({track['duration']}s) - {theme['name'] if theme else 'generic'}:")
            for lyric in track["lyrics"][:2]:
                print(f"    {lyric['time']:>6.1f}s: {lyric['text']}")

if __name__ == "__main__":
    main()
