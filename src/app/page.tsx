import Dashboard from './components/Dashboard'

export const revalidate = 60

const REPO =
  process.env.GITHUB_REPO ||
  'zestyclose-steak7679/polybot-prediction-system'

const TOKEN = process.env.GITHUB_TOKEN || ''

async function fetchFile(path: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
  }

  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}`,
    { cache: 'no-store' }
  )

  if (!res.ok) return null
  return res.text()
}

async function getStats() {
  try {
    const [bankrollRaw, benchmarksRaw] = await Promise.all([
      fetchFile('bankroll.txt'),
      fetchFile('daily_benchmarks.json'),
    ])

    const bankroll = bankrollRaw
      ? parseFloat(bankrollRaw.trim())
      : 1000

    const benchmarks = benchmarksRaw
      ? JSON.parse(benchmarksRaw)
      : {}

    return {
      bankroll,
      bankrollHistory: [],
      benchmarks: {
        dailyPnL:
          bankroll -
          (benchmarks.bankroll_start_of_day || bankroll),
        dailyROI: 0,
        signalsToday: benchmarks.signals_today || 0,
      },
      regime: { confirmed: 'neutral' },
      killedStrategies: [],
    }
  } catch {
    return null
  }
}

export default async function Page() {
  const stats = await getStats()

  return <Dashboard initialData={stats} />
}
