'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard({ initialData }: { initialData: any }) {
  if (!initialData || initialData.error) {
    return <div style={{color:'#e8e8e8',padding:'40px',textAlign:'center'}}>{initialData?.error ?? 'Loading...'}</div>
  }

  const { bankroll, bankrollHistory, benchmarks, strategies, open_bets, closed_bets } = initialData

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'#e8e8e8',padding:'24px',fontFamily:'JetBrains Mono, monospace'}}>
      <h1 style={{fontSize:'22px',fontWeight:'bold',color:'#00ff88',letterSpacing:'4px',marginBottom:'24px'}}>POLYBOT CONTROL ROOM</h1>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'16px'}}>
        <Card title="Bankroll" value={`$${bankroll.toFixed(2)}`} />
        <Card title="Daily PnL" value={`$${benchmarks.dailyPnL.toFixed(2)}`} color={benchmarks.dailyPnL >= 0 ? '#00ff88' : '#ff3355'} />
        <Card title="ROI" value={`${benchmarks.dailyROI.toFixed(2)}%`} color={benchmarks.dailyROI >= 0 ? '#00ff88' : '#ff3355'} />
        <Card title="Avg CLV" value={benchmarks.avgCLV ? benchmarks.avgCLV.toFixed(4) : 'N/A'} color={benchmarks.avgCLV > 0 ? '#00ff88' : '#ff3355'} />
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'16px'}}>
        <Card title="Signals Today" value={benchmarks.signalsToday} />
        <Card title="Open Bets" value={open_bets.length} />
        <Card title="Closed Bets" value={benchmarks.totalBets} />
      </div>

      <div style={{background:'#111111',border:'1px solid #1e1e1e',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
        <div style={{fontSize:'12px',color:'#888',marginBottom:'12px'}}>Bankroll History</div>
        {bankrollHistory.length > 1 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={bankrollHistory}>
              <defs>
                <linearGradient id="clr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff88" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e1e1e" />
              <XAxis dataKey="time" stroke="#444" tick={false} />
              <YAxis stroke="#444" domain={['auto','auto']} tick={{fill:'#888',fontSize:11}} />
              <Tooltip contentStyle={{background:'#111',border:'1px solid #1e1e1e',color:'#e8e8e8'}} />
              <Area type="monotone" dataKey="value" stroke="#00ff88" fill="url(#clr)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{height:'250px',display:'flex',alignItems:'center',justifyContent:'center',color:'#444'}}>
            Accumulating data — check back after a few cycles
          </div>
        )}
      </div>

      <div style={{background:'#111111',border:'1px solid #1e1e1e',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
        <div style={{fontSize:'12px',color:'#888',marginBottom:'12px'}}>Strategies</div>
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
          {strategies.length > 0 ? strategies.map((s: any) => (
            <span key={s.strategy} style={{padding:'4px 12px',borderRadius:'20px',background:'#1e1e1e',color:'#00ff88',fontSize:'12px'}}>
              {s.strategy} · {s.total} bets · CLV {s.total_clv ? (s.total_clv / s.total).toFixed(3) : 'N/A'}
            </span>
          )) : ['momentum','reversal','volume_spike'].map(s => (
            <span key={s} style={{padding:'4px 12px',borderRadius:'20px',background:'#1e1e1e',color:'#00ff88',fontSize:'12px'}}>{s} ACTIVE</span>
          ))}
        </div>
      </div>

      <div style={{background:'#111111',border:'1px solid #1e1e1e',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
        <div style={{fontSize:'12px',color:'#888',marginBottom:'12px'}}>Recent Closed Bets</div>
        <table style={{width:'100%',fontSize:'11px',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{color:'#444',borderBottom:'1px solid #1e1e1e'}}>
              <th style={{textAlign:'left',padding:'4px'}}>Market</th>
              <th>Strategy</th><th>Side</th><th>PnL</th><th>CLV</th><th>Result</th>
            </tr>
          </thead>
          <tbody>
            {closed_bets.slice(0,10).map((b: any) => (
              <tr key={b.id} style={{borderBottom:'1px solid #111'}}>
                <td style={{padding:'4px',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.question?.slice(0,45)}...</td>
                <td style={{textAlign:'center'}}>{b.strategy_tag}</td>
                <td style={{textAlign:'center'}}>{b.side}</td>
                <td style={{textAlign:'center',color: b.pnl >= 0 ? '#00ff88' : '#ff3355'}}>${b.pnl?.toFixed(2)}</td>
                <td style={{textAlign:'center',color: b.clv > 0 ? '#00ff88' : '#ff3355'}}>{b.clv?.toFixed(3)}</td>
                <td style={{textAlign:'center',color:'#888'}}>{b.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{fontSize:'11px',color:'#444'}}>Last updated: {new Date().toLocaleString()}</div>
    </div>
  )
}

function Card({ title, value, color = '#e8e8e8' }: { title: string; value: any; color?: string }) {
  return (
    <div style={{background:'#111111',border:'1px solid #1e1e1e',borderRadius:'12px',padding:'16px'}}>
      <div style={{fontSize:'11px',color:'#888',marginBottom:'4px'}}>{title}</div>
      <div style={{fontSize:'20px',fontWeight:'bold',color}}>{value}</div>
    </div>
  )
}
