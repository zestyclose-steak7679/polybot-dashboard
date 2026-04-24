import { NextResponse } from "next/server";

const RAILWAY_URL = "https://polybot-prediction-system-production.up.railway.app";

export async function GET() {
  try {
    const res = await fetch(`${RAILWAY_URL}/api/state`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`Railway returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
