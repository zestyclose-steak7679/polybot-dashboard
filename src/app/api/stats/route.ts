export const dynamic = 'force-dynamic'  
import { NextResponse } from 'next/server'

const REPO = process.env.GITHUB_REPO || 'zestyclose-steak7679/polybot-prediction-system'
const TOKEN = process.env.GITHUB_TOKEN || ''

async function fetchFile(path: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3.raw',
    'Cache-Control': 'no-cache',
  }
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}`,
    { headers, next: { revalidate: 60 } }
  )
  if (!res.ok) return null
  return res.text()
}

export async function GET() {
  try {
    const [bankrollRaw, benchmarksRaw, regimeRaw, killedRaw] = await Promise.all([
      fetchFile('bankroll.txt'),
      fetchFile('daily_benchmarks.json'),
      fetchFile('regime_state.json'),
      fetchFile('killed_strategies.json'),
    ])

    const bankroll = bankrollRaw ? parseFloat(bankrollRaw.trim()) : 1000
    const benchmarks = benchmarksRaw ? JSON.parse(benchmarksRaw) : {}
    const regime = regimeRaw ? JSON.parse(regimeRaw) : {}
    const killed = killedRaw ? JSON.parse(killedRaw) : {}

    // Build bankroll history from commits (last 20)
    const commitsRes = await fetch(
      `https://api.github.com/repos/${REPO}/commits?path=bankroll.txt&per_page=20`,
      {
        headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
        next: { revalidate: 300 }
      }
    )

    let bankrollHistory: { time: string; value: number }[] = []
    if (commitsRes.ok) {
      const commits = await commitsRes.json()
      const historyPromises = commits.slice(0, 15).map(async (commit: { sha: string; commit: { author: { date: string } } }) => {
        const fileRes = await fetch(
          `https://api.github.com/repos/${REPO}/contents/bankroll.txt?ref=${commit.sha}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3.raw',
              ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {})
            },
            next: { revalidate: 3600 }
          }
        )
        if (!fileRes.ok) return null
        const val = await fileRes.text()
        return {
          time: commit.commit.author.date,
          value: parseFloat(val.trim())
        }
      })
      const resolved = await Promise.all(historyPromises)
      bankrollHistory = resolved
        .filter(Boolean)
        .reverse() as { time: string; value: number }[]
    }

    // Derive stats from benchmarks
    const betsToday = benchmarks.bets_today || 0
    const signalsToday = benchmarks.signals_today || 0
    const bankrollStart = benchmarks.bankroll_start_of_day || bankroll
    const dailyPnL = bankroll - bankrollStart
    const dailyROI = bankrollStart > 0 ? (dailyPnL / bankrollStart) * 100 : 0

    return NextResponse.json({
      bankroll,
      bankrollHistory,
      benchmarks: {
        betsToday,
        signalsToday,
        bankrollStart,
        dailyPnL,
        dailyROI,
        timeoutsToday: benchmarks.timeouts_today || 0,
        closesToday: benchmarks.closes_today || 0,
        lastChecked: benchmarks.last_checked || null,
        date: benchmarks.date || null,
      },
      regime: {
        confirmed: regime.confirmed || 'unknown',
        candidate: regime.candidate || null,
        count: regime.count || 0,
      },
      killedStrategies: Object.keys(killed),
      lastUpdated: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Stats API error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
