// app/api/aplyid/start/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * ENV you must set in Vercel (and .env.local for local dev):
 *  APLYID_BASE_URL=https://integration.aplyid.com
 *  APLYID_API_KEY=your_key
 *  APLYID_API_SECRET=your_secret
 *  APLYID_START_PATH=/api/v4/identity-verifications        // <-- ask APLYiD for the exact path your account uses
 *  APLYID_FAKE_START=false                                  // set true to bypass APLYiD (returns a fake link)
 */

function jsonError(status: number, msg: string, extra?: any) {
  return new NextResponse(JSON.stringify({ ok: false, error: msg, ...extra }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      verificationType, // "Biometric" | "Biometric + AML" | "AML"
      delivery,         // "sms" | "email"
      redirect_success_url,
      redirect_cancel_url,
    } = body || {};

    // Basic validation
    if (!firstName || !lastName) {
      return jsonError(400, "Missing firstName/lastName");
    }
    if (verificationType === "AML") {
      if (!email || !dob) return jsonError(400, "AML requires email and dob (YYYY-MM-DD).");
    } else {
      if (delivery === "sms" && !phone) return jsonError(400, "SMS delivery requires phone.");
      if (delivery === "email" && !email) return jsonError(400, "Email delivery requires email.");
    }

    // --- Fake mode (for PoC testing, no external call)
    if ((process.env.APLYID_FAKE_START || "").toLowerCase() === "true") {
      return NextResponse.json({
        ok: true,
        start_process_url: `${redirect_success_url || "/" }?fake=1`,
        note: "APLYID_FAKE_START=true (bypassing external API)",
      });
    }

    // Prepare payload for APLYiD
    // The exact shape varies by region/plan. This generic shape matches “link/SMS start” patterns.
    // Adjust keys to match your APLYiD docs if needed.
    const communication_method = verificationType === "AML" ? "link" : (delivery === "sms" ? "sms" : "link");

    const payload: Record<string, any> = {
      reference: `VOI-${Date.now()}`,
      firstname: firstName,
      lastname: lastName,
      email,
      communication_method,
      redirect_success_url,
      redirect_cancel_url,
    };

    if (communication_method === "sms") payload.contact_phone = phone; // should be 61… format already from client if needed
    if (verificationType === "AML") payload.date_of_birth = dob;

    // Indicate verification style
    // Some APLYiD accounts use booleans/flags, others use product codes.
    // Provide both common forms; your account may require only one of these:
    if (verificationType === "Biometric") {
      payload.biometric_only = true;
    } else if (verificationType === "Biometric + AML") {
      payload.biometric_only = false;
      payload.include_aml = true;
    } else if (verificationType === "AML") {
      payload.aml_only = true;
    }

    // Target endpoint
    const base = process.env.APLYID_BASE_URL || "https://integration.aplyid.com";
    const path = process.env.APLYID_START_PATH || "/api/v4/identity-verifications"; // <-- confirm with APLYiD
    const url = `${base}${path}`;

    // Call APLYiD
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Aply-API-Key": process.env.APLYID_API_KEY || "",
        "Aply-Secret": process.env.APLYID_API_SECRET || "",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }).catch((e) => {
      throw new Error(`Network error calling APLYiD: ${e?.message || e}`);
    });

    const text = await res.text(); // read raw text first (so we can report HTML errors)
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      // Not JSON (often HTML error page)
      if (!res.ok) {
        return jsonError(res.status, "APLYiD error (non-JSON)", { text });
      }
      // OK but empty/non-JSON; return raw text
      return NextResponse.json({ ok: true, raw: text });
    }

    if (!res.ok) {
      return jsonError(res.status, "APLYiD error", { data });
    }

    // We expect a start link in one of these fields
    const start_process_url =
      data.start_process_url || data.url || data.link || null;

    return NextResponse.json({ ok: true, ...data, start_process_url });
  } catch (e: any) {
    return jsonError(500, e?.message || "Internal error");
  }
}
