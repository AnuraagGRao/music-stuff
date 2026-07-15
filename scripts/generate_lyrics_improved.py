#!/usr/bin/env python3
"""
Generate meaningful, title-based lyrics for all tracks.
Each track gets unique lyrics based on its title, with multiple themes.
"""

import json
import re
from pathlib import Path

# Build a library of lyric phrases organized by mood/theme
LYRIC_DATABASE = {
    "ethereal": [
        "Floating through the {word}",
        "Drifting in the {word}",
        "Lost within the {word}",
        "Suspended in the {word}",
    ],
    "contemplative": [
        "In the silence of the {word}",
        "Where the {word} fades to none",
        "Searching through the {word}",
        "Beyond the {word}",
    ],
    "energetic": [
        "Pulsing through the {word}",
        "Burning with the {word}",
        "Rising from the {word}",
        "Breaking through the {word}",
    ],
    "mystical": [
        "Whispers of the {word}",
        "Secrets hidden in the {word}",
        "Mystery of the {word}",
        "Veiled within the {word}",
    ],
    "motion": [
        "Moving through the {word}",
        "Falling into the {word}",
        "Reaching for the {word}",
        "Gliding past the {word}",
    ],
}

# Keywords to themes mapping
KEYWORD_TO_THEME = {
    # Ethereal
    "void": "ethereal", "drift": "ethereal", "float": "ethereal", "space": "ethereal",
    "sky": "ethereal", "wind": "ethereal", "whisper": "ethereal", "echo": "ethereal",
    
    # Contemplative  
    "silence": "contemplative", "mind": "contemplative", "soul": "contemplative",
    "thought": "contemplative", "zen": "contemplative", "peace": "contemplative",
    
    # Energetic
    "power": "energetic", "energy": "energetic", "force": "energetic", "surge": "energetic",
    "burn": "energetic", "pulse": "energetic", "thunder": "energetic", "storm": "energetic",
    
    # Mystical
    "mystery": "mystical", "secret": "mystical", "hidden": "mystical", "dark": "mystical",
    "shadow": "mystical", "night": "mystical", "moon": "mystical", "magic": "mystical",
    
    # Motion
    "motion": "motion", "move": "motion", "flow": "motion", "wave": "motion",
    "orbit": "motion", "shift": "motion", "spiral": "motion", "cascade": "motion",
}

def get_theme_from_title(title: str) -> str:
    """Determine lyric theme based on keywords in track title."""
    title_lower = title.lower()
    
    # Check for keywords
    for keyword, theme in KEYWORD_TO_THEME.items():
        if keyword in title_lower:
            return theme
    
    # Default to contemplative
    return "contemplative"

def extract_key_word_from_title(title: str) -> str:
    """Extract a meaningful word from the title to use in lyrics."""
    # Remove common words and get significant words
    stop_words = {"the", "and", "or", "of", "a", "an", "in", "on", "at", "to", "for"}
    
    # Split on spaces, hyphens, underscores
    words = re.split(r'[\s\-_]', title.lower())
    
    # Get longest word that's not a stop word
    significant_words = [w for w in words if w and len(w) > 2 and w not in stop_words]
    
    if significant_words:
        return significant_words[0]
    return "moment"

def generate_lyrics_for_track(track: dict) -> list:
    """Generate unique, title-based lyrics for a track."""
    duration = track["duration"]
    title = track["title"]
    
    theme = get_theme_from_title(title)
    key_word = extract_key_word_from_title(title)
    
    # Get lyric templates for this theme
    templates = LYRIC_DATABASE.get(theme, LYRIC_DATABASE["contemplative"])
    
    # Vary the number of lyrics based on song length
    # Shorter songs get fewer lyrics, longer get more
    num_lyrics = max(4, min(8, duration // 25))
    interval = duration / (num_lyrics + 1)
    
    lyrics = []
    
    for i in range(num_lyrics):
        time = interval * (i + 1)
        
        # Vary key word if it's repeated
        if i > 0 and i % 2 == 0:
            # Use different keywords for some lyrics
            alt_words = extract_key_word_from_title(title)
            if len(title.split()) > 1:
                # Try to get a different word from title
                all_words = re.split(r'[\s\-_]', title.lower())
                alt_words = [w for w in all_words if len(w) > 2]
                if len(alt_words) > 1:
                    key_word = alt_words[i % len(alt_words)]
        
        # Use template with key word
        template = templates[i % len(templates)]
        lyric_text = template.format(word=key_word)
        
        lyrics.append({
            "time": round(time, 1),
            "text": lyric_text
        })
    
    return lyrics

def main():
    manifest_path = Path("public/publicManifest.json")
    
    if not manifest_path.exists():
        print(f"Error: {manifest_path} not found")
        return
    
    with open(manifest_path, "r") as f:
        data = json.load(f)
    
    print(f"Generating title-based lyrics for {len(data['tracks'])} tracks...\n")
    
    # Generate lyrics for each track
    for i, track in enumerate(data["tracks"]):
        title = track.get("title", "Unknown")
        duration = track.get("duration", 180)
        
        new_lyrics = generate_lyrics_for_track(track)
        track["lyrics"] = new_lyrics
        
        if (i + 1) % 10 == 0:
            print(f"✓ Generated lyrics for {i + 1}/{len(data['tracks'])} tracks")
    
    # Save updated manifest
    with open(manifest_path, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Successfully generated lyrics for all {len(data['tracks'])} tracks")
    
    # Show samples
    print("\nSample lyrics (for verification):")
    for i in [0, 1, 50, 100]:
        if i < len(data["tracks"]):
            track = data["tracks"][i]
            print(f"\n  {track['title']} ({track['duration']}s):")
            for lyric in track["lyrics"][:3]:
                print(f"    {lyric['time']:>6.1f}s: {lyric['text']}")

if __name__ == "__main__":
    main()
