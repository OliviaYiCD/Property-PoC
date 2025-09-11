// app/api/aplyid/send-text/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Minimal required fields (we’ll post from /voi next)
  const payload = {
    contact_phone: body.contact_phone,          // e.g. "61412345678" (no +)
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,                          // useful for AML / notifications
    reference: body.reference || "VOI-DEMO",
    communication_method: body.communication_method || "link", // "sms" or "link"
    redirect_success_url: body.redirect_success_url,            // optional
    redirect_cancel_url: body.redirect_cancel_url,              // optional
  };

  const res = await fetch(`${process.env.APLYID_BASE_URL}/api/v2/send_text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Aply-API-Key": process.env.APLYID_API_KEY || "",
      "Aply-Secret": process.env.APLYID_API_SECRET || "",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json({ ok: false, status: res.status, data }, { status: 500 });
  }

  // If communication_method:"link", APLYiD returns { start_process_url, transaction_id }
  return NextResponse.json({ ok: true, ...data });
}
