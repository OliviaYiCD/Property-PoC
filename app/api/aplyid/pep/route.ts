import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Build v4 signature: base64(HMAC_SHA256(secret, Aply-Date + body))
function aplySignature(secret: string, dateIso: string, body: any) {
  const h = crypto.createHmac("sha256", secret);
  h.update(dateIso);
  if (body !== null && body !== undefined) {
    h.update(typeof body === "string" ? body : JSON.stringify(body));
  }
  return h.digest("base64");
}

/**
 * POST /api/aplyid/pep
 * Body: { firstname, lastname, dob: "DD/MM/YYYY", reference? }
 * Uses v4 PEP endpoint with Signature auth.
 */
export async function POST(req: NextRequest) {
  const FAKE =
    req.nextUrl.searchParams.get("fake") === "1" ||
    String(process.env.APLYID_FAKE_START || "").toLowerCase() === "true";

  const input = await req.json().catch(() => ({}));
  const {
    firstname = "Test",
    lastname = "User",
    dob = "01/01/1990", // DD/MM/YYYY required by v4 PEP
    reference = `PEP-${Date.now()}`,
  } = input || {};

  if (FAKE) {
    return NextResponse.json({
      ok: true,
      fake: true,
      used: "FAKE",
      raw: {
        reference,
        firstname,
        lastname,
        date_of_birth: dob,
        is_pep_watchlist_clear: true,
      },
    });
  }

  const base = process.env.APLYID_BASE_URL?.trim() || "https://integration.aplyid.com";
  const url = `${base}/api/v4/pep_checks`;

  const key = process.env.APLYID_API_KEY || "";
  const secret = process.env.APLYID_API_SECRET || "";
  if (!key || !secret) {
    return NextResponse.json(
      { ok: false, error: "Missing APLYID_API_KEY/APLYID_API_SECRET" },
      { status: 500 }
    );
  }

  const payload = { reference, firstname, lastname, date_of_birth: dob };
  const aplyDate = new Date().toISOString();
  const aplySig = aplySignature(secret, aplyDate, payload);

  try {
    const res = await fetch(url, {
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

    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = { raw: text };
    }

    if (!res.ok && res.status !== 201) {
      return NextResponse.json(
        {
          ok: false,
          error: "APLYiD v4 PEP rejected",
          status: res.status,
          url,
          payload,
          bodyText: text,
          data,
          hint:
            "Confirm PEP/AML is enabled on your tenant, region/base URL is correct, and Allowed Domains/IPs are configured.",
        },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json({ ok: true, used: url, raw: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `Network error: ${e?.message || e}`, url },
      { status: 500 }
    );
  }
}