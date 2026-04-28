# Polybot Dashboard

> Live monitoring dashboard for the Polybot prediction market trading system. Built with Next.js 14, deployed on Vercel, reads from the Polybot Railway backend.

🔗 **Live**: `https://polybot-prediction-system.vercel.app`  
🔗 **Backend**: `https://polybot-prediction-system-production.up.railway.app`  
🔗 **Bot Repo**: `https://github.com/zestyclose-steak7679/polybot-prediction-system`

---

## What It Shows

| Metric | Source | Notes |
|--------|--------|-------|
| Bankroll | `bankroll_log` table via Railway | Current paper trading balance |
| Daily PnL | Sum of `pnl` on bets closed today | Resets at UTC midnight |
| ROI | Daily PnL / current bankroll | Daily, not all-time |
| Avg CLV | Mean of non-null `clv` on closed bets | Excludes unresolved bets |
| Signals Today | Count of `bankroll_history` points today | Proxy — not exact signal count |
| Open Bets | Count of `result='open'` in `paper_bets` | Includes SHADOW + ACTIVE |
| Closed Bets | Total resolved bets | All-time |
| Equity Curve | Cumulative PnL from closed bets | Computed client-side from bet records |
| Strategy stats | Per-strategy bet count + CLV average | From `closed_bets` grouped by strategy |
| Recent trades | Last 10 closed bets | Question, strategy, side, PnL, CLV, result |

---

## Architecture

```
User browser
  → Vercel (Next.js 14 App Router)
    → page.tsx (Server Component, ISR 30s)
      → fetch() → Railway /api/state
        → webhook.py reads SQLite (polybot.db)
    → Dashboard.tsx (Client Component)
      → Recharts equity curve
      → Strategy bars
      → Bets table
```

### Key Files

| File | Role |
|------|------|
| `src/app/page.tsx` | Server component — fetches Railway, transforms data, passes to Dashboard |
| `src/app/components/Dashboard.tsx` | Client component — all rendering, charts, tables |
| `src/app/api/stats/route.ts` | API route (currently unused — do not call, divergent logic) |
| `src/app/layout.tsx` | Root layout, metadata, Vercel Speed Insights |
| `next.config.js` | Exposes `GITHUB_REPO` env var |
| `vercel.json` | Vercel build + deploy config |
| `tailwind.config.js` | Design tokens (green `#00ff88`, red `#ff3355`, dark bg) |

---

## Data Flow

`page.tsx` fetches `Railway /api/state` which returns:

```typescript
{
  bankroll: number
  open_bets: Bet[]        // result='open'
  closed_bets: Bet[]      // result!='open', last 50
  strategies: Strategy[]  // grouped by strategy_tag
  bankroll_history: { time: string, value: number }[]
}
```

`page.tsx` transforms this into the shape `Dashboard.tsx` expects:

```typescript
{
  bankroll: number
  open_bets: Bet[]
  closed_bets: Bet[]
  strategies: Strategy[]
  bankrollHistory: { time: string, value: number }[]
  benchmarks: {
    dailyPnL: number
    dailyROI: number
    signalsToday: number
    totalBets: number
    avgCLV: number          // computed excluding null CLV bets
  }
  regime: { confirmed: string, candidate: string, count: number }
}
```

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/zestyclose-steak7679/polybot-prediction-system
cd polybot-prediction-system

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Fill in:
# GITHUB_REPO=zestyclose-steak7679/polybot-prediction-system
# GITHUB_TOKEN=ghp_... (optional, increases rate limit)

# Run dev server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build
npm run start
```

---

## Environment Variables

| Variable | Required | Where set | Purpose |
|----------|----------|-----------|---------|
| `GITHUB_REPO` | Yes | Vercel dashboard + `next.config.js` | Source repo identifier |
| `GITHUB_TOKEN` | No | Vercel dashboard only (server-side) | Increases GitHub API rate limit from 60 to 5000/hr |

> ⚠️ **Security note**: `GITHUB_TOKEN` must NOT be added to `next.config.js` `env` block — that bakes it into the client bundle and exposes it publicly. Keep it server-side only via Vercel's environment variable settings.

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Next.js** (auto-detected)
4. Set environment variables:
   - `GITHUB_REPO` = `zestyclose-steak7679/polybot-prediction-system`
   - `GITHUB_TOKEN` = your PAT (repo read scope) — optional
5. Deploy

Vercel auto-deploys on every push to `main`.

---

## Design System

The dashboard uses a terminal/control room aesthetic:

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0a0a` | Page background |
| Surface | `#111111` | Cards, panels |
| Border | `#1e1e1e` | Card borders |
| Green | `#00ff88` | Positive values, active state |
| Red | `#ff3355` | Negative values, loss state |
| Amber | `#ffaa00` | Warning state |
| Font | JetBrains Mono | All text |

---

## Known Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| Equity curve shows flat line | Chart is misleading | Compute from cumulative closed_bet PnL sorted by `closed_at` |
| `avgCLV` includes null bets as 0 | Metric deflated vs backend | Filter `b.clv != null` before averaging |
| `route.ts` is dead code | Confusion for contributors | Delete or wire up as the actual data source |
| `force-dynamic` overrides `revalidate: 30` | Page re-fetches Railway on every request | Remove `force-dynamic`, let ISR cache work |
| "Last updated" shows client render time | Misleading freshness indicator | Pass server fetch timestamp from `page.tsx` |
| `question.slice(0, 50) + '...'` always appends `...` | Short questions show truncated incorrectly | Use conditional: `q.length > 50 ? q.slice(0, 50) + '...' : q` |
| No loading state | Blank screen on Railway cold start (3-5s) | Add skeleton UI or Suspense boundary |
| No error boundary | Railway outage = broken page | Wrap in `try/catch` with fallback UI |
| Mobile layout broken | Inline pixel values don't respond | Switch to Tailwind utility classes |

---

## Missing Features (Data Already Available)

The Railway `/api/state` endpoint returns enough data to power these — they just haven't been built yet:

- **Open positions table** — entry price, strategy, side, size, hold time computed from `placed_at`
- **Per-strategy CLV trend** — grouped bar chart showing CLV over last 10/20/50 bets per strategy
- **Win/loss streak indicator** — from `closed_bets` sorted by `closed_at`
- **Timeout rate** — % of closes via `timeout_win` / `timeout_loss` vs actual resolution
- **Regime indicator** — current confirmed regime from `regime_state.json`
- **Strategy kill status** — which strategies are ACTIVE vs disabled

---

## Two Dashboards Note

The Polybot backend repo also contains a **Flask dashboard** at `dashboard/server.py` that runs locally or on Railway. It has more features than this Next.js version:

| Feature | Flask dashboard | Next.js dashboard |
|---------|----------------|-------------------|
| Equity curve | ✅ Real data | ⚠️ Flat (bug) |
| CLV histogram | ✅ | ❌ |
| Alpha shadow table | ✅ | ❌ |
| Strategy Sharpe bars | ✅ | ⚠️ Basic |
| Open positions | ❌ | ❌ |
| Mobile | ❌ | ❌ |
| Public URL | Needs Railway | ✅ Vercel |

The Flask dashboard is accessed at `https://polybot-prediction-system-production.up.railway.app` (if running). The Next.js dashboard is the public-facing version.

---

## Roadmap

- [ ] Fix equity curve — cumulative PnL from `closed_bets`
- [ ] Fix `avgCLV` — exclude null values before averaging
- [ ] Delete `src/app/api/stats/route.ts` (dead code)
- [ ] Remove `force-dynamic` from `page.tsx`
- [ ] Add open positions table
- [ ] Add per-strategy CLV trend chart
- [ ] Add regime indicator card
- [ ] Add skeleton loading state
- [ ] Add error boundary for Railway outages
- [ ] Move to Tailwind classes (remove inline styles)
- [ ] Add mobile responsive layout

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2.3 | Framework (App Router) |
| React | 18.3.1 | UI |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.x | Styling (partially used) |
| Recharts | 2.10.x | Charts |
| Vercel | — | Hosting + ISR |
| JetBrains Mono | — | Terminal font |
