# AI FitTrack v1.2.0 — Final Release

**Engineering Handoff:** ENG-AIFT-001-v1.2  
**Parent BA Handoff:** BA-AIFT-001 v1.2  
**Release Status:** Founder / Executive Office release approval received  
**Source State:** Frozen for final release; no feature changes are included in this packaging step.

## Contents

- `frontend/` — React + Vite source
- `backend/` — Node.js + Express + MongoDB source
- `postman/AI-FitTrack-v1.2.postman_collection.json` — Postman API collection
- `API_REFERENCE.md` — approved v1.2 API summary
- `RELEASE_NOTES_v1.2.0.md` — release notes and developer-verification evidence
- `SOURCE_FREEZE_SHA256.txt` — SHA-256 manifest for frozen `frontend/` and `backend/` files
- `BA-AIFT-001-v1.2-ENGINEERING-HANDOFF.md` — approved engineering handoff
- existing verification/runbook files used during engineering verification

## Prerequisites

- Node.js 24.x recommended (developer verification used Node.js 24.18.0)
- npm 11.x recommended (developer verification used npm 11.16.0)
- MongoDB available locally or through an authorized MongoDB deployment
- Valid Google Gemini API key for AI features

## Environment configuration

### Backend

From `backend/`, copy `.env.example` to `.env` and replace placeholders locally:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/aifittrack_poovarasan_team
JWT_SECRET=replace_with_a_secure_secret
GEMINI_API_KEY=replace_with_your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
```

Do not commit or distribute the real `.env` file.

### Frontend

From `frontend/`, copy `.env.example` to `.env` if required:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Install and run

### 1. Start MongoDB

Ensure the MongoDB service is running and the `MONGO_URI` in `backend/.env` is reachable.

### 2. Backend

```powershell
cd backend
npm install
npm run dev
```

Default API base URL:

```text
http://localhost:5000/api
```

Health check:

```text
GET http://localhost:5000/api/health
```

### 3. Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite normally serves the application at:

```text
http://localhost:5173
```

## Build and developer checks

Frontend:

```powershell
cd frontend
npm run build
npm run lint
```

Backend v1.2 contract verification:

```powershell
cd backend
npm run verify:v1.2
```

The package also contains `VERIFY_V12_WINDOWS.ps1` and `VERIFY_V12_API.ps1` from the verified v1.2 engineering handoff.

## Local test accounts

The repository includes `backend/scripts/seedDemoAdmin.js` for a local demo administrator.

Demo administrator used during developer verification:

```text
Email: demo.admin@poovarasanfittrack.local
Password: PoovarasanAdmin@12345
Role: admin
```

Demo user used during developer verification:

```text
Email: demo.user@poovarasanfittrack.local
Password: PoovarasanDemo@12345
Role: user
```

On a fresh database, a normal user can be created through the registration flow. The normal registration API always assigns the `user` role. For the demo administrator, use the provided local seed utility where appropriate:

```powershell
cd backend
node scripts/seedDemoAdmin.js
```

These are local/demo credentials only and must not be reused as production credentials.

## Approved v1.2 admin API surface

All routes below require a valid JWT for a current user whose database role is `admin`:

```text
GET /api/admin/dashboard
GET /api/admin/users
GET /api/admin/workouts
GET /api/admin/reports
GET /api/admin/system-health
```

Admin scope is read-only.

## Chatbot contract

```text
POST /api/chatbot
Authorization: Bearer <JWT>
```

Required request field:

- `message`

Approved optional context:

- `goal`
- `age`
- `heightCm`
- `currentWeightKg`
- `targetWeightKg`
- `experienceLevel`

The chatbot is fitness-only, stateless, provides motivation and safety guidance, and does not persist chat history.

## Postman

Import:

```text
postman/AI-FitTrack-v1.2.postman_collection.json
```

Set the collection variables as needed. Run **Register User** on a fresh database before **Login User**, and seed/create the local admin account before running Admin requests.

## Security packaging rules

The final release ZIP intentionally excludes:

- `.env`
- API keys / secrets
- `node_modules`
- `dist`
- build/cache directories
- logs
- backup files

`.env.example` files are included only with non-secret placeholders.
