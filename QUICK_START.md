# Quick Start Guide - Music Player

## Prerequisites

- Node.js 18+ with npm
- Firebase project setup (credentials already in `.env.local`)
- Modern web browser

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Server will run at `http://localhost:5175` (or next available port)

### 3. Run Tests (Optional)
```bash
npm test          # Interactive test runner with UI
npm test:run      # One-time test run
```

## Features Overview

### 🎵 As a Guest (No Login)

1. **Browse Music Library**
   - Search by track name, artist, or album
   - View recently played history
   - Add tracks to favorites

2. **Play & Control**
   - Click track to play
   - Use player bar: play/pause, skip next/previous
   - Adjust volume with slider
   - Scrub timeline to jump to position
   - Enable shuffle (randomize without repeating)
   - Cycle repeat modes (Off → All → One)

3. **View Live Lyrics**
   - See synced lyrics while playing
   - Lyrics auto-scroll to active line
   - View "No lyrics available" if not provided

### 🔐 Sign In with Google

1. Click **"Sign in with Google"** button (top right)
2. Complete Google authentication flow
3. Automatically merged with your personal library

### 📤 Upload Music (After Login)

1. Go to **Upload Dashboard** section
2. Drag & drop MP3/WAV/OGG/M4A files OR click "Choose File"
3. See upload progress
4. Track appears in library immediately after upload

### ❤️ Manage Favorites

- Click heart icon on any track to favorite/unfavorite
- View all favorites in **Favorites** sidebar panel
- Persists with your account when logged in

## File Format Reference

### Supported Audio Formats
- MP3 (audio/mpeg)
- WAV (audio/wav)
- OGG (audio/ogg)
- M4A (audio/mp4)
- Maximum file size: 100MB

### LRC Lyrics Format (For Developer)
```
[00:12.50]First line of lyrics
[00:25.00]Second line of lyrics
[00:39.00]Third line of lyrics
```
Format: `[mm:ss.cc]Lyrics text`
- mm = minutes (2 digits)
- ss = seconds (2 digits)
- cc = centiseconds (2 digits, optional)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Space | Play/Pause (when player focused) |
| → | Skip next |
| ← | Skip previous |

## Troubleshooting

### Audio won't play
- Check browser permits audio playback
- Ensure file URL is accessible
- Try a different browser

### Upload fails
- Check file size (max 100MB)
- Verify file format is supported
- Ensure internet connection is stable
- Check Firebase configuration in `.env.local`

### Search not working
- Make sure at least one character entered
- Check spelling of artist/track name
- Try broader search terms

### Lyrics not showing
- Track may not have lyrics uploaded
- LRC file format might be invalid
- Check track metadata in Firestore

## Database Structure

### Firestore Collections

**`tracks`** collection
```typescript
{
  id: string                    // Auto-generated doc ID
  title: string                 // Song title
  artist: string                // Artist name
  album: string                 // Album name
  duration: number              // Seconds
  audioUrl: string              // Firebase Storage URL
  coverUrl: string              // Album art URL
  ownerId: string               // User UID or "public"
  lyricsStatus: string          // "pending" | "processing" | "ready"
  lyrics: LyricLine[]           // Parsed lyrics
  createdAt: timestamp          // Creation time
  updatedAt: timestamp          // Last update
}
```

### Firebase Storage Structure
```
gs://music-stuff-7420.firebasestorage.app/
  audio/
    {userId}/
      {timestamp}-{filename}.mp3
      {timestamp}-{filename}.wav
```

## Development Commands

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run test       # Run tests with watch/UI
npm run test:run   # Run tests once (CI mode)
npm run lint       # Run ESLint (oxlint)
```

## Build Output

Production build creates optimized files in `dist/`:
- `index.html` - Entry point
- `assets/index-*.js` - Bundled JavaScript
- `assets/index-*.css` - Compiled styles

## Performance Tips

- Lyrics auto-scroll disabled for low-power devices
- Large audio files (>50MB) may have slower uploads
- Use modern browser (Chrome, Firefox, Safari, Edge)
- Keep cache enabled for offline support

## Privacy & Security

- All uploads require Google authentication
- User tracks only visible to their own account
- Public tracks accessible to everyone
- Favorites stored in user's Firestore profile
- No tracking or analytics (unless added separately)

## Support & Issues

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify Firebase credentials in `.env.local`
3. Ensure Firestore is enabled in Firebase Console
4. Check Firebase Storage & Firestore Security Rules
5. Review `UPGRADE_DOCUMENTATION.md` for detailed info

## Architecture Overview

```
Frontend (React + TypeScript)
├── State (Zustand)
│   └── Audio playback state
├── Hooks
│   ├── useAudioPlayer - HTML5 Audio API
│   └── useFirebaseMusic - Auth & uploads
└── Components
    ├── Player - Controls
    ├── UploadZone - File staging
    ├── LyricsView - Live lyrics
    ├── TrackRow - Track item
    └── More...

Firebase Backend
├── Authentication - Google Sign-In
├── Firestore - Track metadata
└── Storage - Audio files
```

---

Built with ❤️ for the Weekend Stuff series.
