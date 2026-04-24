# Polybot Dashboard

Live monitoring dashboard for the Polybot prediction market trading system.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Hosted on Vercel

## Data Source
Reads directly from the Polybot GitHub repo's committed state files:
- `bankroll.txt` — current bankroll
- `daily_benchmarks.json` — today's activity
- `regime_state.json` — current market regime
- `killed_strategies.json` — disabled strategies

Updates every 60 seconds via Vercel's ISR (incremental static regeneration).

## Deploy to Vercel

### 1. Push this folder to GitHub
Create a new repo or add as a subfolder.

### 2. Import to Vercel
- Go to vercel.com → New Project
- Import the repo
- Framework: Next.js (auto-detected)

### 3. Set environment variables in Vercel
| Variable | Value |
|---|---|
| `GITHUB_REPO` | `zestyclose-steak7679/polybot-prediction-system` |
| `GITHUB_TOKEN` | Your GitHub PAT (repo:read scope) — optional but recommended |

### 4. Deploy
Vercel auto-deploys on every push.

## Local Development
```bash
npm install
cp .env.example .env.local
# Fill in GITHUB_TOKEN if you have one
npm run dev
```

Open http://localhost:3000

## GitHub Token
Without a token: 60 API requests/hour (fine for dashboard)
With a token: 5000 requests/hour

Create one at https://github.com/settings/tokens
Required scope: `repo` (read access)
