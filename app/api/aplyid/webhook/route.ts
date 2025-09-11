import { NextRequest, NextResponse } from "next/server";

// PoC in-memory store (not persistent on Vercel cold starts)
const recentEvents: any[] = [];

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const ok = process.env.APLYID_WEBHOOK_SECRET
    ? auth === `Bearer ${process.env.APLYID_WEBHOOK_SECRET}`
    : true;

  if (!ok) return new NextResponse("Unauthorized", { status: 401 });

  const payload = await req.json().catch(() => ({}));
  recentEvents.unshift({ receivedAt: new Date().toISOString(), payload });
  if (recentEvents.length > 50) recentEvents.pop();

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ items: recentEvents });
}
