'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts'
import { useState, useEffect } from 'react'

const C = {
  bg: '#070b14',
  surface: '#0d1424',
  surface2: '#111d35',
  border: '#1a2a4a',
  accent: '#00d4ff',
  green: '#00ff88',
  red: '#ff3366',
  amber: '#ffb800',
  purple: '#a855f7',
  text: '#e2e8f0',
  muted: '#64748b',
  dim: '#1e3a5f',
}

const glowGreen = '0 0 20px rgba(0,255,136,0.3)'
const glowBlue = '0 0 20px rgba(0,212,255,0.3)'

function usePulse() {
  const [t, setT] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setT(p => p + 1), 2000)
    return () => clearInterval(id)
  }, [])
  return t % 2 === 0
}

export default function Dashboard({ initialData }: { initialData: any }) {
  const pulse = usePulse()
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions')

  if (!initialData || initialData.error) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <div style={{ textAlign: 'center', color: C.muted }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>◈</div>
          <div style={{ color: C.accent, fontSize: '14px', letterSpacing: '4px' }}>CONNECTING TO POLYBOT...</div>
        </div>
      </div>
    )
  }

  const { bankroll, bankrollHistory, benchmarks, strategies, open_bets, closed_bets, fetchedAt } = initialData
  const pnlTotal = bankroll - 1000
  const pnlPct = ((pnlTotal / 1000) * 100).toFixed(2)
  const isUp = pnlTotal >= 0
  const fetchTime = fetchedAt
    ? new Date(fetchedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST'
    : '--:-- IST'

  const strategyColors: Record<string, string> = {
    momentum: C.accent,
    reversal: C.purple,
    volume_spike: C.amber,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: '"Share Tech Mono", "JetBrains Mono", monospace',
      backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(0,212,255,0.05) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.05) 0%, transparent 50%)`,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .card { transition: border-color 0.2s, box-shadow 0.2s; }
        .card:hover { border-color: ${C.dim} !important; box-shadow: 0 0 30px rgba(0,212,255,0.08); }
        .tab { cursor: pointer; transition: all 0.2s; }
        .tab:hover { color: ${C.text}; }
        .row-hover:hover { background: rgba(0,212,255,0.03) !important; }
      `}</style>

      {/* TOPBAR */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: `rgba(13,20,36,0.95)`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '20px', color: C.accent }}>◈</div>
          <div>
            <div style={{ fontFamily: '"Orbitron", monospace', fontSize: '14px', fontWeight: 700, color: C.accent, letterSpacing: '3px' }}>POLYBOT</div>
            <div style={{ fontSize: '9px', color: C.muted, letterSpacing: '2px' }}>PREDICTION MARKET AGENT</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['OVERVIEW', 'POSITIONS', 'ANALYTICS', 'SETTINGS'].map(tab => (
            <div key={tab} style={{
              fontSize: '10px',
              letterSpacing: '2px',
              color: tab === 'OVERVIEW' ? C.accent : C.muted,
              cursor: 'pointer',
              borderBottom: tab === 'OVERVIEW' ? `1px solid ${C.accent}` : 'none',
              paddingBottom: '2px',
            }}>{tab}</div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: C.green,
              boxShadow: glowGreen,
              animation: 'pulse 2s infinite',
            }} />
            <div style={{ fontSize: '10px', color: C.green, letterSpacing: '1px' }}>SYSTEM ACTIVE</div>
          </div>
          <div style={{ fontSize: '10px', color: C.muted }}>Updated {fetchTime}</div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: '1600px', margin: '0 auto' }}>

        {/* TOP STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px', animation: 'fadeIn 0.5s ease' }}>

          {/* Portfolio Value */}
          <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', gridColumn: 'span 1' }}>
            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '2px', marginBottom: '8px' }}>PORTFOLIO VALUE</div>
            <div style={{ fontFamily: '"Orbitron"', fontSize: '28px', fontWeight: 700, color: C.text, lineHeight: 1 }}>${bankroll.toFixed(2)}</div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontSize: '12px', color: isUp ? C.green : C.red, fontWeight: 600 }}>
                {isUp ? '▲' : '▼'} ${Math.abs(pnlTotal).toFixed(2)} ({isUp ? '+' : ''}{pnlPct}%)
              </div>
              <div style={{ fontSize: '10px', color: C.muted }}>all time</div>
            </div>
          </div>

          {/* Total PnL */}
          <div className="card" style={{ background: C.surface, border: `1px solid ${isUp ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)'}`, borderRadius: '12px', padding: '20px', boxShadow: isUp ? '0 0 30px rgba(0,255,136,0.08)' : '0 0 30px rgba(255,51,102,0.08)' }}>
            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '2px', marginBottom: '8px' }}>TOTAL P&L</div>
            <div style={{ fontFamily: '"Orbitron"', fontSize: '28px', fontWeight: 700, color: isUp ? C.green : C.red, lineHeight: 1 }}>
              {isUp ? '+' : ''}${pnlTotal.toFixed(2)}
            </div>
            <div style={{ marginTop: '8px', fontSize: '10px', color: C.muted }}>from $1,000 starting capital</div>
          </div>

          {/* Win Rate */}
          <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '2px', marginBottom: '8px' }}>WIN RATE</div>
            <div style={{ fontFamily: '"Orbitron"', fontSize: '28px', fontWeight: 700, color: (benchmarks.winRate ?? 0) >= 50 ? C.green : C.red, lineHeight: 1 }}>
              {benchmarks.winRate ?? 0}%
            </div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ height: '3px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${benchmarks.winRate ?? 0}%`, background: (benchmarks.winRate ?? 0) >= 50 ? C.green : C.red, borderRadius: '2px', transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>

          {/* Avg CLV */}
          <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '2px', marginBottom: '8px' }}>AVG CLV</div>
            <div style={{ fontFamily: '"Orbitron"', fontSize: '28px', fontWeight: 700, color: (benchmarks.avgCLV ?? 0) > 0 ? C.green : (benchmarks.avgCLV ?? 0) < 0 ? C.red : C.muted, lineHeight: 1 }}>
              {benchmarks.avgCLV != null ? ((benchmarks.avgCLV > 0 ? '+' : '') + benchmarks.avgCLV.toFixed(4)) : 'N/A'}
            </div>
            <div style={{ marginTop: '8px', fontSize: '10px', color: (benchmarks.avgCLV ?? 0) > 0 ? C.green : C.muted }}>
              {(benchmarks.avgCLV ?? 0) > 0 ? '✓ Positive edge detected' : (benchmarks.avgCLV ?? 0) < 0 ? '⚠ Negative CLV' : 'Accumulating data'}
            </div>
          </div>

          {/* Active Positions */}
          <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '2px', marginBottom: '8px' }}>ACTIVE POSITIONS</div>
            <div style={{ fontFamily: '"Orbitron"', fontSize: '28px', fontWeight: 700, color: C.accent, lineHeight: 1 }}>
              {open_bets.length}
              <span style={{ fontSize: '14px', color: C.muted, fontWeight: 400 }}>/5</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < open_bets.length ? C.accent : C.border }} />
              ))}
            </div>
          </div>

          {/* Closed Bets */}
          <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '2px', marginBottom: '8px' }}>CLOSED BETS</div>
            <div style={{ fontFamily: '"Orbitron"', fontSize: '28px', fontWeight: 700, color: C.text, lineHeight: 1 }}>
              {benchmarks.totalBets}
            </div>
            <div style={{ marginTop: '8px', fontSize: '10px', color: C.muted }}>
              Timeout rate: {benchmarks.timeoutRate ?? 0}%
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>

          {/* EQUITY CURVE */}
          <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '2px' }}>EQUITY CURVE</div>
                <div style={{ fontSize: '12px', color: isUp ? C.green : C.red, marginTop: '2px' }}>
                  {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{pnlPct}% all time
                </div>
              </div>
              <div style={{ fontSize: '10px', color: C.muted, background: C.surface2, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${C.border}` }}>
                ALL TIME
              </div>
            </div>
            {bankrollHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={bankrollHistory} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isUp ? C.green : C.red} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={isUp ? C.green : C.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" stroke={C.border} tick={false} />
                  <YAxis stroke={C.border} tick={{ fill: C.muted, fontSize: 10 }} width={55} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '11px', color: C.text }}
                    formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Bankroll']}
                  />
                  <Area type="monotone" dataKey="value" stroke={isUp ? C.green : C.red} fill="url(#equity)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.muted, gap: '8px' }}>
                <div style={{ fontSize: '32px', opacity: 0.3 }}>◈</div>
                <div style={{ fontSize: '11px', letterSpacing: '2px' }}>AWAITING FIRST SETTLEMENTS</div>
              </div>
            )}
          </div>

          {/* BOT STATUS */}
          <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '2px', marginBottom: '16px' }}>BOT STATUS</div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                border: `3px solid ${C.accent}`,
                boxShadow: glowBlue,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
                position: 'relative',
                background: `radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)`,
              }}>
                <div style={{ fontSize: '32px', color: C.accent }}>◈</div>
                <div style={{ fontSize: '8px', color: C.green, letterSpacing: '2px', marginTop: '4px', animation: 'pulse 2s infinite' }}>RUNNING</div>
                <div style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: C.green, boxShadow: glowGreen,
                  animation: 'pulse 2s infinite',
                }} />
              </div>
            </div>

            {[
              { label: 'Mode', value: 'Paper Trading', color: C.amber },
              { label: 'Model', value: 'Heuristic', color: C.muted },
              { label: 'Strategies', value: '3 Active', color: C.green },
              { label: 'Uptime', value: '24/7 via Railway', color: C.muted },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '11px', color: C.muted }}>{row.label}</div>
                <div style={{ fontSize: '11px', color: row.color }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* STRATEGIES ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {['momentum', 'reversal', 'volume_spike'].map(name => {
            const s = strategies.find((x: any) => x.strategy === name)
            const avgClv = s && s.total ? s.total_clv / s.total : null
            const color = strategyColors[name] ?? C.muted
            return (
              <div key={name} className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', borderTop: `2px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color, letterSpacing: '2px', fontWeight: 600 }}>{name.replace('_', ' ').toUpperCase()}</div>
                    <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>{s?.total ?? 0} bets</div>
                  </div>
                  <div style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: `rgba(0,255,136,0.1)`, color: C.green, border: `1px solid rgba(0,255,136,0.2)` }}>
                    ACTIVE
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: C.muted, marginBottom: '2px' }}>AVG CLV</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: avgClv != null ? (avgClv > 0 ? C.green : C.red) : C.muted }}>
                      {avgClv != null ? (avgClv > 0 ? '+' : '') + avgClv.toFixed(3) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', color: C.muted, marginBottom: '2px' }}>PNL</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: (s?.total_clv ?? 0) >= 0 ? C.green : C.red }}>
                      {s ? ((s.total_clv ?? 0) >= 0 ? '+' : '') + '$' + Math.abs(s.total_clv ?? 0).toFixed(2) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* POSITIONS / HISTORY TABS */}
        <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 20px' }}>
            {(['positions', 'history'] as const).map(tab => (
              <div
                key={tab}
                className="tab"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '14px 20px 12px',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: activeTab === tab ? C.accent : C.muted,
                  borderBottom: activeTab === tab ? `2px solid ${C.accent}` : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab === 'positions' ? `OPEN POSITIONS (${open_bets.length})` : `TRADE HISTORY (${closed_bets.length})`}
              </div>
            ))}
          </div>

          <div style={{ padding: '0 20px 20px', overflowX: 'auto' }}>
            {activeTab === 'positions' ? (
              open_bets.length > 0 ? (
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ color: C.muted }}>
                      {['MARKET', 'STRATEGY', 'SIDE', 'ENTRY', 'SIZE', 'HOLD', 'STATUS'].map(h => (
                        <th key={h} style={{ textAlign: h === 'MARKET' ? 'left' : 'center', padding: '12px 8px', fontSize: '9px', letterSpacing: '2px', fontWeight: 400, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {open_bets.map((b: any) => {
                      const holdH = b.placed_at ? Math.round((Date.now() - new Date(b.placed_at).getTime()) / 3600000 * 10) / 10 : 0
                      const strat = b.strategy_tag ?? ''
                      const color = strategyColors[strat] ?? C.muted
                      return (
                        <tr key={b.id} className="row-hover" style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '12px 8px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.question?.slice(0, 55)}{(b.question?.length ?? 0) > 55 ? '…' : ''}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <span style={{ color, fontSize: '9px', letterSpacing: '1px' }}>{strat.replace('_', ' ').toUpperCase()}</span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <span style={{ color: b.side === 'YES' ? C.green : C.red, fontSize: '10px', fontWeight: 700 }}>{b.side}</span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', color: C.text }}>{b.entry_price?.toFixed(3)}</td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', color: C.accent }}>${b.bet_size?.toFixed(2)}</td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', color: holdH > 20 ? C.amber : C.muted }}>{holdH}h</td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '9px', color: C.green, background: 'rgba(0,255,136,0.1)', padding: '2px 8px', borderRadius: '20px', letterSpacing: '1px' }}>OPEN</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>No open positions</div>
              )
            ) : (
              closed_bets.length > 0 ? (
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ color: C.muted }}>
                      {['MARKET', 'STRATEGY', 'SIDE', 'PNL', 'CLV', 'RESULT'].map(h => (
                        <th key={h} style={{ textAlign: h === 'MARKET' ? 'left' : 'center', padding: '12px 8px', fontSize: '9px', letterSpacing: '2px', fontWeight: 400, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {closed_bets.slice(0, 20).map((b: any) => (
                      <tr key={b.id} className="row-hover" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 8px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.question?.slice(0, 55)}{(b.question?.length ?? 0) > 55 ? '…' : ''}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <span style={{ color: strategyColors[b.strategy_tag] ?? C.muted, fontSize: '9px', letterSpacing: '1px' }}>
                            {(b.strategy_tag ?? '').replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <span style={{ color: b.side === 'YES' ? C.green : C.red, fontWeight: 700 }}>{b.side}</span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: (b.pnl ?? 0) >= 0 ? C.green : C.red, fontWeight: 600 }}>
                          {b.pnl != null ? `${b.pnl >= 0 ? '+' : ''}$${b.pnl.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: (b.clv ?? 0) > 0 ? C.green : (b.clv ?? 0) < 0 ? C.red : C.muted }}>
                          {b.clv != null ? `${b.clv > 0 ? '+' : ''}${b.clv.toFixed(3)}` : '—'}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '9px',
                            color: b.result?.includes('win') ? C.green : b.result?.includes('loss') ? C.red : C.muted,
                            background: b.result?.includes('win') ? 'rgba(0,255,136,0.1)' : b.result?.includes('loss') ? 'rgba(255,51,102,0.1)' : 'transparent',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            letterSpacing: '1px',
                          }}>
                            {(b.result ?? '').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>No closed bets yet</div>
              )
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '10px', color: C.muted }}>POLYBOT v4 · PAPER TRADING · POLYMARKET</div>
          <div style={{ fontSize: '10px', color: C.muted }}>Data refreshes every 30s · {fetchTime}</div>
        </div>

      </div>
    </div>
  )
}
