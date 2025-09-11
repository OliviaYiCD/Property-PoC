import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, type } = body;

    const baseUrl = process.env.APLYID_BASE_URL || "https://integration.aplyid.com";
    const startPath = process.env.APLYID_START_PATH || "/api/v4/identity-verifications";

    const authString = Buffer.from(
      `${process.env.APLYID_API_KEY}:${process.env.APLYID_API_SECRET}`
    ).toString("base64");

    const res = await fetch(`${baseUrl}${startPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        type, // "biometric", "biometric+aml", "aml-only"
      }),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "APLYiD error", status: res.status, data: json },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true, data: json });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
