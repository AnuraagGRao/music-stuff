#!/usr/bin/env python3
"""
Manually craft lyrics for "Alpha and Omega" as a test case.
This song is about beginning and end, duality, cycles.
"""

import json
from pathlib import Path

# Better lyrics for Alpha and Omega (30 second song)
alpha_omega_lyrics = [
    {"time": 6.0, "text": "From the beginning to the end"},
    {"time": 12.0, "text": "A circle turning round again"},
    {"time": 18.0, "text": "In between the start and fade"},
    {"time": 24.0, "text": "All that's made must pass away"},
]

def update_lyrics():
    manifest_path = Path("public/publicManifest.json")
    
    with open(manifest_path, "r") as f:
        data = json.load(f)
    
    # Find and update Alpha and Omega
    for track in data["tracks"]:
        if track["title"] == "Alpha and Omega":
            print(f"Found '{track['title']}' (ID: {track['id']}, {track['duration']}s)")
            print(f"\nOld lyrics:")
            for lyric in track["lyrics"]:
                print(f"  {lyric['time']:>5.1f}s: {lyric['text']}")
            
            track["lyrics"] = alpha_omega_lyrics
            
            print(f"\nNew lyrics:")
            for lyric in track["lyrics"]:
                print(f"  {lyric['time']:>5.1f}s: {lyric['text']}")
            
            break
    
    # Save
    with open(manifest_path, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Updated manifest")

if __name__ == "__main__":
    update_lyrics()
