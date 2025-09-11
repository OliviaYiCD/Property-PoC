import { NextResponse } from "next/server";

/**
 * Placeholder AML route so your front end stops 404-ing.
 * Returns ok:true and echoes back what was sent.
 * Replace the TODO section with a real APLYiD AML call when ready.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // TODO: call APLYiD AML endpoint here (v4 screening / KYB / etc.)
    // Example header shape when you wire it:
    // const res = await fetch(`${process.env.APLYID_BASE_URL}/api/v4/<aml-endpoint>`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //     "Aply-API-Key": process.env.APLYID_API_KEY || "",
    //     "Aply-Secret": process.env.APLYID_API_SECRET || "",
    //   },
    //   body: JSON.stringify({...}),
    // });
    // const data = await res.json();

    return NextResponse.json({
      ok: true,
      received: body,
      // report_url: data?.report_url, // when you wire the real API
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "AML route failed" },
      { status: 500 }
    );
  }
}
