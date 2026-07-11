# music-stuff

Modern mobile-first music player for GitHub Pages + Firebase + Python lyrics service.

## Frontend

- React + Vite + Tailwind
- Zustand audio store
- Firebase Auth / Firestore / Storage integration
- Lucide + Radix UI primitives

## Local setup

```bash
npm install
npm run dev
```

Set Firebase variables in `.env`:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Deployment

- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Custom domain CNAME: `music.anuraaggrao.com`
- Firebase rules: `firestore.rules`, `storage.rules`
- Lyrics microservice blueprint: `lyrics_service/main.py`
