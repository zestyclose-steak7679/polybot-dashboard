'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard({ initialData }: { initialData: any }) {
  if (!initialData || initialData.error) {
    return (
      <div style={{ color: '#e8e8e8', padding: '40px', textAlign: 'center' }}>
        {initialData?.error ?? 'Loading...'}
      </div>
    )
  }

  const { bankroll, bankrollHistory, benchmarks, strategies, open_bets, closed_bets } = initialData

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e8e8e8',
      padding: '24px',
      fontFamily: 'JetBrains Mono, monospace',
      maxWidth: '1400px',
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ff88', letterSpacing: '4px', marginBottom: '24px' }}>
        POLYBOT CONTROL ROOM
      </h1>

      {/* ROW 1 — 4 KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <Card title="Bankroll" value={`$${bankroll.toFixed(2)}`} />
        <Card title="Daily PnL" value={`$${benchmarks.dailyPnL.toFixed(2)}`} color={benchmarks.dailyPnL >= 0 ? '#00ff88' : '#ff3355'} />
        <Card title="ROI" value={`${benchmarks.dailyROI.toFixed(2)}%`} color={benchmarks.dailyROI >= 0 ? '#00ff88' : '#ff3355'} />
        <Card title="Avg CLV" value={benchmarks.avgCLV ? benchmarks.avgCLV.toFixed(4) : 'N/A'} color={benchmarks.avgCLV > 0 ? '#00ff88' : '#ff3355'} />
      </div>

      {/* ROW 2 — 3 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <Card title="Signals Today" value={benchmarks.signalsToday} />
        <Card title="Open Bets" value={open_bets.length} />
        <Card title="Closed Bets" value={benchmarks.totalBets} />
      </div>

      {/* CHART */}
      <div style={{ background: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>Bankroll History</div>
        {bankrollHistory.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={bankrollHistory}>
              <defs>
                <linearGradient id="clr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff88" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e1e1e" />
              <XAxis dataKey="time" stroke="#444" tick={false} />
              <YAxis stroke="#444" domain={['auto', 'auto']} tick={{ fill: '#888', fontSize: 10 }} width={60} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #1e1e1e', color: '#e8e8e8', fontSize: '11px' }} />
              <Area type="monotone" dataKey="value" stroke="#00ff88" fill="url(#clr)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: '12px' }}>
            Accumulating data — check back after a few cycles
          </div>
        )}
      </div>

      {/* STRATEGIES */}
      <div style={{ background: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>Strategies</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {strategies.length > 0 ? strategies.map((s: any) => (
            <span key={s.strategy} style={{ padding: '4px 12px', borderRadius: '20px', background: '#1e1e1e', color: '#00ff88', fontSize: '11px' }}>
              {s.strategy} · {s.total} bets · CLV {s.total_clv ? (s.total_clv / s.total).toFixed(3) : 'N/A'}
            </span>
          )) : ['momentum', 'reversal', 'volume_spike'].map(s => (
            <span key={s} style={{ padding: '4px 12px', borderRadius: '20px', background: '#1e1e1e', color: '#00ff88', fontSize: '11px' }}>
              {s} ACTIVE
            </span>
          ))}
        </div>
      </div>

      {/* RECENT BETS TABLE */}
      <div style={{ background: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', marginBottom: '12px', overflowX: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>Recent Closed Bets</div>
        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ color: '#444', borderBottom: '1px solid #1e1e1e' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px' }}>Market</th>
              <th style={{ textAlign: 'center', padding: '6px 4px' }}>Strategy</th>
              <th style={{ textAlign: 'center', padding: '6px 4px' }}>Side</th>
              <th style={{ textAlign: 'center', padding: '6px 4px' }}>PnL</th>
              <th style={{ textAlign: 'center', padding: '6px 4px' }}>CLV</th>
              <th style={{ textAlign: 'center', padding: '6px 4px' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {closed_bets.slice(0, 10).map((b: any) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #0a0a0a' }}>
                <td style={{ padding: '6px 4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.question?.slice(0, 50)}...
                </td>
                <td style={{ textAlign: 'center', padding: '6px 4px' }}>{b.strategy_tag}</td>
                <td style={{ textAlign: 'center', padding: '6px 4px' }}>{b.side}</td>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: b.pnl >= 0 ? '#00ff88' : '#ff3355' }}>
                  ${b.pnl?.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: b.clv > 0 ? '#00ff88' : '#ff3355' }}>
                  {b.clv?.toFixed(3)}
                </td>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: '#888' }}>{b.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '11px', color: '#333' }}>Last updated: {new Date().toLocaleString()}</div>
    </div>
  )
}

function Card({ title, value, color = '#e8e8e8' }: { title: string; value: any; color?: string }) {
  return (
    <div style={{ background: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px' }}>
      <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  )
}
