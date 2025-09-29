// app/api/aml/route.ts
import { NextResponse } from "next/server";

const BASE = process.env.REALAML_BASE_URL!; // e.g. https://api-staging.realaml.com/api/v1
const KEY  = process.env.REALAML_API_KEY!;

type Body = {
  path: string;                                 // e.g. "/verifications/" (keep slash)
  method?: "POST" | "GET" | "PUT" | "PATCH";
  payload?: unknown;                             // body for non-GET
  search?: Record<string, string | number>;      // optional query params
};

function safePath(p: string) {
  if (!p.startsWith("/")) throw new Error("path must start with '/'");
  if (p.includes("..")) throw new Error("invalid path");
  return p;
}

async function follow(url: string, init: RequestInit, maxRedirects = 2) {
  let current = url;
  let resp = await fetch(current, { ...init, redirect: "manual", cache: "no-store" });
  let n = 0;
  while ([301, 302, 307, 308].includes(resp.status) && n < maxRedirects) {
    const loc = resp.headers.get("location");
    if (!loc) break;
    current = new URL(loc, current).toString();
    resp = await fetch(current, { ...init, redirect: "manual", cache: "no-store" });
    n++;
  }
  return resp;
}

export async function POST(req: Request) {
  if (!BASE || !KEY) {
    return NextResponse.json({ error: "Missing REALAML env vars" }, { status: 500 });
  }

  try {
    const { path, method = "POST", payload, search }: Body = await req.json();
    const spath = safePath(path);

    const url = new URL(`${BASE}${spath}`);
    if (search) for (const [k, v] of Object.entries(search)) url.searchParams.set(k, String(v));

    const init: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Api-Key ${KEY}`,
      },
      body: method === "GET" ? undefined : JSON.stringify(payload ?? {}),
    };

    const upstream = await follow(url.toString(), init);
    const ct = upstream.headers.get("content-type") || "";
    const raw = await upstream.text();
    let data: any = raw;
    if (ct.includes("application/json")) {
      try { data = JSON.parse(raw); } catch {}
    }

    return NextResponse.json({ url: url.toString(), status: upstream.status, ok: upstream.ok, data }, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "proxy failed" }, { status: 500 });
  }
}