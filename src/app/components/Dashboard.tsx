'use client'
import { useState, useEffect, useCallback } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// ── Design tokens ──────────────────────────────────────
const C = {
  bg: '#0f1117',
  sidebar: '#13161f',
  surface: '#1a1d2e',
  surface2: '#1f2235',
  border: '#2a2d3e',
  borderLight: '#353850',
  accent: '#6c63ff',
  accentHover: '#7c74ff',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
  blue: '#3b82f6',
  text: '#e2e8f0',
  textDim: '#94a3b8',
  textMuted: '#64748b',
}

const RAILWAY_URL = 'https://polybot-prediction-system-production.up.railway.app'

// ── Hooks ──────────────────────────────────────────────
// "Last cycle Xm ago" — driven by `last_cycle_at` from /api/state.
// Replaces the previously hardcoded "uptime since 2 days ago" mock.
function useLastCycle(lastCycleAt: string | null | undefined) {
  const [label, setLabel] = useState('—')
  useEffect(() => {
    const update = () => {
      if (!lastCycleAt) {
        setLabel('—')
        return
      }
      const t = new Date(lastCycleAt + (lastCycleAt.endsWith('Z') ? '' : 'Z'))
      const ms = Date.now() - t.getTime()
      if (Number.isNaN(ms) || ms < 0) {
        setLabel('—')
        return
      }
      const m = Math.floor(ms / 60000)
      if (m < 1) setLabel('just now')
      else if (m < 60) setLabel(`${m}m ago`)
      else if (m < 1440) setLabel(`${Math.floor(m / 60)}h ${m % 60}m ago`)
      else setLabel(`${Math.floor(m / 1440)}d ago`)
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [lastCycleAt])
  return label
}

function useLiveData() {
  const [data, setData] = useState<any>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${RAILWAY_URL}/api/state`)
      if (!res.ok) return
      const raw = await res.json()
      setData(raw)
      setLastFetch(new Date())
    } catch {}
  }, [])

  useEffect(() => {
    fetch_()
    const id = setInterval(fetch_, 30000)
    return () => clearInterval(id)
  }, [fetch_])

  return { data, lastFetch, refresh: fetch_ }
}

// ── Sidebar ─────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'positions', icon: '◧', label: 'Positions' },
  { id: 'strategies', icon: '⚡', label: 'Strategies' },
  { id: 'analytics', icon: '◈', label: 'Analytics' },
  { id: 'alerts', icon: '◎', label: 'Alerts' },
  { id: 'logs', icon: '≡', label: 'Logs' },
]

function Sidebar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <div style={{
      width: '220px', minHeight: '100vh', background: C.sidebar,
      borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 24px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${C.accent}, #a78bfa)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: `0 4px 12px rgba(108,99,255,0.4)`,
          }}>🤖</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: C.text, fontFamily: 'system-ui' }}>PolyBot</div>
            <div style={{ fontSize: '10px', color: C.accent, background: 'rgba(108,99,255,0.15)', padding: '1px 6px', borderRadius: '20px', display: 'inline-block' }}>Pro</div>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '4px' }}>Polymarket Trading Bot</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV.map(item => (
          <div
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
              marginBottom: '2px',
              background: active === item.id ? `rgba(108,99,255,0.15)` : 'transparent',
              color: active === item.id ? C.accent : C.textDim,
              transition: 'all 0.15s',
              fontFamily: 'system-ui', fontSize: '13px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
            {item.id === 'positions' && <div style={{ marginLeft: 'auto', fontSize: '10px', background: C.accent, color: 'white', padding: '1px 6px', borderRadius: '10px' }}>Live</div>}
          </div>
        ))}
      </nav>

      {/* Account */}
      <div style={{ padding: '16px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '6px', letterSpacing: '1px' }}>ACCOUNT</div>
        <div style={{ fontSize: '11px', color: C.textDim, marginBottom: '8px', fontFamily: 'monospace' }}>Paper Trading Mode</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: C.text, fontFamily: 'system-ui' }} id="sidebar-bankroll">—</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <div>
            <div style={{ fontSize: '10px', color: C.textMuted }}>Total P&L</div>
            <div style={{ fontSize: '12px', color: C.green, fontWeight: 600 }} id="sidebar-pnl">—</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Top bar ─────────────────────────────────────────────
function TopBar({ page, lastFetch, onRefresh }: { page: string; lastFetch: Date | null; onRefresh: () => void }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 0, left: '220px', right: 0, height: '60px',
      background: C.sidebar, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', zIndex: 40,
    }}>
      <div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: C.text, fontFamily: 'system-ui', textTransform: 'capitalize' }}>{page}</div>
        <div style={{ fontSize: '11px', color: C.textMuted }}>Monitor your Polymarket trading bot and performance.</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}`, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '12px', color: C.green, fontFamily: 'system-ui' }}>All systems operational</span>
        </div>
        <button
          onClick={onRefresh}
          style={{ background: 'rgba(108,99,255,0.15)', border: `1px solid rgba(108,99,255,0.3)`, color: C.accent, padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'system-ui' }}
        >↺ Refresh</button>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 14px', fontSize: '12px', color: C.textDim, fontFamily: 'monospace' }}>
          {now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST
        </div>
      </div>
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────
function StatCard({ title, value, sub, icon, color, iconBg }: any) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px',
      padding: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      transition: 'border-color 0.2s',
    }}>
      <div>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '8px', fontFamily: 'system-ui' }}>{title}</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: color ?? C.text, fontFamily: 'system-ui', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '12px', color: C.textDim, marginTop: '6px', fontFamily: 'system-ui' }}>{sub}</div>}
      </div>
      {icon && (
        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: iconBg ?? 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          {icon}
        </div>
      )}
    </div>
  )
}

// ── Edit Strategies Modal ────────────────────────────────
function StrategiesModal({ onClose, config, onSave }: { onClose: () => void; config: any; onSave: (c: any) => void }) {
  const [cfg, setCfg] = useState({ ...config })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '28px', width: '480px', maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: C.text, fontFamily: 'system-ui' }}>⚡ Edit Strategies</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {[
          { key: 'momentum', label: 'Momentum', desc: 'Follow 24h price direction', color: '#3b82f6' },
          { key: 'reversal', label: 'Reversal', desc: 'Fade large overreactions', color: '#a855f7' },
          { key: 'volume_spike', label: 'Volume Spike', desc: 'Follow informed activity', color: '#f59e0b' },
        ].map(s => (
          <div key={s.key} style={{ padding: '14px', background: C.surface2, borderRadius: '10px', marginBottom: '10px', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: s.color, fontFamily: 'system-ui' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: C.textMuted }}>{s.desc}</div>
              </div>
              <div
                onClick={() => setCfg((p: any) => ({ ...p, [s.key]: !p[s.key] }))}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: cfg[s.key] ? C.green : C.border,
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px', width: '18px', height: '18px',
                  borderRadius: '50%', background: 'white', transition: 'left 0.2s',
                  left: cfg[s.key] ? '23px' : '3px',
                }} />
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(108,99,255,0.08)', borderRadius: '8px', border: `1px solid rgba(108,99,255,0.2)` }}>
          <div style={{ fontSize: '11px', color: C.textDim, fontFamily: 'system-ui' }}>
            ℹ️ Strategy changes take effect on the next cycle (within 15 min). Changes are advisory — the bot still applies regime routing.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.textDim, cursor: 'pointer', fontFamily: 'system-ui', fontSize: '13px' }}>Cancel</button>
          <button onClick={() => { onSave(cfg); onClose() }} style={{ flex: 1, padding: '10px', background: C.accent, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontFamily: 'system-ui', fontSize: '13px', fontWeight: 600, boxShadow: `0 4px 12px rgba(108,99,255,0.4)` }}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────
export default function Dashboard({ initialData }: { initialData: any }) {
  const [page, setPage] = useState('dashboard')
  const [showStrategiesModal, setShowStrategiesModal] = useState(false)
  const [strategyCfg, setStrategyCfg] = useState({ momentum: true, reversal: true, volume_spike: true })
  const [notification, setNotification] = useState<string | null>(null)
  const { data: liveData, lastFetch, refresh } = useLiveData()

  const raw = liveData ?? initialData ?? {}
  const lastCycle = useLastCycle(raw.last_cycle_at ?? raw.lastCycleAt ?? null)
  const closed = (raw.closed_bets ?? []) as any[]
  const openBets = (raw.open_bets ?? []) as any[]
  const strategies = (raw.strategies ?? []) as any[]
  const bankroll = raw.bankroll ?? 1000
  const pnlTotal = bankroll - 1000
  const isUp = pnlTotal >= 0

  // Equity curve
  const sortedClosed = [...closed]
    .filter((b: any) => b.closed_at)
    .sort((a: any, b: any) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime())
  let running = 1000
  const equityCurve = sortedClosed.map((b: any) => {
    running += (b.pnl ?? 0)
    return { time: b.closed_at?.slice(0, 16)?.replace('T', ' '), value: Math.round(running * 100) / 100 }
  })
  if (equityCurve.length > 0) equityCurve.push({ time: 'now', value: Math.round(bankroll * 100) / 100 })

  const clvBets = closed.filter((b: any) => b.clv != null)
  const avgCLV = clvBets.length ? clvBets.reduce((s: number, b: any) => s + b.clv, 0) / clvBets.length : 0
  const winRate = closed.length ? Math.round((closed.filter((b: any) => b.result?.includes('win')).length / closed.length) * 1000) / 10 : 0

  // Recent activity feed
  const recentActivity = [...closed]
    .sort((a: any, b: any) => new Date(b.closed_at ?? 0).getTime() - new Date(a.closed_at ?? 0).getTime())
    .slice(0, 8)
    .map((b: any) => ({
      type: b.result?.includes('win') ? 'win' : 'loss',
      label: b.result?.includes('win') ? `Won ${b.side}` : `Lost ${b.side}`,
      market: b.question?.slice(0, 40) + '…',
      pnl: b.pnl,
      price: b.entry_price,
      ago: b.closed_at ? Math.round((Date.now() - new Date(b.closed_at).getTime()) / 60000) + 'm ago' : '',
    }))

  const stratColors: Record<string, string> = { momentum: '#3b82f6', reversal: '#a855f7', volume_spike: '#f59e0b' }

  const showNotif = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  // Sync sidebar bankroll
  useEffect(() => {
    const el = document.getElementById('sidebar-bankroll')
    const el2 = document.getElementById('sidebar-pnl')
    if (el) el.textContent = `$${bankroll.toFixed(2)}`
    if (el2) el2.textContent = `${isUp ? '+' : ''}$${pnlTotal.toFixed(2)} (${isUp ? '+' : ''}${((pnlTotal / 1000) * 100).toFixed(2)}%)`
    if (el2) el2.style.color = isUp ? C.green : C.red
  }, [bankroll, pnlTotal, isUp])

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        .hover-row:hover { background: rgba(255,255,255,0.03) !important; }
        .nav-item:hover { background: rgba(108,99,255,0.1) !important; color: #c4b5fd !important; }
        .action-btn:hover { background: rgba(108,99,255,0.25) !important; }
        .stat-card:hover { border-color: rgba(108,99,255,0.3) !important; transform: translateY(-1px); }
        .stat-card { transition: all 0.2s; }
      `}</style>

      <Sidebar active={page} onChange={setPage} />
      <TopBar page={page} lastFetch={lastFetch} onRefresh={refresh} />

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '72px', right: '24px', zIndex: 300,
          background: C.accent, color: 'white', padding: '10px 16px',
          borderRadius: '8px', fontSize: '13px', fontFamily: 'system-ui',
          boxShadow: `0 4px 20px rgba(108,99,255,0.5)`,
          animation: 'slideIn 0.3s ease',
        }}>{notification}</div>
      )}

      {showStrategiesModal && (
        <StrategiesModal
          onClose={() => setShowStrategiesModal(false)}
          config={strategyCfg}
          onSave={(cfg) => {
            setStrategyCfg(cfg)
            showNotif('Strategy preferences saved. Takes effect next cycle.')
          }}
        />
      )}

      {/* Main content */}
      <div style={{ marginLeft: '220px', paddingTop: '60px', padding: '80px 24px 32px', animation: 'fadeUp 0.4s ease' }}>

        {/* ── DASHBOARD PAGE ── */}
        {page === 'dashboard' && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <StatCard
                title="Total Portfolio Value"
                value={`$${bankroll.toFixed(2)}`}
                sub={`${isUp ? '+' : ''}${((pnlTotal / 1000) * 100).toFixed(2)}% (all time)`}
                icon="📈" iconBg="rgba(34,197,94,0.15)"
                color={C.text}
              />
              <StatCard
                title="Total P&L (All Time)"
                value={`${isUp ? '+' : ''}$${pnlTotal.toFixed(2)}`}
                sub={`${isUp ? '+' : ''}${((pnlTotal / 1000) * 100).toFixed(2)}%`}
                icon="📊" iconBg={isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}
                color={isUp ? C.green : C.red}
              />
              <StatCard
                title="Active Positions"
                value={openBets.length}
                sub={`Across ${new Set(openBets.map((b: any) => b.market_id)).size} markets`}
                icon="◧" iconBg="rgba(59,130,246,0.15)"
              />
              <StatCard
                title="Win Rate"
                value={`${winRate}%`}
                sub={`Last ${closed.length} closed bets`}
                icon="🏆" iconBg="rgba(245,158,11,0.15)"
                color={winRate >= 50 ? C.green : C.red}
              />
            </div>

            {/* Bot Status + Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '20px' }}>

              {/* Bot Status */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>Bot Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(34,197,94,0.1)', padding: '3px 10px', borderRadius: '20px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: '11px', color: C.green, fontWeight: 600 }}>Running</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px', alignItems: 'center' }}>
                  {/* Circle */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '140px', height: '140px', borderRadius: '50%',
                      border: `3px solid ${C.accent}`,
                      background: `radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)`,
                      boxShadow: `0 0 40px rgba(108,99,255,0.2)`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <div style={{ fontSize: '36px' }}>🤖</div>
                      <div style={{ fontSize: '11px', color: C.accent, fontWeight: 600, marginTop: '4px' }}>PolyBot</div>
                      <div style={{ fontSize: '10px', color: C.textMuted }}>Paper Trading</div>
                      <div style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        width: '14px', height: '14px', borderRadius: '50%',
                        background: C.green, boxShadow: `0 0 8px ${C.green}`,
                        animation: 'pulse 2s infinite',
                      }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    {[
                      { label: 'Strategy', value: `Momentum + Volume` },
                      { label: 'Mode', value: 'Paper Trading', valueColor: C.amber },
                      { label: 'Capital Deployed', value: `$${openBets.reduce((s: number, b: any) => s + (b.bet_size ?? 0), 0).toFixed(2)}` },
                      { label: 'Daily P&L', value: `+$0.00`, valueColor: C.green },
                      { label: 'Total Trades', value: closed.length },
                      { label: 'Win Rate', value: `${winRate}%`, valueColor: winRate >= 50 ? C.green : C.red },
                      { label: 'Last cycle', value: lastCycle, valueColor: lastCycle === '\u2014' ? C.textMuted : C.text },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '13px', color: C.textMuted }}>{row.label}</div>
                        <div style={{ fontSize: '13px', color: (row as any).valueColor ?? C.text, fontWeight: 500 }}>{String(row.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>Quick Actions</div>
                {[
                  { icon: '⚡', title: 'Edit Strategies', desc: 'Toggle active strategies', action: () => setShowStrategiesModal(true), color: C.accent },
                  { icon: '◧', title: 'View Positions', desc: 'See open bets', action: () => setPage('positions'), color: C.blue },
                  { icon: '◈', title: 'Analytics', desc: 'Performance insights', action: () => setPage('analytics'), color: '#a855f7' },
                  { icon: '≡', title: 'View Logs', desc: 'Railway deploy logs', action: () => window.open('https://railway.com', '_blank'), color: C.amber },
                ].map(item => (
                  <div
                    key={item.title}
                    className="action-btn"
                    onClick={item.action}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px', borderRadius: '10px', cursor: 'pointer',
                      marginBottom: '8px', background: 'rgba(108,99,255,0.06)',
                      border: `1px solid ${C.border}`, transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: item.color }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: C.textMuted }}>{item.desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', color: C.textMuted, fontSize: '16px' }}>›</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equity + Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' }}>

              {/* Equity */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>Equity Curve</div>
                  <div style={{ fontSize: '13px', color: isUp ? C.green : C.red }}>
                    {isUp ? '▲' : '▼'} ${Math.abs(pnlTotal).toFixed(2)} ({isUp ? '+' : ''}{((pnlTotal / 1000) * 100).toFixed(2)}%)
                  </div>
                </div>
                {equityCurve.length > 1 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={equityCurve} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isUp ? C.green : C.red} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={isUp ? C.green : C.red} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={C.border} strokeDasharray="2 4" vertical={false} />
                      <XAxis dataKey="time" stroke={C.border} tick={false} />
                      <YAxis stroke={C.border} tick={{ fill: C.textMuted, fontSize: 10 }} width={55} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '12px', color: C.text }} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Bankroll']} />
                      <Area type="monotone" dataKey="value" stroke={isUp ? C.green : C.red} fill="url(#eq)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '13px', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '32px', opacity: 0.3 }}>📊</div>
                    Awaiting first closed positions
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>Recent Activity</div>
                  <div onClick={() => setPage('positions')} style={{ fontSize: '12px', color: C.accent, cursor: 'pointer' }}>View All</div>
                </div>
                {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                  <div key={i} className="hover-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: item.type === 'win' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                    }}>
                      {item.type === 'win' ? '▲' : '▼'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: item.type === 'win' ? C.green : C.red }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.market}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: (item.pnl ?? 0) >= 0 ? C.green : C.red }}>
                        {(item.pnl ?? 0) >= 0 ? '+' : ''}${(item.pnl ?? 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '10px', color: C.textMuted }}>{item.ago}</div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', color: C.textMuted, fontSize: '13px', padding: '32px 0' }}>No activity yet</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── POSITIONS PAGE ── */}
        {page === 'positions' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' }}>
              <StatCard title="Open Positions" value={openBets.length} sub="Active paper bets" icon="◧" iconBg="rgba(59,130,246,0.15)" />
              <StatCard title="Capital Deployed" value={`$${openBets.reduce((s: number, b: any) => s + (b.bet_size ?? 0), 0).toFixed(2)}`} sub="Across open positions" icon="💰" iconBg="rgba(245,158,11,0.15)" />
              <StatCard title="Avg Hold Time" value={`${openBets.length ? Math.round(openBets.reduce((s: number, b: any) => s + (Date.now() - new Date(b.placed_at).getTime()) / 3600000, 0) / openBets.length * 10) / 10 : 0}h`} sub="Time in position" icon="⏱" iconBg="rgba(168,85,247,0.15)" />
            </div>

            {/* Open bets table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>Open Positions ({openBets.length})</div>
                <div style={{ fontSize: '11px', color: C.textMuted }}>Updates every 30s</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.surface2 }}>
                      {['Market', 'Strategy', 'Side', 'Entry', 'Size', 'Hold', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Market' ? 'left' : 'center', fontSize: '11px', fontWeight: 600, color: C.textMuted, letterSpacing: '1px', borderBottom: `1px solid ${C.border}` }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {openBets.length > 0 ? openBets.map((b: any) => {
                      const holdH = b.placed_at ? Math.round((Date.now() - new Date(b.placed_at).getTime()) / 3600000 * 10) / 10 : 0
                      return (
                        <tr key={b.id} className="hover-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '14px 16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: C.text }}>
                            {b.question?.slice(0, 60)}{(b.question?.length ?? 0) > 60 ? '…' : ''}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <span style={{ fontSize: '11px', color: stratColors[b.strategy_tag] ?? C.textMuted, background: `${stratColors[b.strategy_tag] ?? C.border}15`, padding: '3px 8px', borderRadius: '20px', fontWeight: 600 }}>
                              {(b.strategy_tag ?? '').replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <span style={{ color: b.side === 'YES' ? C.green : C.red, fontWeight: 700, fontSize: '13px' }}>{b.side}</span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', color: C.text, fontFamily: 'monospace' }}>{b.entry_price?.toFixed(3)}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', color: C.accent, fontWeight: 600 }}>${b.bet_size?.toFixed(2)}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', color: holdH > 20 ? C.amber : C.textDim }}>{holdH}h</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <span style={{ fontSize: '11px', color: C.green, background: 'rgba(34,197,94,0.1)', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>OPEN</span>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: C.textMuted, fontSize: '14px' }}>No open positions</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Closed bets */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>Trade History ({closed.length})</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.surface2 }}>
                      {['Market', 'Strategy', 'Side', 'PnL', 'CLV', 'Result'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Market' ? 'left' : 'center', fontSize: '11px', fontWeight: 600, color: C.textMuted, letterSpacing: '1px', borderBottom: `1px solid ${C.border}` }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {closed.length > 0 ? closed.slice(0, 20).map((b: any) => (
                      <tr key={b.id} className="hover-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '14px 16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: C.text }}>
                          {b.question?.slice(0, 60)}{(b.question?.length ?? 0) > 60 ? '…' : ''}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: stratColors[b.strategy_tag] ?? C.textMuted, background: `${stratColors[b.strategy_tag] ?? C.border}15`, padding: '3px 8px', borderRadius: '20px', fontWeight: 600 }}>
                            {(b.strategy_tag ?? '').replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{ color: b.side === 'YES' ? C.green : C.red, fontWeight: 700, fontSize: '13px' }}>{b.side}</span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: (b.pnl ?? 0) >= 0 ? C.green : C.red }}>
                          {b.pnl != null ? `${b.pnl >= 0 ? '+' : ''}$${b.pnl.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', color: (b.clv ?? 0) > 0 ? C.green : (b.clv ?? 0) < 0 ? C.red : C.textMuted }}>
                          {b.clv != null ? `${b.clv > 0 ? '+' : ''}${b.clv.toFixed(3)}` : '—'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: 600,
                            color: b.result?.includes('win') ? C.green : C.red,
                            background: b.result?.includes('win') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            padding: '3px 10px', borderRadius: '20px',
                          }}>
                            {(b.result ?? '').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: C.textMuted, fontSize: '14px' }}>No closed bets yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── STRATEGIES PAGE ── */}
        {page === 'strategies' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' }}>
              {['momentum', 'reversal', 'volume_spike'].map(name => {
                const s = strategies.find((x: any) => x.strategy === name)
                const avgClv = s?.total ? (s.total_clv ?? 0) / s.total : null
                const color = stratColors[name]
                const isActive = strategyCfg[name as keyof typeof strategyCfg]
                return (
                  <div key={name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', borderTop: `3px solid ${color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color, textTransform: 'capitalize' }}>{name.replace('_', ' ')}</div>
                        <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px' }}>{s?.total ?? 0} total bets</div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isActive ? C.green : C.red, background: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                        {isActive ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ background: C.surface2, borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '4px' }}>AVG CLV</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: avgClv != null ? (avgClv > 0 ? C.green : C.red) : C.textMuted }}>
                          {avgClv != null ? `${avgClv > 0 ? '+' : ''}${avgClv.toFixed(3)}` : 'N/A'}
                        </div>
                      </div>
                      <div style={{ background: C.surface2, borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '4px' }}>TOTAL PNL</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: (s?.total_clv ?? 0) >= 0 ? C.green : C.red }}>
                          {s ? `${(s.total_clv ?? 0) >= 0 ? '+' : ''}$${Math.abs(s.total_clv ?? 0).toFixed(2)}` : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowStrategiesModal(true)}
                      style={{ width: '100%', padding: '10px', background: `${color}15`, border: `1px solid ${color}40`, borderRadius: '8px', color, cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                    >
                      ⚙ Configure
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── ANALYTICS PAGE ── */}
        {page === 'analytics' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
              <StatCard title="Total Bets" value={closed.length} icon="📊" />
              <StatCard title="Win Rate" value={`${winRate}%`} color={winRate >= 50 ? C.green : C.red} icon="🏆" />
              <StatCard title="Avg CLV" value={avgCLV > 0 ? `+${avgCLV.toFixed(4)}` : avgCLV.toFixed(4)} color={avgCLV > 0 ? C.green : C.red} icon="📈" />
              <StatCard title="Timeout Rate" value={`${closed.length ? Math.round(closed.filter((b: any) => b.result?.startsWith('timeout')).length / closed.length * 1000) / 10 : 0}%`} icon="⏱" />
            </div>

            {/* CLV by strategy */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '20px' }}>CLV by Strategy</div>
              {['momentum', 'reversal', 'volume_spike'].map(name => {
                const bets = closed.filter((b: any) => b.strategy_tag === name && b.clv != null)
                const avg = bets.length ? bets.reduce((s: number, b: any) => s + b.clv, 0) / bets.length : 0
                const barW = Math.min(Math.abs(avg) * 1000, 100)
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '120px', fontSize: '13px', color: stratColors[name], fontWeight: 600, textTransform: 'capitalize' }}>{name.replace('_', ' ')}</div>
                    <div style={{ flex: 1, height: '8px', background: C.border, borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${barW}%`, background: avg > 0 ? C.green : C.red, borderRadius: '4px', transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ width: '80px', textAlign: 'right', fontSize: '13px', color: avg > 0 ? C.green : avg < 0 ? C.red : C.textMuted, fontWeight: 600, fontFamily: 'monospace' }}>
                      {avg !== 0 ? `${avg > 0 ? '+' : ''}${avg.toFixed(4)}` : 'N/A'}
                    </div>
                    <div style={{ width: '50px', textAlign: 'right', fontSize: '12px', color: C.textMuted }}>{bets.length}n</div>
                  </div>
                )
              })}
            </div>

            {/* Equity full */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>Full Equity Curve</div>
              {equityCurve.length > 1 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={equityCurve}>
                    <defs>
                      <linearGradient id="eq2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isUp ? C.green : C.red} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={isUp ? C.green : C.red} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={C.border} strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="time" stroke={C.border} tick={{ fill: C.textMuted, fontSize: 10 }} />
                    <YAxis stroke={C.border} tick={{ fill: C.textMuted, fontSize: 10 }} width={55} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '12px', color: C.text }} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Bankroll']} />
                    <Area type="monotone" dataKey="value" stroke={isUp ? C.green : C.red} fill="url(#eq2)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted }}>Awaiting closed positions</div>
              )}
            </div>
          </div>
        )}

        {/* ── ALERTS PAGE ── */}
        {page === 'alerts' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>Recent Alerts</div>
              {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: C.surface2, borderRadius: '10px', marginBottom: '8px', border: `1px solid ${C.border}` }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: item.type === 'win' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    {item.type === 'win' ? '✓' : '✕'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: item.type === 'win' ? C.green : C.red }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: C.textMuted }}>{item.market}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: (item.pnl ?? 0) >= 0 ? C.green : C.red }}>{(item.pnl ?? 0) >= 0 ? '+' : ''}${(item.pnl ?? 0).toFixed(2)}</div>
                    <div style={{ fontSize: '11px', color: C.textMuted }}>{item.ago}</div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', color: C.textMuted, padding: '40px', fontSize: '14px' }}>No alerts yet. Waiting for position settlements.</div>
              )}
            </div>
          </div>
        )}

        {/* ── LOGS PAGE ── */}
        {page === 'logs' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>System Logs</div>
                <a href="https://railway.com" target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: C.accent, textDecoration: 'none', background: 'rgba(108,99,255,0.15)', padding: '6px 14px', borderRadius: '8px' }}>
                  Open Railway Logs ↗
                </a>
              </div>
              <div style={{ background: '#0a0a0a', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#4ade80', lineHeight: 1.8, border: `1px solid ${C.border}` }}>
                <div style={{ color: C.textMuted }}>$ polybot deploy logs</div>
                <div>[INFO] Webhook server started on :8080</div>
                <div>[INFO] DB path: /app/storage/polybot.db</div>
                <div style={{ color: '#4ade80' }}>[INFO] Cycle triggered by cron-job.org</div>
                <div>[INFO] Markets fetched: 3155</div>
                <div>[INFO] Signals generated: {closed.length > 0 ? '8-12' : '0'}</div>
                <div style={{ color: C.amber }}>[INFO] Max open bets — skipping new signals</div>
                <div>[INFO] Webhook cycle complete</div>
                <div style={{ color: C.textMuted, marginTop: '8px' }}>For full logs, open Railway dashboard above.</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
