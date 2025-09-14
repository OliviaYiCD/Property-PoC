"use client";

import { useMemo, useRef, useState } from "react";

/* -------------------------------------------------------
   Fake dataset (search + workspace demo snapshots)
------------------------------------------------------- */

type Company = {
  name: string;
  acn?: string;
  abn?: string;
  status: "Registered" | "Deregistered" | "Unknown";
  state?: string;
};

const FAKE_MATCHES: Company[] = [
  { name: "ACME PTY LTD", acn: "123 456 789", abn: "12 123 456 789", status: "Registered", state: "NSW" },
  { name: "ACME AUSTRALIA HOLDINGS PTY LTD", acn: "987 654 321", abn: "98 987 654 321", status: "Registered", state: "VIC" },
  { name: "ACME WHOLESALE PTY LTD", acn: "456 111 222", abn: "45 611 122 200", status: "Registered", state: "QLD" },
  { name: "BEST BEFORE PTY LTD", acn: "222 333 444", abn: "22 222 333 444", status: "Registered", state: "QLD" },
  { name: "MORA INSPIRATION APP LTD", acn: "333 444 555", abn: "33 333 444 555", status: "Registered", state: "NSW" },
];

/* ---------- Mock detail data ---------- */

type CompanyDetail = {
  profile: {
    name: string;
    acn?: string;
    abn?: string;
    type: string;
    status: string;
    state?: string;
    incorporationDate?: string;
    registeredAddress?: string;
  };
  directors: { name: string; role: string; appointed: string; resigned?: string }[];
  shareholders: { name: string; holdingPercent: number }[];
  filings: { date: string; document: string; number: string }[];
};

const DETAIL_MAP: Record<string, CompanyDetail> = {
  "ACME PTY LTD": {
    profile: {
      name: "ACME PTY LTD",
      acn: "123 456 789",
      abn: "12 123 456 789",
      type: "Australian Proprietary Company, Limited by Shares",
      status: "Registered",
      state: "NSW",
      incorporationDate: "2008-03-14",
      registeredAddress: "Level 10, 20 Market Street, Sydney NSW 2000",
    },
    directors: [
      { name: "Jane Citizen", role: "Director", appointed: "2016-07-01" },
      { name: "Wei Zhang", role: "Director/Secretary", appointed: "2019-03-22" },
    ],
    shareholders: [
      { name: "ACME HOLDINGS PTY LTD", holdingPercent: 75 },
      { name: "Jane Citizen", holdingPercent: 25 },
    ],
    filings: [
      { date: "2024-09-01", document: "Change to company details", number: "484" },
      { date: "2024-06-30", document: "Annual Review", number: "484" },
      { date: "2023-10-03", document: "Appointment of officer", number: "484" },
    ],
  },
  "ACME AUSTRALIA HOLDINGS PTY LTD": {
    profile: {
      name: "ACME AUSTRALIA HOLDINGS PTY LTD",
      acn: "987 654 321",
      abn: "98 987 654 321",
      type: "Australian Proprietary Company, Limited by Shares",
      status: "Registered",
      state: "VIC",
      incorporationDate: "2015-11-20",
      registeredAddress: "120 Collins Street, Melbourne VIC 3000",
    },
    directors: [{ name: "Rahul Patel", role: "Director", appointed: "2015-11-20" }],
    shareholders: [{ name: "GLOBAL ACME INC.", holdingPercent: 100 }],
    filings: [{ date: "2024-08-18", document: "Annual Review", number: "484" }],
  },
};

function buildDefaultDetail(c: Company): CompanyDetail {
  return {
    profile: {
      name: c.name,
      acn: c.acn,
      abn: c.abn,
      type: "Australian Proprietary Company, Limited by Shares",
      status: c.status,
      state: c.state,
      incorporationDate: "2012-01-01",
      registeredAddress: "Registered address unavailable (mock)",
    },
    directors: [{ name: "TBC (mock)", role: "Director", appointed: "2012-01-01" }],
    shareholders: [{ name: "TBC (mock)", holdingPercent: 100 }],
    filings: [{ date: "2024-06-30", document: "Annual Review", number: "484" }],
  };
}

type ItemKey =
  | "comprehensive"
  | "asic"
  | "structure"
  | "ubo"
  | "directors"
  | "credit"
  | "watch";

/* ---------- PRICES (AUD) ---------- */
const PRICES: Record<ItemKey, number> = {
  comprehensive: 49,
  asic: 59,
  structure: 35,
  ubo: 55,
  directors: 29,
  credit: 45,
  watch: 15,
};

/* -------------------------------------------------------
   Tiny UI helpers
------------------------------------------------------- */

function statusChip(c: Company) {
  const s =
    c.status === "Registered"
      ? "bg-green-100 text-green-800"
      : c.status === "Deregistered"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-700";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${s}`}>{c.status}</span>;
}

/* -------------------------------------------------------
   Workspace primitives (graph + snapshots)
------------------------------------------------------- */

type Node = { id: string; label: string; x: number; y: number };
type Edge = { from: string; to: string };
type Snapshot = { year: number; nodes: Node[]; edges: Edge[] };

const SNAPSHOTS: Snapshot[] = [
  {
    year: 2008,
    nodes: [
      { id: "P", label: "ACME PTY LTD", x: 280, y: 40 },
      { id: "S1", label: "ACME WHOLESALE", x: 120, y: 170 },
      { id: "S2", label: "ACME RETAIL", x: 440, y: 170 },
    ],
    edges: [
      { from: "P", to: "S1" },
      { from: "P", to: "S2" },
    ],
  },
  {
    year: 2016,
    nodes: [
      { id: "P", label: "ACME PTY LTD", x: 280, y: 40 },
      { id: "S1", label: "ACME WHOLESALE", x: 100, y: 180 },
      { id: "S2", label: "ACME RETAIL", x: 460, y: 170 },
      { id: "S3", label: "ACME NZ LTD", x: 290, y: 280 },
    ],
    edges: [
      { from: "P", to: "S1" },
      { from: "P", to: "S2" },
      { from: "S2", to: "S3" },
    ],
  },
  {
    year: 2023,
    nodes: [
      { id: "H", label: "ACME HOLDINGS", x: 280, y: 20 },
      { id: "P", label: "ACME PTY LTD", x: 280, y: 110 },
      { id: "S1", label: "ACME WHOLESALE", x: 120, y: 220 },
      { id: "S2", label: "ACME RETAIL", x: 460, y: 210 },
      { id: "S3", label: "ACME NZ LTD", x: 290, y: 320 },
    ],
    edges: [
      { from: "H", to: "P" },
      { from: "P", to: "S1" },
      { from: "P", to: "S2" },
      { from: "S2", to: "S3" },
    ],
  },
];

/* -------------------------------------------------------
   Page
------------------------------------------------------- */

export default function CompanySearchPage() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Company | null>(null);

  const [selected, setSelected] = useState<Record<ItemKey, boolean>>({
    comprehensive: false,
    asic: false,
    structure: false,
    ubo: false,
    directors: false,
    credit: false,
    watch: false,
  });

  const [showWorkspace, setShowWorkspace] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Company[];
    return FAKE_MATCHES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.acn?.replaceAll(" ", "").includes(q.replaceAll(" ", "")) ||
        c.abn?.replaceAll(" ", "").includes(q.replaceAll(" ", ""))
    );
  }, [query]);

  const details: CompanyDetail | null = picked
    ? DETAIL_MAP[picked.name] ?? buildDefaultDetail(picked)
    : null;

  const total = useMemo(
    () =>
      (Object.keys(selected) as ItemKey[])
        .filter((k) => selected[k])
        .reduce((sum, k) => sum + PRICES[k], 0),
    [selected]
  );

  const canProceed = picked && total > 0;
  const toggle = (k: ItemKey) => setSelected((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <header>
        <h1 className="text-2xl font-semibold">Company Search</h1>
        <p className="text-sm text-neutral-600">Conduct detailed company searches and order reports.</p>
      </header>

      {/* Search */}
      <section className="card">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2">
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-neutral-500">
                <path
                  d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter ACN/ABN or Company Name (try “ACME”)"
                className="w-full bg-transparent outline-none"
              />
            </div>

            {/* Results */}
            {query && (
              <div className="mt-3">
                {results.length === 0 ? (
                  <div className="rounded-lg border bg-white p-3 text-sm text-neutral-500">No matches.</div>
                ) : (
                  <ul className="rounded-lg border bg-white">
                    {results.map((c) => {
                      const isPicked = picked?.name === c.name;
                      return (
                        <li
                          key={c.name}
                          tabIndex={0}
                          className={[
                            "group relative flex cursor-pointer items-center justify-between px-3 py-2 transition-colors",
                            "hover:bg-rose-50/40 hover:border-l-2 hover:border-[#cc3369] focus:bg-rose-50/40 focus:outline-none",
                            isPicked ? "bg-rose-50/60 border-l-2 border-[#cc3369]" : "border-l-2 border-transparent",
                          ].join(" ")}
                          onClick={() => setPicked(c)}
                        >
                          <div className="min-w-0">
                            <div className="truncate font-medium">{c.name}</div>
                            <div className="truncate text-xs text-neutral-500">
                              ACN {c.acn} • ABN {c.abn} • {c.state}
                            </div>
                          </div>
                          {statusChip(c)}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button className="btn-primary whitespace-nowrap">Search</button>
        </div>

        {picked && (
          <div className="mt-3 text-sm text-neutral-600">
            Working with: <span className="font-medium text-neutral-800">{picked.name}</span>
          </div>
        )}
      </section>

      {/* Company Snapshot (shows after picking) */}
      {details && (
        <section className="card">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-500">Company Snapshot</div>
              <h2 className="text-lg font-semibold">{details.profile.name}</h2>
            </div>
            <div>{statusChip({ name: "", status: details.profile.status as any })}</div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Summary grid */}
            <div className="rounded-lg border p-3">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <Row label="ACN" value={details.profile.acn ?? "—"} />
                <Row label="ABN" value={details.profile.abn ?? "—"} />
                <Row label="Type" value={details.profile.type} />
                <Row label="State" value={details.profile.state ?? "—"} />
                <Row label="Incorporated" value={details.profile.incorporationDate ?? "—"} />
                <Row label="Registered address" value={details.profile.registeredAddress ?? "—"} />
              </div>
            </div>

            {/* Directors */}
            <div className="rounded-lg border p-3">
              <div className="mb-1 text-sm font-semibold">Directors</div>
              <ul className="space-y-1 text-sm">
                {details.directors.map((d, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{d.name}</span>
                    <span className="text-neutral-500">{d.role} • {d.appointed}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shareholders */}
            <div className="rounded-lg border p-3">
              <div className="mb-1 text-sm font-semibold">Shareholders</div>
              <ul className="space-y-1 text-sm">
                {details.shareholders.map((s, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="text-neutral-500">{s.holdingPercent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Filings */}
          <div className="mt-4 rounded-lg border">
            <div className="border-b px-3 py-2 text-sm font-semibold">Recent Filings</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-neutral-500">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Document</th>
                    <th className="px-3 py-2">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {details.filings.map((f, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{f.date}</td>
                      <td className="px-3 py-2">{f.document}</td>
                      <td className="px-3 py-2">{f.number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* GROUP: Core Reports */}
      <Group title="Core Reports">
        <ItemCard
          title="Comprehensive Company Report"
          desc="Company profile, officeholders, filings and key documents."
          price={PRICES.comprehensive}
          checked={selected.comprehensive}
          onChange={() => toggle("comprehensive")}
          sampleHref="#"
        />
        <ItemCard
          title="ASIC Reports"
          desc="Official filings and extracts as submitted to ASIC."
          price={PRICES.asic}
          checked={selected.asic}
          onChange={() => toggle("asic")}
          sampleHref="#"
        />
      </Group>

      {/* GROUP: Structure & Ownership */}
      <Group title="Structure & Ownership">
        <ItemCard
          title="Company Structure Diagram"
          desc="Visual representation of the company's structure."
          price={PRICES.structure}
          checked={selected.structure}
          onChange={() => toggle("structure")}
          sampleHref="#"
          right={
            <button
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50"
              onClick={() => setShowWorkspace(true)}
              disabled={!picked}
              title={!picked ? "Pick a company first" : "Create a workspace"}
            >
              Create Workspace
            </button>
          }
        />
        <ItemCard
          title="Ultimate Beneficial Owners (UBO)"
          desc="Attempt to resolve beneficial ownership from public sources."
          price={PRICES.ubo}
          checked={selected.ubo}
          onChange={() => toggle("ubo")}
          sampleHref="#"
        />
        <ItemCard
          title="Directors & Officeholders"
          desc="Current and historical directors, secretaries and addresses."
          price={PRICES.directors}
          checked={selected.directors}
          onChange={() => toggle("directors")}
          sampleHref="#"
        />
      </Group>

      {/* GROUP: Risk & Monitoring */}
      <Group title="Risk & Monitoring">
        <ItemCard
          title="Credit Report"
          desc="Credit history, risk indicators and adverse records."
          price={PRICES.credit}
          checked={selected.credit}
          onChange={() => toggle("credit")}
          sampleHref="#"
        />
        <ItemCard
          title="Company Watch"
          desc="Set up alerts for ongoing changes to the company."
          price={PRICES.watch}
          checked={selected.watch}
          onChange={() => toggle("watch")}
          sampleHref="#"
        />
      </Group>

      {/* Footer */}
      <footer className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-neutral-600">
          {picked ? (
            <>
              Ordering for <b>{picked.name}</b>
            </>
          ) : (
            <>Pick a company to begin.</>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-neutral-600">Total:</span>{" "}
            <span className="font-semibold text-neutral-900">${total.toFixed(2)} AUD</span>
          </div>
          <button
            disabled={!canProceed}
            className={`rounded-lg px-4 py-2 text-white ${
              canProceed ? "bg-[#cc3369] hover:opacity-95" : "bg-neutral-300 cursor-not-allowed"
            }`}
          >
            Proceed with Order →
          </button>
        </div>
      </footer>

      {/* Workspace modal */}
      {showWorkspace && picked && (
        <WorkspaceModal
          company={picked}
          onClose={() => setShowWorkspace(false)}
          onSave={() => {
            setSelected((s) => ({ ...s, structure: true })); // attach to order
            setShowWorkspace(false);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------
   Group + Item card
------------------------------------------------------- */

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="text-sm font-semibold text-neutral-700">{title}</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function ItemCard({
    title,
    desc,
    price,
    checked,
    onChange,
    right,
    sampleHref,
  }: {
    title: string;
    desc: string;
    price: number;
    checked: boolean;
    onChange: () => void;
    right?: React.ReactNode;
    sampleHref?: string;
  }) {
    return (
      <div className="card flex items-start gap-4">
        {/* Left: checkbox, title, desc, sample */}
        <label className="flex flex-1 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={checked}
            onChange={onChange}
          />
          <div className="min-w-0">
            <div className="truncate font-medium">{title}</div>
            <div className="mt-0.5 text-sm text-neutral-600">{desc}</div>
  
            {/* Sample report link */}
            {sampleHref && (
              <a
                href={sampleHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#cc3369] hover:underline"
                title="Open sample report (new tab)"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M14 3h7v7m0-7L10 14M21 14v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Sample report
              </a>
            )}
          </div>
        </label>
  
        {/* Right rail: optional CTA then price flush-right */}
        <div className="ml-auto flex items-start gap-3">
          {right}
          <div className="whitespace-nowrap self-start text-sm font-medium text-neutral-700">
            ${price.toFixed(2)}
          </div>
        </div>
      </div>
    );
  }

/* -------------------------------------------------------
   Workspace Modal (diagram + timeline)
------------------------------------------------------- */

function WorkspaceModal({
  company,
  onClose,
  onSave,
}: {
  company: Company;
  onClose: () => void;
  onSave: () => void;
}) {
  const [snapIndex, setSnapIndex] = useState(2);
  const [nodes, setNodes] = useState<Node[]>(SNAPSHOTS[snapIndex].nodes.map((n) => ({ ...n })));
  const [edges, setEdges] = useState<Edge[]>(SNAPSHOTS[snapIndex].edges.map((e) => ({ ...e })));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const dragging = useRef<{ id: string; dx: number; dy: number } | null>(null);

  function applySnapshot(i: number) {
    const snap = SNAPSHOTS[i];
    setNodes(snap.nodes.map((n) => ({ ...n })));
    setEdges(snap.edges.map((e) => ({ ...e })));
    setSelectedNodeId(null);
  }

  function onDown(e: React.MouseEvent, id: string) {
    const target = nodes.find((n) => n.id === id);
    if (!target) return;
    setSelectedNodeId(id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragging.current = {
      id,
      dx: e.clientX - rect.left - rect.width / 2,
      dy: e.clientY - rect.top - rect.height / 2,
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
  function onMove(e: MouseEvent) {
    if (!dragging.current) return;
    const { id, dx, dy } = dragging.current;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              x: Math.max(40, Math.min(520, e.clientX - dx - 180)),
              y: Math.max(20, Math.min(360, e.clientY - dy - 140)),
            }
          : n
      )
    );
  }
  function onUp() {
    dragging.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  }

  function addSubsidiary() {
    const parentId = selectedNodeId ?? nodes[0]?.id;
    if (!parentId) return;
    const id = `N${Date.now().toString().slice(-6)}`;
    const newNode: Node = {
      id,
      label: "NEW SUBSIDIARY",
      x: Math.random() * 520,
      y: 60 + Math.random() * 320,
    };
    setNodes((n) => [...n, newNode]);
    setEdges((e) => [...e, { from: parentId, to: id }]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 sm:items-center">
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm text-neutral-500">Workspace</div>
            <div className="text-lg font-semibold">{company.name}</div>
          </div>
          <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1fr,260px]">
          {/* Canvas */}
          <div className="relative h-[420px] overflow-hidden rounded-lg border bg-white">
            <svg className="absolute inset-0 h-full w-full">
              {edges.map((e, idx) => {
                const a = nodes.find((n) => n.id === e.from);
                const b = nodes.find((n) => n.id === e.to);
                if (!a || !b) return null;
                return (
                  <line key={idx} x1={a.x + 60} y1={a.y + 20} x2={b.x + 60} y2={b.y + 20} stroke="#CBD5E1" strokeWidth={2} />
                );
              })}
            </svg>
            {nodes.map((n) => (
              <div
                key={n.id}
                className={`absolute w-[120px] cursor-grab select-none rounded-lg border px-2 py-1 text-center text-xs ${
                  n.id === selectedNodeId ? "border-[#cc3369] bg-rose-50" : "bg-white"
                }`}
                style={{ left: n.x, top: n.y }}
                onMouseDown={(e) => onDown(e, n.id)}
                onClick={() => setSelectedNodeId(n.id)}
                title="Drag to reposition"
              >
                <div className="truncate font-medium">{n.label}</div>
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-medium">Timeline</div>
              <div className="text-xs text-neutral-500 mb-2">Explore historical structure snapshots</div>
              <input
                type="range"
                min={0}
                max={SNAPSHOTS.length - 1}
                value={snapIndex}
                onChange={(e) => {
                  const i = Number(e.target.value);
                  setSnapIndex(i);
                  applySnapshot(i);
                }}
                className="w-full"
              />
              <div className="mt-1 text-sm">
                Year: <b>{SNAPSHOTS[snapIndex].year}</b>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-medium">Selected</div>
              <div className="text-sm text-neutral-700">
                {selectedNodeId ? nodes.find((n) => n.id === selectedNodeId)?.label : "None"}
              </div>
              <div className="mt-2 flex gap-2">
                <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50" onClick={addSubsidiary}>
                  + Add subsidiary
                </button>
                <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50" onClick={() => setSelectedNodeId(null)}>
                  Clear selection
                </button>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-medium">Export</div>
              <p className="text-sm text-neutral-600">Save current layout and attach to your order as a PDF.</p>
              <button className="mt-2 w-full rounded-lg bg-[#cc3369] px-3 py-2 text-white hover:opacity-95" onClick={onSave}>
                Save to order
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER with Insight360 CTA already added previously */}
        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50" onClick={onClose}>
            Cancel
          </button>
          <a
            href={`/insight360?company=${encodeURIComponent(company.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50"
            title="Open in Insight360 (new tab)"
          >
            Edit with Insight360
          </a>
          <button className="rounded-md bg-[#cc3369] px-3 py-1.5 text-sm text-white hover:opacity-95" onClick={onSave}>
            Save & attach
          </button>
        </div>
      </div>
    </div>
  );
}

/* Small field row for snapshot */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-800">{value}</span>
    </div>
  );
}