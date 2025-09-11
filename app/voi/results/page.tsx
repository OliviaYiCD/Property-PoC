"use client";

import { useEffect, useState } from "react";

type EventItem = { receivedAt: string; payload: any };

export default function ResultsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/aplyid/webhook", { cache: "no-store" });
      const json = await res.json();
      setItems(json.items ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 16px" }}>
      <h1>Verification Results</h1>
      <p>Most recent events received from APLYiD (via webhook).</p>

      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && <p>No events yet.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((it, i) => {
          const p = it.payload ?? {};
          const tx = p.transaction_id || p.id || p.reference || "—";
          const event = p.event || p.status || "event";
          const reportUrl =
            p.report_url ||
            p.pdf_url ||
            p.verification?.report_url ||
            p.verification?.pdf_url ||
            null;

          return (
            <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <strong>Transaction:</strong> <span>{tx}</span>
                <strong>Event:</strong> <span>{event}</span>
                <strong>Received:</strong> <span>{it.receivedAt}</span>
                {reportUrl && (
                  <>
                    <strong>Report:</strong>{" "}
                    <a href={reportUrl} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  </>
                )}
              </div>
              <details style={{ marginTop: 8 }}>
                <summary>Raw payload</summary>
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(p, null, 2)}</pre>
              </details>
            </div>
          );
        })}
      </div>
    </main>
  );
}
