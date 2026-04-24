'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'

type Props = {
  initialData: any
}

export default function Dashboard({ initialData }: Props) {
  if (!initialData) {
    return (
      <div className="text-white p-10 text-center">
        Loading dashboard...
      </div>
    )
  }

  const { bankroll, bankrollHistory, benchmarks, regime, killedStrategies } =
    initialData

  const data = bankrollHistory.map((d: any) => ({
    time: new Date(d.time).toLocaleTimeString(),
    value: d.value,
  }))

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold text-green-400">
        POLYBOT CONTROL ROOM
      </h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Bankroll" value={`$${bankroll.toFixed(2)}`} />
        <Card
          title="Daily PnL"
          value={`$${benchmarks.dailyPnL.toFixed(2)}`}
          color={benchmarks.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <Card
          title="ROI"
          value={`${benchmarks.dailyROI.toFixed(2)}%`}
          color={benchmarks.dailyROI >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <Card title="Signals" value={benchmarks.signalsToday} />
      </div>

      {/* CHART */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h2 className="mb-3 text-sm text-zinc-400">Bankroll History</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff99" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#00ff99" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#222" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#00ff99"
              fill="url(#color)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* STRATEGIES */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h2 className="text-sm text-zinc-400 mb-3">Strategies</h2>
        <div className="flex gap-3 flex-wrap">
          {['momentum', 'reversal', 'volume_spike'].map((s) => (
            <span
              key={s}
              className="px-3 py-1 rounded-full bg-green-900 text-green-300 text-sm"
            >
              {s} ACTIVE
            </span>
          ))}
        </div>
      </div>

      {/* REGIME */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h2 className="text-sm text-zinc-400 mb-2">Market Regime</h2>
        <p className="text-lg text-yellow-400">{regime.confirmed}</p>
        <p className="text-sm text-zinc-500">
          Candidate: {regime.candidate} ({regime.count})
        </p>
      </div>

      {/* FOOTER */}
      <div className="text-xs text-zinc-500">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  )
}

/* ---------------- COMPONENTS ---------------- */

function Card({
  title,
  value,
  color = 'text-white',
}: {
  title: string
  value: any
  color?: string
}) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
      <p className="text-xs text-zinc-400">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
