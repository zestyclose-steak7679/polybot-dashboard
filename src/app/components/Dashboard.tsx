'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard({ initialData }: { initialData: any }) {
  if (!initialData || initialData.error) {
    return <div className="text-white p-10 text-center">{initialData?.error ?? 'Loading...'}</div>
  }

  const { bankroll, bankrollHistory, benchmarks, strategies, open_bets, closed_bets } = initialData

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-2xl font-bold text-green-400">POLYBOT CONTROL ROOM</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Bankroll" value={`$${bankroll.toFixed(2)}`} />
        <Card title="Daily PnL" value={`$${benchmarks.dailyPnL.toFixed(2)}`} color={benchmarks.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'} />
        <Card title="ROI" value={`${benchmarks.dailyROI.toFixed(2)}%`} color={benchmarks.dailyROI >= 0 ? 'text-green-400' : 'text-red-400'} />
        <Card title="Avg CLV" value={benchmarks.avgCLV ? benchmarks.avgCLV.toFixed(4) : 'N/A'} color={benchmarks.avgCLV > 0 ? 'text-green-400' : 'text-red-400'} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card title="Signals Today" value={benchmarks.signalsToday} />
        <Card title="Open Bets" value={open_bets.length} />
        <Card title="Closed Bets" value={benchmarks.totalBets} />
      </div>

      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h2 className="mb-3 text-sm text-zinc-400">Bankroll History</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={bankrollHistory}>
            <defs>
              <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff99" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#00ff99" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#222" />
            <XAxis dataKey="time" stroke="#666" tick={false} />
            <YAxis stroke="#666" domain={['auto', 'auto']} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#00ff99" fill="url(#color)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h2 className="text-sm text-zinc-400 mb-3">Strategies</h2>
        <div className="flex gap-3 flex-wrap">
          {strategies.length > 0 ? strategies.map((s: any) => (
            <span key={s.strategy} className="px-3 py-1 rounded-full bg-zinc-800 text-green-300 text-sm">
              {s.strategy} · {s.total} bets · CLV {s.total_clv ? (s.total_clv / s.total).toFixed(3) : 'N/A'}
            </span>
          )) : ['momentum', 'reversal', 'volume_spike'].map(s => (
            <span key={s} className="px-3 py-1 rounded-full bg-green-900 text-green-300 text-sm">{s} ACTIVE</span>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h2 className="text-sm text-zinc-400 mb-3">Recent Closed Bets</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-zinc-500 border-b border-zinc-800">
              <th className="text-left py-1">Market</th>
              <th>Strategy</th><th>Side</th><th>PnL</th><th>CLV</th><th>Result</th>
            </tr></thead>
            <tbody>
              {closed_bets.slice(0, 10).map((b: any) => (
                <tr key={b.id} className="border-b border-zinc-900 hover:bg-zinc-800">
                  <td className="py-1 max-w-xs truncate">{b.question?.slice(0, 40)}...</td>
                  <td className="text-center">{b.strategy_tag}</td>
                  <td className="text-center">{b.side}</td>
                  <td className={`text-center ${b.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>${b.pnl?.toFixed(2)}</td>
                  <td className={`text-center ${b.clv > 0 ? 'text-green-400' : 'text-red-400'}`}>{b.clv?.toFixed(3)}</td>
                  <td className="text-center text-zinc-400">{b.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-zinc-500">Last updated: {new Date().toLocaleString()}</div>
    </div>
  )
}

function Card({ title, value, color = 'text-white' }: { title: string; value: any; color?: string }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
      <p className="text-xs text-zinc-400">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
