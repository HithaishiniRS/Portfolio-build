# Hithiaishini — Developer Portfolio

A full-stack portfolio site with a visitor-reviews feature.

```
portfolio/
├── frontend/           # Static HTML + CSS + JS
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/            # Node.js + Express + MongoDB Atlas
│   ├── server.js
│   ├── config/db.js
│   ├── models/Review.js
│   ├── routes/reviews.js
│   ├── tests/
│   ├── package.json
│   └── .env.example
└── .github/
    └── workflows/
        └── ci-cd.yml   # GitHub Actions pipeline
```

---

## Local development

### Prerequisites
- Node.js ≥ 18
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1 — Clone & install

```bash
git clone https://github.com/<your-username>/<repo>.git
cd <repo>/backend
npm install
```

### 2 — Environment variables

```bash
cp .env.example .env
# Open .env and set your MONGODB_URI
```

### 3 — Run

```bash
npm run dev          # starts on http://localhost:5000
```

The Express server serves the `frontend/` folder as static files, so opening
`http://localhost:5000` shows the full site.

---

## Deploying to Render

> Auto-deploy is **off** — deployments are triggered manually via GitHub Actions.

### One-time Render setup

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   | Field | Value |
   |---|---|
   | **Root Directory** | `backend` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
4. Add environment variables in Render dashboard (Environment tab):
   - `MONGODB_URI` — your Atlas connection string
   - `NODE_ENV` — `production`
   - `ALLOWED_ORIGINS` — your Render URL e.g. `https://your-app.onrender.com`
5. **Turn off Auto-Deploy** in Settings → Build & Deploy
6. Note your **Service ID** from the Render URL (format: `srv-xxxxxxxx`)

### GitHub Secrets (one-time)

Go to your repo → **Settings → Secrets and variables → Actions** and add:

| Secret | Where to get it |
|---|---|
| `RENDER_API_KEY` | Render → Account Settings → API Keys |
| `RENDER_SERVICE_ID` | From your service URL on Render dashboard |

### Triggering a deploy

Every push to `main` that passes lint + tests will automatically call the Render
deploy API and poll until the service is live. You can watch progress in:

**GitHub → Actions tab → CI / CD Pipeline**

---

## API reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/reviews` | Fetch latest 50 reviews |
| `POST` | `/api/reviews` | Submit a new review |

### POST /api/reviews — request body

```json
{
  "name": "Alice",        // optional, defaults to "Anonymous"
  "comment": "Great!"    // required
}
```

---

## Running tests

```bash
cd backend
npm test
```

Tests use `mongodb-memory-server` — no real Atlas connection needed.
