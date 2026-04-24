import Dashboard from './components/Dashboard'
export const dynamic = 'force-dynamic'
export const revalidate = 30

async function getStats() {
  try {
    const res = await fetch(
      'https://polybot-prediction-system-production.up.railway.app/api/state',
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return null
    const raw = await res.json()

    const closed = raw.closed_bets ?? []
    const today = new Date().toISOString().slice(0, 10)
    const todayBets = closed.filter((b: any) => b.closed_at?.startsWith(today))
    const dailyPnL = todayBets.reduce((s: number, b: any) => s + (b.pnl ?? 0), 0)
    const signalsToday = (raw.bankroll_history ?? []).filter((m: any) => m.time?.startsWith(today)).length
    const avgCLV = closed.length
      ? closed.reduce((s: number, b: any) => s + (b.clv ?? 0), 0) / closed.length
      : 0

    return {
      bankroll: raw.bankroll ?? 1000,
      open_bets: raw.open_bets ?? [],
      closed_bets: closed,
      strategies: raw.strategies ?? [],
      bankrollHistory: (raw.bankroll_history ?? []).map((m: any) => ({
        time: m.time,
        value: m.value,
      })),
      benchmarks: {
        dailyPnL: Math.round(dailyPnL * 100) / 100,
        dailyROI: raw.bankroll
          ? Math.round((dailyPnL / raw.bankroll) * 10000) / 100
          : 0,
        signalsToday,
        totalBets: closed.length,
        avgCLV: Math.round(avgCLV * 10000) / 10000,
      },
      regime: { confirmed: 'neutral', candidate: '—', count: 0 },
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
