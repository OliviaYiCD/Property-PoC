"use client";

import { useMemo, useState } from "react";

type ProxyResult = { status?: number; ok?: boolean; data?: any; url?: string };

function toE164AU(input: string) {
  const d = input.replace(/\D/g, "");
  if (!d) return input;
  if (d.startsWith("04")) return `+61${d.slice(1)}`;
  if (d.startsWith("0"))  return `+61${d.slice(1)}`;
  if (d.startsWith("61")) return `+${d}`;
  if (d.startsWith("4"))  return `+61${d}`;
  if (input.startsWith("+")) return input;
  return input;
}

// Try likely list endpoints in order
const HISTORY_CANDIDATES: { path: string; method: "POST" | "GET"; payload?: any }[] = [
  // Most APIs expose a search endpoint
  { path: "/verifications/search/", method: "POST", payload: {} },
  { path: "/verifications/search", method: "POST", payload: {} },
  // Some expose GET list (if allowed)
  { path: "/verifications/", method: "GET" },
  { path: "/verifications", method: "GET" },
];

export default function AmlPage() {
  // --- Create form ---
  const [apiPath, setApiPath] = useState("/verifications/"); // keep trailing slash to avoid 301→GET
  const [firstName, setFirstName] = useState("MOCK");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName]   = useState("PASS");
  const [birthDate, setBirthDate] = useState("1900-01-01");
  const [email, setEmail]         = useState("test@example.com");
  const [mobile, setMobile]       = useState("0468920567");
  const [captureIds, setCaptureIds] = useState(true);
  const [runPep, setRunPep]       = useState(false);

  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [createRes, setCreateRes] = useState<ProxyResult | null>(null);

  // status lookup
  const [sigKey, setSigKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusErr, setStatusErr] = useState<string | null>(null);
  const [statusRes, setStatusRes] = useState<ProxyResult | null>(null);

  // history
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyErr, setHistoryErr] = useState<string | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [historyLog, setHistoryLog] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const payload = useMemo(() => ({
    first_name: firstName.trim(),
    middle_name: middleName.trim() || undefined, // FM1..FM8
    last_name: lastName.trim(),                  // PASS|PARTIAL|FAIL
    birth_date: birthDate.trim(),                // 1900-01-0X
    email: email.trim(),
    mobile_number: toE164AU(mobile.trim()),
    capture_two_ids: captureIds,
    run_pep_check: runPep,
  }), [firstName, middleName, lastName, birthDate, email, mobile, captureIds, runPep]);

  function validate(): string | null {
    if (!apiPath.startsWith("/")) return "API path must start with '/'.";
    if (!firstName) return "First name is required.";
    if (!lastName) return "Last name is required.";
    if (!birthDate) return "Birth date is required (YYYY-MM-DD).";
    if (!email || !email.includes("@")) return "Valid email required.";
    if (!mobile) return "Mobile number required.";
    return null;
    }

  async function createVerification(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { setCreateErr(v); return; }

    setCreating(true);
    setCreateErr(null);
    setCreateRes(null);
    setStatusErr(null);
    setStatusRes(null);

    try {
      const r = await fetch("/api/aml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: apiPath, payload }),
      });
      const json = (await r.json()) as ProxyResult;
      if (!r.ok) setCreateErr(`Upstream error (${json.status ?? r.status})`);
      setCreateRes(json);

      const key = (json?.data && typeof json.data === "object")
        ? (json.data as any).signature_key as string | undefined
        : undefined;
      if (key) setSigKey(key);
    } catch (e: any) {
      setCreateErr(e?.message ?? "Unexpected error");
    } finally {
      setCreating(false);
    }
  }

  async function refreshLatest() {
    if (!sigKey) {
      setStatusErr("No signature_key yet. Create a verification first.");
      return;
    }
    setRefreshing(true);
    setStatusErr(null);
    setStatusRes(null);
    try {
      const r = await fetch("/api/aml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `/verifications/${sigKey}/`,
          method: "GET",
        }),
      });
      const json = (await r.json()) as ProxyResult;
      if (!r.ok) setStatusErr(`Upstream error (${json.status ?? r.status})`);
      setStatusRes(json);
    } catch (e: any) {
      setStatusErr(e?.message ?? "Failed to refresh status");
    } finally {
      setRefreshing(false);
    }
  }

  // Render helpers for history rows
  function renderName(row: any) {
    return row?.contact_name || row?.name || [row?.first_name, row?.last_name].filter(Boolean).join(" ") || "—";
  }
  function renderType(row: any) {
    return row?.type || row?.check_type || "—";
  }
  function renderStatus(row: any) {
    return row?.status || row?.check_status || row?.result || "—";
  }
  function renderRisk(row: any) {
    return row?.risk_score ?? row?.risk ?? "—";
  }
  function renderEmail(row: any) {
    return row?.email || row?.contact_email || "—";
  }
  function renderDate(row: any) {
    const s = row?.created_at || row?.created || row?.createdAt || row?.date;
    if (!s) return "—";
    try { return new Date(s).toLocaleString(); } catch { return String(s); }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryErr(null);
    setHistory(null);
    setHistoryLog([]);

    try {
      for (const cand of HISTORY_CANDIDATES) {
        const attempt = `→ ${cand.method} ${cand.path}`;
        setHistoryLog((l) => [...l, attempt]);

        const body =
          cand.method === "GET"
            ? { path: cand.path, method: "GET", search: { page, page_size: pageSize } }
            : { path: cand.path, method: "POST", payload: { ...(cand.payload || {}), page, page_size: pageSize } };

        const r = await fetch("/api/aml", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = (await r.json()) as ProxyResult;

        if (!r.ok) {
          setHistoryLog((l) => [...l, `  status ${json.status ?? r.status}`]);
          // keep trying next candidate on 404/405/501 etc.
          if (r.status === 404 || r.status === 405 || r.status === 501) continue;
          // if we got JSON that suggests “use POST search”, fall through to next
          continue;
        }

        const data = json.data;
        const list: any[] =
          Array.isArray(data) ? data :
          Array.isArray(data?.results) ? data.results :
          Array.isArray(data?.items) ? data.items : [];

        setHistoryLog((l) => [...l, `  status ${json.status ?? r.status} · items ${list.length}`]);
        setHistory(list);
        return;
      }

      setHistoryErr("No history endpoint found (tried search/list candidates). If your docs specify a different endpoint, send me the method + path and I’ll lock it in.");
    } catch (e: any) {
      setHistoryErr(e?.message ?? "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }

  const created = createRes?.data && typeof createRes.data === "object" ? (createRes.data as any) : null;
  const sessionUrl = created?.url as string | undefined;

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">AML Tester (RealAML)</h1>

      {/* Create verification */}
      <form onSubmit={createVerification} className="space-y-3">
        <label className="block text-sm">
          API Path
          <input
            className="border rounded px-3 py-2 w-full"
            value={apiPath}
            onChange={(e)=>setApiPath(e.target.value)}
            placeholder="/verifications/"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="First Name (MOCK)"
                 value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Middle Name (FM1..FM8)"
                 value={middleName} onChange={(e)=>setMiddleName(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Last Name (PASS|PARTIAL|FAIL)"
                 value={lastName} onChange={(e)=>setLastName(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Birth Date (YYYY-MM-DD)"
                 value={birthDate} onChange={(e)=>setBirthDate(e.target.value)} />
          <input type="email" className="border rounded px-3 py-2 md:col-span-2"
                 placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="border rounded px-3 py-2 md:col-span-2"
                 placeholder="Mobile (+61… or 04…)" value={mobile} onChange={(e)=>setMobile(e.target.value)} />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={captureIds} onChange={()=>setCaptureIds(v=>!v)} />
            Capture 2 IDs
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={runPep} onChange={()=>setRunPep(v=>!v)} />
            Run PEP Check
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={creating}
                  className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
            {creating ? "Sending…" : "Send"}
          </button>
          <button type="button" onClick={()=>{
            setFirstName("MOCK"); setMiddleName(""); setLastName("PASS");
            setBirthDate("1900-01-01"); setEmail("test@example.com"); setMobile("0468920567");
            setCaptureIds(true); setRunPep(false);
            setCreateErr(null); setCreateRes(null); setStatusErr(null); setStatusRes(null);
          }} className="px-4 py-2 rounded border">
            Reset (Quick-ID PASS)
          </button>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <label>Page</label>
            <input type="number" min={1} className="border rounded px-2 py-1 w-16"
                   value={page} onChange={(e)=>setPage(Number(e.target.value)||1)} />
            <label>Page size</label>
            <input type="number" min={1} className="border rounded px-2 py-1 w-20"
                   value={pageSize} onChange={(e)=>setPageSize(Number(e.target.value)||25)} />
            <button type="button" onClick={loadHistory} disabled={historyLoading}
                    className="px-3 py-2 rounded border">
              {historyLoading ? "Loading…" : "Load History"}
            </button>
          </div>
        </div>
      </form>

      {/* Create result */}
      {createErr && <pre className="p-3 border rounded bg-red-50 text-red-700 whitespace-pre-wrap">{createErr}</pre>}
      {createRes && (
        <div className="border rounded p-4 space-y-3 bg-gray-50">
          <div className="text-sm text-gray-600">
            HTTP: <b>{createRes.status ?? "—"}</b> · OK: <b>{String(createRes.ok ?? "")}</b>
          </div>
          {sessionUrl && (
            <div className="flex gap-2">
              <a className="px-3 py-2 rounded bg-black text-white" href={sessionUrl} target="_blank" rel="noreferrer">
                Open Verification Session
              </a>
              <button type="button" className="px-3 py-2 rounded border" onClick={async ()=>{
                try { await navigator.clipboard.writeText(sessionUrl); alert("Session URL copied"); } catch {}
              }}>
                Copy URL
              </button>
            </div>
          )}
          <details>
            <summary className="cursor-pointer text-sm">Show full response JSON</summary>
            <pre className="p-3 mt-2 border rounded bg-white overflow-auto text-xs">
              {JSON.stringify(createRes, null, 2)}
            </pre>
          </details>
          {sigKey && <div className="text-xs text-gray-600">signature_key: <code>{sigKey}</code></div>}
        </div>
      )}

      {/* Latest verification status */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Latest Verification Status</h2>
        <div className="flex items-center gap-3">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="signature_key"
            value={sigKey ?? ""}
            onChange={(e)=>setSigKey(e.target.value || null)}
          />
          <button onClick={refreshLatest} disabled={refreshing || !sigKey}
                  className="px-4 py-2 rounded border disabled:opacity-50">
            {refreshing ? "Refreshing…" : "Refresh status"}
          </button>
        </div>
        {statusErr && <pre className="p-3 border rounded bg-red-50 text-red-700 whitespace-pre-wrap">{statusErr}</pre>}
        {statusRes && (
          <div className="border rounded p-4 space-y-2 bg-gray-50">
            <div className="text-sm text-gray-600">
              HTTP: <b>{statusRes.status ?? "—"}</b> · OK: <b>{String(statusRes.ok ?? "")}</b>
            </div>
            <pre className="p-3 border rounded bg-white overflow-auto text-xs">
              {JSON.stringify(statusRes.data ?? statusRes, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* History */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Check History</h2>
        {historyLog.length > 0 && (
          <pre className="p-2 border rounded bg-gray-50 text-xs whitespace-pre-wrap">
            {historyLog.join("\n")}
          </pre>
        )}
        {historyErr && <pre className="p-3 border rounded bg-red-50 text-red-700 whitespace-pre-wrap">{historyErr}</pre>}
        {history && history.length === 0 && <div className="text-sm text-gray-600">No results.</div>}
        {history && history.length > 0 && (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2">Type</th>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Risk</th>
                  <th className="text-left px-3 py-2">Contact</th>
                  <th className="text-left px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{renderType(row)}</td>
                    <td className="px-3 py-2">{renderName(row)}</td>
                    <td className="px-3 py-2">{renderStatus(row)}</td>
                    <td className="px-3 py-2">{renderRisk(row)}</td>
                    <td className="px-3 py-2">{renderEmail(row)}</td>
                    <td className="px-3 py-2">{renderDate(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Mock rules — All: <b>first_name=MOCK</b>. Quick-ID: <b>last_name=PASS|PARTIAL|FAIL</b> with <b>birth_date=1900-01-01</b>.
        PEP: set <b>birth_date=1900-01-0[2-4]</b>. FaceMatch: <b>middle_name=FM1..FM8</b>.
      </div>
    </div>
  );
}