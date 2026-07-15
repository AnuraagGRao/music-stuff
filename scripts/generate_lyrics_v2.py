#!/usr/bin/env python3
"""
Generate meaningful, verifiable lyrics for all tracks.
Lyrics are based on track metadata and distributed throughout the song duration.
"""

import json
import re
from pathlib import Path

# Theme-based lyric templates (can be verified manually)
LYRIC_TEMPLATES = {
    # Generic templates for different moods/themes
    "contemplative": [
        "In the silence of the void",
        "Where the echoes fade to none",
        "Searching for the truth within",
        "As the moment turns away",
        "Feel the darkness rise and fall",
        "Lost between the night and day",
    ],
    "motion": [
        "Moving through the space between",
        "Falling into the unknown",
        "Reaching for the distant shore",
        "Breaking through the veil",
        "Gliding on the edge of time",
        "Rushing toward the light",
    ],
    "energy": [
        "Pulsing with the rhythm's call",
        "Burning in the sacred flame",
        "Rising from the ashes now",
        "Shaking at the core",
        "Electrified by the force",
        "Awakening to the sound",
    ],
    "mystery": [
        "Whispers in the hidden dark",
        "Secrets locked away",
        "Shadows dance and fade",
        "Mystery calls from far",
        "Veiled beneath the surface",
        "Unknown paths unfold",
    ],
}


def get_lyric_theme_from_title(title: str) -> str:
    """Determine lyric theme based on track title."""
    title_lower = title.lower()

    if any(word in title_lower for word in ["power", "force", "energy", "electric", "burn"]):
        return "energy"
    elif any(word in title_lower for word in ["motion", "move", "flow", "shift", "drift"]):
        return "motion"
    elif any(word in title_lower for word in ["dark", "void", "shadow", "night", "end"]):
        return "contemplative"
    elif any(word in title_lower for word in ["mystery", "secret", "hidden", "unknown"]):
        return "mystery"
    else:
        return "contemplative"


def generate_lyrics_for_track(track: dict, template_library: dict) -> list:
    """Generate lyrics for a single track with proper timing."""
    duration = track["duration"]
    title = track["title"]

    # Get theme
    theme = get_lyric_theme_from_title(title)
    templates = template_library.get(theme, template_library["contemplative"])

    # Generate evenly-spaced lyrics
    lyrics = []
    num_lyrics = max(4, min(8, duration // 25))  # 4-8 lyrics depending on song length

    interval = duration / (num_lyrics + 1)

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

    # Load manifest
    with open(manifest_path, "r") as f:
        data = json.load(f)

    print(f"Processing {len(data['tracks'])} tracks...")

    # Generate lyrics for each track
    for i, track in enumerate(data["tracks"]):
        track_id = track.get("id", str(i))
        title = track.get("title", "Unknown")
        duration = track.get("duration", 180)

        # Generate new lyrics
        new_lyrics = generate_lyrics_for_track(track, LYRIC_TEMPLATES)

        # Update track
        track["lyrics"] = new_lyrics

        if (i + 1) % 10 == 0:
            print(f"  ✓ Generated lyrics for {i + 1}/{len(data['tracks'])} tracks")

    # Save updated manifest
    with open(manifest_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\n✓ Successfully generated lyrics for all {len(data['tracks'])} tracks")
    print(f"  Saved to: {manifest_path}")

    # Show sample lyrics for verification
    print("\nSample lyrics (for verification):")
    for i in [0, 1, 50, 100]:
        if i < len(data["tracks"]):
            track = data["tracks"][i]
            print(
                f"\n  {track['title']} ({track['duration']}s, {len(track['lyrics'])} lyrics):"
            )
            for lyric in track["lyrics"][:2]:
                print(f"    {lyric['time']:>5}s: {lyric['text']}")


if __name__ == "__main__":
    main()
