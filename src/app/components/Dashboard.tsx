'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard({ initialData }: { initialData: any }) {
  if (!initialData || initialData.error) {
    return <div style={{ color: '#e8e8e8', padding: '40px', textAlign: 'center' }}>{initialData?.error ?? 'Loading...'}</div>
  }

  const { bankroll, bankrollHistory, benchmarks, strategies, open_bets, closed_bets, fetchedAt } = initialData

  const fetchTime = fetchedAt
    ? new Date(fetchedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
    : new Date().toLocaleString()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e8e8', padding: '24px', fontFamily: 'JetBrains Mono, monospace', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ff88', letterSpacing: '4px', marginBottom: '24px' }}>
        POLYBOT CONTROL ROOM
      </h1>

      {/* ROW 1 — 4 KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <Card title="Bankroll" value={`$${bankroll.toFixed(2)}`} />
        <Card title="Daily PnL" value={`$${benchmarks.dailyPnL >= 0 ? '+' : ''}${benchmarks.dailyPnL.toFixed(2)}`} color={benchmarks.dailyPnL >= 0 ? '#00ff88' : '#ff3355'} />
        <Card title="ROI (today)" value={`${benchmarks.dailyROI >= 0 ? '+' : ''}${benchmarks.dailyROI.toFixed(2)}%`} color={benchmarks.dailyROI >= 0 ? '#00ff88' : '#ff3355'} />
        <Card title="Avg CLV" value={benchmarks.avgCLV ? (benchmarks.avgCLV > 0 ? '+' : '') + benchmarks.avgCLV.toFixed(4) : 'N/A'} color={benchmarks.avgCLV > 0 ? '#00ff88' : '#ff3355'} />
      </div>

      {/* ROW 2 — 5 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <Card title="Open Bets" value={open_bets.length} />
        <Card title="Closed Bets" value={benchmarks.totalBets} />
        <Card title="Win Rate" value={`${benchmarks.winRate}%`} color={benchmarks.winRate >= 50 ? '#00ff88' : '#ff3355'} />
        <Card title="Timeout Rate" value={`${benchmarks.timeoutRate}%`} color={benchmarks.timeoutRate <= 50 ? '#00ff88' : '#ffaa00'} />
        <Card title="Signals Today" value={benchmarks.signalsToday} />
      </div>

      {/* EQUITY CURVE */}
      <div style={{ background: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>Equity Curve</div>
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
            Accumulating data — first closed bets needed
          </div>
        )}
      </div>

      {/* OPEN POSITIONS */}
      <div style={{ background: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', marginBottom: '12px', overflowX: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>Open Positions ({open_bets.length})</div>
        {open_bets.length > 0 ? (
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ color: '#444', borderBottom: '1px solid #1e1e1e' }}>
                <th style={{ textAlign: 'left', padding: '6px 4px' }}>Market</th>
                <th style={{ textAlign: 'center', padding: '6px 4px' }}>Strategy</th>
                <th style={{ textAlign: 'center', padding: '6px 4px' }}>Side</th>
                <th style={{ textAlign: 'center', padding: '6px 4px' }}>Entry</th>
                <th style={{ textAlign: 'center', padding: '6px 4px' }}>Size</th>
                <th style={{ textAlign: 'center', padding: '6px 4px' }}>Hold</th>
              </tr>
            </thead>
            <tbody>
              {open_bets.map((b: any) => {
                const holdHours = b.placed_at
                  ? Math.round((Date.now() - new Date(b.placed_at).getTime()) / 3600000 * 10) / 10
                  : 0
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #0a0a0a' }}>
                    <td style={{ padding: '6px 4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.question?.slice(0, 50)}{b.question?.length > 50 ? '...' : ''}
                    </td>
                    <td style={{ textAlign: 'center', padding: '6px 4px', color: '#888' }}>{b.strategy_tag}</td>
                    <td style={{ textAlign: 'center', padding: '6px 4px' }}>{b.side}</td>
                    <td style={{ textAlign: 'center', padding: '6px 4px' }}>{b.entry_price?.toFixed(3)}</td>
                    <td style={{ textAlign: 'center', padding: '6px 4px' }}>${b.bet_size?.toFixed(2)}</td>
                    <td style={{ textAlign: 'center', padding: '6px 4px', color: holdHours > 20 ? '#ffaa00' : '#888' }}>{holdHours}h</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#444', fontSize: '12px' }}>No open positions</div>
        )}
      </div>

      {/* STRATEGIES */}
      <div style={{ background: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>Strategies</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {strategies.length > 0 ? strategies.map((s: any) => (
            <span key={s.strategy} style={{ padding: '4px 12px', borderRadius: '20px', background: '#1e1e1e', color: '#00ff88', fontSize: '11px' }}>
              {s.strategy} · {s.total} bets · CLV {s.total_clv && s.total ? ((s.total_clv / s.total) > 0 ? '+' : '') + (s.total_clv / s.total).toFixed(3) : 'N/A'}
            </span>
          )) : ['momentum', 'reversal', 'volume_spike'].map(s => (
            <span key={s} style={{ padding: '4px 12px', borderRadius: '20px', background: '#1e1e1e', color: '#00ff88', fontSize: '11px' }}>{s} ACTIVE</span>
          ))}
        </div>
      </div>

      {/* RECENT CLOSED BETS */}
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
            {closed_bets.slice(0, 15).map((b: any) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #0a0a0a' }}>
                <td style={{ padding: '6px 4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.question?.slice(0, 50)}{b.question?.length > 50 ? '...' : ''}
                </td>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: '#888' }}>{b.strategy_tag}</td>
                <td style={{ textAlign: 'center', padding: '6px 4px' }}>{b.side}</td>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: b.pnl >= 0 ? '#00ff88' : '#ff3355' }}>
                  {b.pnl != null ? `${b.pnl >= 0 ? '+' : ''}$${b.pnl.toFixed(2)}` : '—'}
                </td>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: b.clv > 0 ? '#00ff88' : b.clv < 0 ? '#ff3355' : '#888' }}>
                  {b.clv != null ? (b.clv > 0 ? '+' : '') + b.clv.toFixed(3) : '—'}
                </td>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: '#888' }}>{b.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '11px', color: '#333' }}>Data as of: {fetchTime}</div>
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
