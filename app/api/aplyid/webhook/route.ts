import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = `Basic ${Buffer.from(
    `${process.env.WEBHOOK_USER}:${process.env.WEBHOOK_PASS}`
  ).toString("base64")}`;

  if (auth !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log("Webhook received:", body);

  // TODO: save webhook event to database or logs
  return NextResponse.json({ ok: true });
}
