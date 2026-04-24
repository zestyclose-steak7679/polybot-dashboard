import { NextResponse } from "next/server";

const RAILWAY_URL = "https://polybot-prediction-system-production.up.railway.app";

export async function GET() {
  try {
    const res = await fetch(`${RAILWAY_URL}/api/state`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`Railway ${res.status}`);
    const raw = await res.json();

    const closed = raw.closed_bets ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const todayBets = closed.filter((b: any) => b.closed_at?.startsWith(today));
    const dailyPnL = todayBets.reduce((s: number, b: any) => s + (b.pnl ?? 0), 0);
    const signalsToday = (raw.market_log ?? []).filter((m: any) => m.logged_at?.startsWith(today)).length;

    const bankrollHistory = (raw.market_log ?? [])
      .slice(0, 50)
      .reverse()
      .map((m: any) => ({ time: m.logged_at, value: raw.bankroll }));

    return NextResponse.json({
      bankroll: raw.bankroll ?? 1000,
      open_bets: raw.open_bets ?? [],
      closed_bets: closed,
      strategies: raw.strategies ?? [],
      bankrollHistory,
      benchmarks: {
        dailyPnL: Math.round(dailyPnL * 100) / 100,
        dailyROI: raw.bankroll ? Math.round((dailyPnL / raw.bankroll) * 10000) / 100 : 0,
        signalsToday,
        totalBets: closed.length,
        avgCLV: closed.length ? closed.reduce((s: number, b: any) => s + (b.clv ?? 0), 0) / closed.length : 0,
      },
      regime: { confirmed: "neutral", candidate: "—", count: 0 },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
