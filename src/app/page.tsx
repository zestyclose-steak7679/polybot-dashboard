import Dashboard from './components/Dashboard'

export const revalidate = 0

async function getStats() {
  try {
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/stats`, {
      cache: 'no-store',
    })

    console.log("STATUS:", res.status)

    const data = await res.json()
    console.log("DATA:", data)

    return data
  } catch (err) {
    console.log("ERROR:", err)
    return { error: true }
  }
}

export default async function Page() {
  const stats = await getStats()

  // 👇 TEMP DEBUG UI
  return (
    <div style={{ color: 'white', padding: 20 }}>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  )
}
