import Dashboard from './components/Dashboard'

export const revalidate = 30

async function getStats() {
  try {
    const res = await fetch(
      'https://polybot-prediction-system-production.up.railway.app/api/state',
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return null
    const raw = await res.json()

    const closed = (raw.closed_bets ?? []) as any[]
    const openBets = (raw.open_bets ?? []) as any[]
    const today = new Date().toISOString().slice(0, 10)

    // Fix avgCLV — exclude null CLV bets
    const clvBets = closed.filter((b: any) => b.clv != null)
    const avgCLV = clvBets.length
      ? clvBets.reduce((s: number, b: any) => s + b.clv, 0) / clvBets.length
      : 0

    const todayBets = closed.filter((b: any) => b.closed_at?.startsWith(today))
    const dailyPnL = todayBets.reduce((s: number, b: any) => s + (b.pnl ?? 0), 0)

    // Fix equity curve — compute from closed bets cumulative PnL
    const sortedClosed = [...closed]
      .filter((b: any) => b.closed_at)
      .sort((a: any, b: any) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime())

    let running = 1000
    const bankrollHistory = sortedClosed.map((b: any) => {
      running += (b.pnl ?? 0)
      return { time: b.closed_at?.slice(0, 16)?.replace('T', ' '), value: Math.round(running * 100) / 100 }
    })

    // Add current point
    if (bankrollHistory.length > 0) {
      bankrollHistory.push({ time: 'now', value: raw.bankroll ?? 1000 })
    }

    const signalsToday = (raw.bankroll_history ?? [])
      .filter((m: any) => m.time?.startsWith(today)).length

    return {
      bankroll: raw.bankroll ?? 1000,
      open_bets: openBets,
      closed_bets: closed,
      strategies: raw.strategies ?? [],
      bankrollHistory,
      // Last cycle timestamp from the bot
      lastCycleAt: raw.last_cycle_at ?? null,
      fetchedAt: new Date().toISOString(),
      // Stage 1.5 W1 — new observability fields from /api/state
      lastCycleStatus: raw.last_cycle_status ?? null,
      cycleSuccessRate24h: raw.cycle_success_rate_24h ?? null,
      sharpe30d: raw.sharpe_30d ?? null,
      maxDrawdownPct: raw.max_drawdown_pct ?? null,
      calibrationBuckets: raw.calibration_buckets ?? [],
      benchmarks: {
        dailyPnL: Math.round(dailyPnL * 100) / 100,
        dailyROI: raw.bankroll
          ? Math.round((dailyPnL / 1000) * 10000) / 100
          : 0,
        signalsToday,
        totalBets: closed.length,
        avgCLV: Math.round(avgCLV * 10000) / 10000,
        winRate: closed.length
          ? Math.round((closed.filter((b: any) =>
              b.result === 'win' || b.result === 'timeout_win').length / closed.length) * 1000) / 10
          : 0,
        timeoutRate: closed.length
          ? Math.round((closed.filter((b: any) =>
              b.result?.startsWith('timeout')).length / closed.length) * 1000) / 10
          : 0,
      },
    }
  } catch (err) {
    console.error('Error fetching stats:', err)
    return null
  }
}

export default async function Page() {
  const stats = await getStats()
  return <Dashboard initialData={stats} />
}
