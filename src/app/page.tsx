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

  if (TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`
  }

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}`,
    { cache: 'no-store' }
  )

  if (!res.ok) return null
  return res.text()
}

function safeNumber(input: string | null, fallback = 0) {
  if (!input) return fallback

  const cleaned = input.replace(/[^0-9.-]+/g, '')
  const parsed = parseFloat(cleaned)

  return isNaN(parsed) ? fallback : parsed
}

async function getStats() {
  try {
    const [bankrollRaw, benchmarksRaw] = await Promise.all([
      fetchFile('bankroll.txt'),
      fetchFile('daily_benchmarks.json'),
    ])

    const bankroll = safeNumber(bankrollRaw, 1000)

    const benchmarks = benchmarksRaw
      ? JSON.parse(benchmarksRaw)
      : {}

    const start =
      typeof benchmarks.bankroll_start_of_day === 'number'
        ? benchmarks.bankroll_start_of_day
        : bankroll

    const dailyPnL = bankroll - start

    const dailyROI =
      start > 0 ? (dailyPnL / start) * 100 : 0

    return {
      bankroll,
      bankrollHistory: [],
      benchmarks: {
        dailyPnL,
        dailyROI,
        signalsToday: benchmarks.signals_today || 0,
      },
      regime: {
        confirmed: 'neutral',
        candidate: null,
        count: 0,
      },
      killedStrategies: [],
      lastUpdated: new Date().toISOString(),
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
