'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

interface StatsData {
  bankroll: number
  bankrollHistory: { time: string; value: number }[]
  benchmarks: {
    betsToday: number
    signalsToday: number
    bankrollStart: number
    dailyPnL: number
    dailyROI: number
    timeoutsToday: number
    closesToday: number
    lastChecked: string | null
    date: string | null
  }
  regime: {
    confirmed: string
    candidate: string | null
    count: number
  }
  killedStrategies: string[]
  lastUpdated: string
}

const STRATEGIES = ['momentum', 'reversal', 'volume_spike']

const REGIME_COLORS: Record<string, string> = {
  neutral: '#666666',
  trending: '#00aaff',
  mean_reverting: '#aa55ff',
  volatile: '#ffaa00',
  illiquid_spike: '#ff6600',
  unknown: '#444444',
}

function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals)
}

function fmtMoney(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }) + ' IST'
  } catch { return '—' }
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Asia/Kolkata'
    })
  } catch { return '—' }
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${active ? 'bg-green-400' : 'bg-red-500'}`}
      style={{ backgroundColor: active ? 'var(--green)' : 'var(--red)' }}
    />
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--subtle)' }}>
      {children}
    </span>
  )
}

function Divider() {
  return <div className="w-full h-px" style={{ background: 'var(--border)' }} />
}

function StatBlock({
  label, value, sub, color
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <Label>{label}</Label>
      <span
        className="stat-value text-2xl font-bold tracking-tight"
        style={{ color: color || 'var(--text)', fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: 'var(--subtle)' }}>{sub}</span>
      )}
    </div>
  )
}

function StrategyBadge({
  name, killed
}: {
  name: string
  killed: boolean
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded text-xs"
      style={{
        background: killed ? 'rgba(255,51,85,0.08)' : 'rgba(0,255,136,0.06)',
        border: `1px solid ${killed ? 'rgba(255,51,85,0.2)' : 'rgba(0,255,136,0.15)'}`,
      }}
    >
      <span style={{ color: killed ? 'var(--red)' : 'var(--green)' }}>
        {killed ? '✕' : '●'}
      </span>
      <span style={{ color: 'var(--text)' }}>{name}</span>
      <span
        className="ml-auto text-xs"
        style={{ color: killed ? 'var(--red)' : 'var(--subtle)' }}
      >
        {killed ? 'KILLED' : 'ACTIVE'}
      </span>
    </div>
  )
}

function BankrollChart({ data }: { data: { time: string; value: number }[] }) {
  if (!data || data.length < 2) {
    return (
      <div
        className="flex items-center justify-center h-32 text-xs"
        style={{ color: 'var(--subtle)' }}
      >
        AWAITING HISTORY DATA
      </div>
    )
  }

  const startVal = data[0]?.value || 1000
  const chartData = data.map((d, i) => ({
    i,
    value: d.value,
    time: fmtTime(d.time),
  }))

  const minVal = Math.min(...chartData.map(d => d.value))
  const maxVal = Math.max(...chartData.map(d => d.value))
  const isProfit = data[data.length - 1]?.value >= startVal

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="i" hide />
        <YAxis
          domain={[minVal * 0.998, maxVal * 1.002]}
          hide
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div style={{ color: 'var(--subtle)' }}>{payload[0].payload.time}</div>
                <div style={{ color: isProfit ? 'var(--green)' : 'var(--red)' }}>
                  {fmtMoney(payload[0].value as number)}
                </div>
              </div>
            )
          }}
        />
        <ReferenceLine y={startVal} stroke="#2a2a2a" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="value"
          stroke={isProfit ? 'var(--green)' : 'var(--red)'}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: isProfit ? 'var(--green)' : 'var(--red)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function RegimeBadge({ regime }: { regime: string }) {
  const color = REGIME_COLORS[regime] || '#666666'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
      }}
    >
      <span className="w-1 h-1 rounded-full" style={{ background: color }} />
      {regime.toUpperCase().replace('_', ' ')}
    </span>
  )
}

function ActionItem({ text, severity }: { text: string; severity: 'ok' | 'warn' | 'critical' }) {
  const colors = {
    ok: 'var(--green)',
    warn: 'var(--amber)',
    critical: 'var(--red)',
  }
  const prefix = { ok: '→', warn: '⚠', critical: '!' }
  return (
    <div className="flex items-start gap-2 text-xs py-1">
      <span style={{ color: colors[severity], flexShrink: 0 }}>{prefix[severity]}</span>
      <span style={{ color: severity === 'ok' ? 'var(--subtle)' : 'var(--text)' }}>{text}</span>
    </div>
  )
}

export default function Dashboard({ initialData }: { initialData: StatsData | null }) {
  const [data, setData] = useState<StatsData | null>(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [lastFetch, setLastFetch] = useState<Date>(new Date())
  const [tick, setTick] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/stats', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setLastFetch(new Date())
      }
    } catch (e) {
      console.error('Fetch error', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialData) fetchData()
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData, initialData])

  // Clock tick for live time display
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const nowIST = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Kolkata'
  })

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-xs" style={{ color: 'var(--subtle)' }}>
          INITIALISING<span className="blink">_</span>
        </div>
      </div>
    )
  }

  const b = data?.benchmarks
  const bankroll = data?.bankroll || 1000
  const startBankroll = 1000
  const totalPnL = bankroll - startBankroll
  const totalROI = (totalPnL / startBankroll) * 100
  const dailyPnL = b?.dailyPnL || 0
  const killedStrategies = data?.killedStrategies || []
  const regime = data?.regime?.confirmed || 'unknown'

  // Derive actions
  const actions: { text: string; severity: 'ok' | 'warn' | 'critical' }[] = []
  const betsToday = b?.betsToday || 0
  const closesToday = b?.closesToday || 0

  if (betsToday < 1) {
    actions.push({ text: 'No bets placed today — check signal pipeline', severity: 'warn' })
  } else {
    actions.push({ text: `${betsToday} bets placed today`, severity: 'ok' })
  }

  if (totalROI < -10) {
    actions.push({ text: `Total ROI ${fmt(totalROI, 1)}% — review position sizing`, severity: 'critical' })
  } else if (totalROI < 0) {
    actions.push({ text: `Total ROI ${fmt(totalROI, 1)}% — accumulating data`, severity: 'warn' })
  } else {
    actions.push({ text: `Total ROI ${fmt(totalROI, 1)}% — positive territory`, severity: 'ok' })
  }

  if (killedStrategies.length > 0) {
    actions.push({ text: `${killedStrategies.length} strategy killed: ${killedStrategies.join(', ')}`, severity: 'warn' })
  }

  if (closesToday === 0 && betsToday > 0) {
    actions.push({ text: 'No positions closed today — positions accumulating', severity: 'ok' })
  }

  actions.push({ text: 'System operating in paper trading mode', severity: 'ok' })

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-mono)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3 sticky top-0 z-50"
        style={{
          background: 'rgba(10,10,10,0.95)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-4">
          <span
            className="text-base font-bold tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          >
            POLYBOT
          </span>
          <span className="text-xs" style={{ color: 'var(--dim)' }}>//</span>
          <span className="text-xs tracking-wider" style={{ color: 'var(--subtle)' }}>
            CONTROL ROOM
          </span>
        </div>

        <div className="flex items-center gap-6">
          <RegimeBadge regime={regime} />
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--subtle)' }}>
            <StatusDot active={true} />
            LIVE
          </div>
          <div className="text-xs stat-value" style={{ color: 'var(--subtle)' }}>
            {nowIST} IST
          </div>
        </div>
      </header>

      <main className="p-6 space-y-4 max-w-7xl mx-auto">

        {/* Top row — key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card rounded-lg p-4 col-span-2 md:col-span-1">
            <StatBlock
              label="Bankroll"
              value={fmtMoney(bankroll)}
              sub={`Started at ${fmtMoney(startBankroll)}`}
              color="var(--text)"
            />
          </div>
          <div className="card rounded-lg p-4">
            <StatBlock
              label="Total P&L"
              value={`${totalPnL >= 0 ? '+' : ''}${fmtMoney(totalPnL)}`}
              sub={`${fmt(totalROI, 2)}% ROI`}
              color={totalPnL >= 0 ? 'var(--green)' : 'var(--red)'}
            />
          </div>
          <div className="card rounded-lg p-4">
            <StatBlock
              label="Today P&L"
              value={`${dailyPnL >= 0 ? '+' : ''}${fmtMoney(dailyPnL)}`}
              sub={`${fmt(b?.dailyROI || 0, 2)}% today`}
              color={dailyPnL >= 0 ? 'var(--green)' : 'var(--red)'}
            />
          </div>
          <div className="card rounded-lg p-4">
            <StatBlock
              label="Today Activity"
              value={`${betsToday} bets`}
              sub={`${b?.signalsToday || 0} signals`}
              color="var(--text)"
            />
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Bankroll chart */}
          <div className="card rounded-lg p-4 md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <Label>Bankroll History</Label>
              <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                {data?.bankrollHistory?.length || 0} snapshots
              </span>
            </div>
            <BankrollChart data={data?.bankrollHistory || []} />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                START {fmtMoney(startBankroll)}
              </span>
              <span
                className="text-xs stat-value"
                style={{ color: bankroll >= startBankroll ? 'var(--green)' : 'var(--red)' }}
              >
                NOW {fmtMoney(bankroll)}
              </span>
            </div>
          </div>

          {/* Regime + system status */}
          <div className="card rounded-lg p-4 flex flex-col gap-4">
            <div>
              <Label>Market Regime</Label>
              <div className="mt-2">
                <RegimeBadge regime={regime} />
                {data?.regime?.candidate && (
                  <div className="mt-1.5 text-xs" style={{ color: 'var(--subtle)' }}>
                    Candidate: {data.regime.candidate}
                    <span
                      className="ml-1 px-1 rounded"
                      style={{ background: 'var(--muted)', color: 'var(--text)' }}
                    >
                      {data.regime.count}/3
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Divider />

            <div>
              <Label>Strategies</Label>
              <div className="mt-2 space-y-1.5">
                {STRATEGIES.map(s => (
                  <StrategyBadge
                    key={s}
                    name={s}
                    killed={killedStrategies.includes(s)}
                  />
                ))}
              </div>
            </div>

            <Divider />

            <div>
              <Label>Last Sync</Label>
              <div className="mt-1 text-xs" style={{ color: 'var(--subtle)' }}>
                {data?.benchmarks?.lastChecked
                  ? fmtTime(data.benchmarks.lastChecked)
                  : '—'}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--dim)' }}>
                Dashboard refresh: 60s
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Today stats */}
          <div className="card rounded-lg p-4">
            <Label>Today&apos;s Session</Label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { label: 'Signals', value: b?.signalsToday || 0 },
                { label: 'Bets placed', value: betsToday },
                { label: 'Positions closed', value: b?.closesToday || 0 },
                { label: 'Timeouts', value: b?.timeoutsToday || 0 },
              ].map(item => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>{item.label}</span>
                  <span
                    className="stat-value text-xl font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <Divider />

            <div className="mt-3">
              <Label>Date</Label>
              <div className="mt-1 text-xs" style={{ color: 'var(--subtle)' }}>
                {b?.date ? fmtDate(b.date + 'T00:00:00') : '—'}
              </div>
            </div>
          </div>

          {/* Action panel */}
          <div className="card rounded-lg p-4">
            <Label>System Status</Label>
            <div className="mt-3 space-y-0.5">
              {actions.map((a, i) => (
                <ActionItem key={i} text={a.text} severity={a.severity} />
              ))}
            </div>

            <Divider />

            <div className="mt-3 text-xs" style={{ color: 'var(--dim)' }}>
              <div className="flex justify-between">
                <span>Mode</span>
                <span style={{ color: 'var(--amber)' }}>PAPER TRADING</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Target</span>
                <span style={{ color: 'var(--subtle)' }}>30 closed bets for Phase 3</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Interval</span>
                <span style={{ color: 'var(--subtle)' }}>Every 20 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2 text-xs"
          style={{ color: 'var(--dim)', borderTop: '1px solid var(--border)' }}
        >
          <span>POLYBOT // PREDICTION MARKET SHADOW TRADING SYSTEM</span>
          <span>
            Updated {lastFetch.toLocaleTimeString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit'
            })} IST
          </span>
        </div>
      </main>
    </div>
  )
}
