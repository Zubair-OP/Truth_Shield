# Truth Shield

Truth Shield is a production-ready AI-powered video authentication web application.
It extracts keyframes from uploaded videos, sends them in a single Gemini vision request,
and computes a forensic authenticity score from 0 to 10.

## Stack

- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express
- AI: Google Gemini (`@google/genai`)
- Video Processing: FFmpeg via `fluent-ffmpeg` + `ffmpeg-static`
- Uploads: Multer
- Progress Streaming: Server-Sent Events (SSE)

## Project Structure

```txt
truth-shield/
  client/
  server/
  .env.example
  README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- Gemini API key

## Setup

1. Open terminal at `truth-shield`.
2. Copy env file:

```bash
cp .env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example server/.env
```

3. Add your `GEMINI_API_KEY` in `server/.env`.
4. Install backend dependencies:

```bash
cd server
npm install
```

5. Install frontend dependencies:

```bash
cd ../client
npm install
```

## Run in Development

Backend (port 3001):

```bash
cd server
npm run dev
```

Frontend (port 5173):

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

## API

### `POST /api/analyze`

- Request: `multipart/form-data` with `video`
- Supports: mp4, mov, avi, webm
- Max size: 500MB (configurable)
- Response: `202 Accepted` with `{ jobId, eventStream }`

### `GET /api/analyze/events/:jobId`

- SSE stream with progress updates:
  - Uploading...
  - Extracting Frames...
  - Analyzing with AI...
  - Calculating Score...
- Final event includes `result` payload.

### `GET /api/health`

Returns:

```json
{ "status": "ok", "version": "1.0.0" }
```

## Notes

- Uses a single Gemini API call containing all extracted frames.
- Uses `maxOutputTokens: 2000` for analysis response.
- If Gemini returns malformed JSON, backend performs one simplification retry.
- Temporary upload and frame files are always cleaned up after analysis.
- CORS is restricted to `http://localhost:5173`.

## Production Tips

- Put backend behind a reverse proxy (Nginx/Caddy).
- Add request auth/rate limiting before public exposure.
- Monitor FFmpeg memory/CPU usage for large uploads.
- Store logs with request IDs for forensic auditability.
