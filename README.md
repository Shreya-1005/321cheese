# 321cheese Photobooth (MVP)

This repository contains a minimal photobooth MVP built with a React (Vite) frontend and an Express + MongoDB backend.

Structure
- `/client` - Vite + React frontend (uses `react-webcam`, `framer-motion`, Tailwind CDN)
- `/server` - Express API serving template configs from MongoDB via Mongoose

Quick start (development)

1. Start the server:

```bash
cd server
npm install
# ensure MONGODB_URI is set in your environment or use atlas-credentials.env at repo root
npm run seed   # seed example templates
npm run dev
```

2. Start the client (in a separate terminal):

```bash
cd client
npm install
npm run dev
```

Open your browser at the Vite URL (usually http://localhost:5173) and the server at http://localhost:5000

Production / Deployment

Recommended: use Docker to build a single production image that builds the client and runs the server which serves static files.

Build and run with Docker (example):

```bash
# set your MONGODB_URI in env or create atlas-credentials.env at repo root (DO NOT commit)
docker build -t photobooth .
docker run -e MONGODB_URI="${MONGODB_URI}" -p 5000:5000 photobooth
```

Or with docker-compose (reads `MONGODB_URI` from your environment):

```bash
MONGODB_URI="your_full_atlas_uri" docker-compose up --build
```

Notes
- The Express server serves the built frontend from `/client/dist` when `NODE_ENV=production`.
- Keep `atlas-credentials.env` private and DO NOT commit it. Use environment variables in your hosting provider instead.
- Ensure your MongoDB Atlas cluster allows the host IP (or use a managed host environment).
- For production, consider process managers like `pm2`, or run inside containers with an orchestrator.

Enjoy! — 321cheese