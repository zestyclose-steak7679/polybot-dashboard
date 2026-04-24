import Dashboard from './components/Dashboard'

export const revalidate = 30

async function getStats() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://zestyclose-steak7679-polybot-dashboard-oc0h180ef.vercel.app'}/api/stats`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    return res.json()
  } catch (err) {
    console.error('Error fetching stats:', err)
    return null
  }
}

export default async function Page() {
  const stats = await getStats()
  return <Dashboard initialData={stats} />
}
