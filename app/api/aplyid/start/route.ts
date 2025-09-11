import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const DEPLOY_BASE =
  process.env.APLYID_REDIRECT_BASE?.trim() ||
  "https://property-po-c-cwf7.vercel.app"; // must be in Allowed Domains

function sign(secret: string, dateIso: string, body: any) {
  const h = crypto.createHmac("sha256", secret);
  h.update(dateIso);
  if (body !== null && body !== undefined) {
    h.update(typeof body === "string" ? body : JSON.stringify(body));
  }
  return h.digest("base64");
}

export async function POST(req: NextRequest) {
  const fake = req.nextUrl.searchParams.get("fake");
  const FAKE =
    fake === "1" || String(process.env.APLYID_FAKE_START || "").toLowerCase() === "true";

  if (FAKE) {
    return NextResponse.json({
      ok: true,
      fake: true,
      start_process_url: "https://verify.aplyid.com/demo?id=DEMO-123",
    });
  }

  const bodyIn = await req.json().catch(() => ({}));
  const {
    firstname = "Test",
    lastname = "User",
    email,
    phone,
    mode = "biometric_aml",     // "biometric" | "aml_only" | "biometric_aml"
    communication_method = "link", // "link" | "sms" | "email"
    dob,                        // optional; not required for biometric
  } = bodyIn;

  const base = process.env.APLYID_BASE_URL?.trim() || "https://integration.aplyid.com";
  const url = `${base}/api/v4/identity-verifications`;

  const key = process.env.APLYID_API_KEY || "";
  const secret = process.env.APLYID_API_SECRET || "";
  if (!key || !secret) {
    return NextResponse.json({ ok: false, error: "Missing APLYID_API_KEY/APLYID_API_SECRET" }, { status: 500 });
  }

  // Choose products for v4 identity-verifications
  const products =
    mode === "aml_only" ? ["aml"] :
    mode === "biometric" ? ["biometric"] : ["biometric", "aml"];

  const payload: any = {
    reference: `VOI-${Date.now()}`,
    firstname,
    lastname,
    products,
    communication_method,
    redirect_success_url: `${DEPLOY_BASE}/voi/thanks`, // must be https + allowed
    redirect_cancel_url: `${DEPLOY_BASE}/voi/thanks`,
  };
  if (email) payload.email = email;
  if (phone) payload.phone = phone;
  if (dob) payload.dob = dob;

  const aplyDate = new Date().toISOString();
  const aplySig = sign(secret, aplyDate, payload);

  let res: Response, text = "", data: any = undefined;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Aply-API-Key": key,
        "Aply-Date": aplyDate,
        "Aply-Signature": aplySig,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    text = await res.text();
    try { data = text ? JSON.parse(text) : undefined; } catch { data = { raw: text }; }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: `Network error: ${e?.message || e}` }, { status: 500 });
  }

  if (!res.ok && res.status !== 201) {
    // return request_id if present to help APLYiD support
    const requestId = (res.headers.get("x-request-id") || data?.metadata?.request_id || "").toString();
    return NextResponse.json(
      {
        ok: false,
        error: "APLYiD identity-verifications rejected",
        status: res.status,
        request_id: requestId || undefined,
        url,
        payload,
        bodyText: text,
        data,
        hint:
          "Check: (1) Biometric product is enabled on tenant; (2) Allowed Domains includes your DEPLOY_BASE; " +
          "(3) IP allowlist is empty; (4) Using v4 Signature headers (Key/Date/Signature).",
      },
      { status: res.status || 500 }
    );
  }

  const startUrl = data?.start_process_url || data?.start_url || data?.url || data?.link || null;
  return NextResponse.json({ ok: true, used: url, start_process_url: startUrl, raw: data });
}