// app/property/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/** ---------------- Types ---------------- */
type Recommendation = {
  id: string;
  label: string;
  href?: string;
  desc?: string;
};
type Product = Recommendation;

type Snapshot = {
  address: string;
  titleRef: string;
  lotPlan: string;
  owner?: string;
  state?: string;
  matchedBy: "address" | "title" | "lotPlan" | "owner" | "unknown";
};

type DocAnalyzeResponse = {
  extracted?: {
    address?: string;
    titleRef?: string;
    lotPlan?: string;
    owner?: string;
    state?: string;
  };
  suggestions?: Array<{ id: string; label: string; desc?: string }>;
  error?: string;
};

/** --------------- Constants --------------- */
const AU_STATES = [
  { value: "", label: "All states" },
  { value: "QLD", label: "QLD" },
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "SA", label: "SA" },
  { value: "WA", label: "WA" },
  { value: "TAS", label: "TAS" },
  { value: "ACT", label: "ACT" },
  { value: "NT", label: "NT" },
];

const SAMPLE_PROPERTIES = [
  {
    address: "123 George St, Sydney NSW",
    titleRef: "46111111",
    lotPlan: "12/RP34567",
    owner: "John Smith",
    state: "NSW",
  },
];

const ALL_PRODUCTS: Product[] = [
  { id: "seller", label: "Seller Disclosure Package", desc: "Core forms + title + plan + rates + zoning" },
  { id: "title", label: "Title Search", desc: "Current ownership & encumbrances" },
  { id: "plan", label: "Plan / DP / Lot Plan", desc: "Lot/plan & parcel details" },
  { id: "rates", label: "Current Rates Balance", desc: "Council rates & outstanding balance" },
  { id: "zoning", label: "Zoning / Planning Report", desc: "Planning overlays & zoning summary" },
  { id: "historic", label: "Historical Title", desc: "Chain of title ownership" },
  { id: "easements", label: "Easements & Encumbrances", desc: "Registered easements and instruments" },
  { id: "sp-search", label: "Survey Plan Image", desc: "Survey plan / strata plan image" },
  { id: "sp-notes", label: "Survey Plan Notes", desc: "Plan notes & amendments" },
  { id: "building", label: "Building Approval Search", desc: "Recent approvals & permits" },
  { id: "flood", label: "Flood / Hazard Overlay", desc: "Local hazard mapping" },
  { id: "heritage", label: "Heritage Overlay", desc: "Heritage constraints & listings" },
  { id: "valuation", label: "Valuation Roll Extract", desc: "Valuation & land use info" },
  { id: "water", label: "Water Rates Balance", desc: "Water provider balance / notices" },
  { id: "power", label: "Electrical Connection Info", desc: "Network / connection details" },
];

/** --------------- Helpers --------------- */
const isTitleRef = (q: string) => /^[0-9]{5,}([/][0-9]{1,})?$/.test(q);
const isLotPlan = (q: string) => /(lot|lt)\s*\d+/i.test(q) || /\/(RP|SP|DP|LP)\d+/i.test(q);

/** Simple Google Maps embed (no JS SDK) */
function MapPreview({ query }: { query?: string }) {
  const src = useMemo(() => {
    const q = query?.trim() || "Australia";
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
  }, [query]);

  return (
    <div className="w-full md:w-80 h-64 rounded-lg overflow-hidden bg-neutral-100 border">
      <iframe
        title="Property Map"
        src={src}
        className="h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

/** --------------- Page --------------- */
export default function PropertyPage() {
  // Search / state filter
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("");

  // Files + DnD
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Verification / snapshot
  const [verifying, setVerifying] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Selections & “Other searches”
  const [selected, setSelected] = useState<string[]>([]);
  const [openOther, setOpenOther] = useState(false);

  // Extra recs coming back from the AI analyzer
  const [aiSuggestions, setAiSuggestions] = useState<Recommendation[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  /** ---------- Search flow ---------- */
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSnapshot(null);
    setVerifying(true);

    const q = query.trim();
    setTimeout(() => {
      const qLower = q.toLowerCase();
      const found = SAMPLE_PROPERTIES.find(
        (p) =>
          p.address.toLowerCase().includes(qLower) ||
          p.titleRef.toLowerCase() === qLower ||
          p.lotPlan.toLowerCase().includes(qLower) ||
          p.owner?.toLowerCase().includes(qLower)
      );

      if (found) {
        const matchedBy: Snapshot["matchedBy"] =
          found.address.toLowerCase().includes(qLower)
            ? "address"
            : found.titleRef.toLowerCase() === qLower
            ? "title"
            : found.lotPlan.toLowerCase().includes(qLower)
            ? "lotPlan"
            : found.owner?.toLowerCase().includes(qLower)
            ? "owner"
            : "unknown";

        setSnapshot({
          address: found.address,
          titleRef: found.titleRef,
          lotPlan: found.lotPlan,
          owner: found.owner,
          state: stateFilter || found.state,
          matchedBy,
        });
      } else {
        setSnapshot({
          address: isTitleRef(q) || isLotPlan(q) ? "—" : q,
          titleRef: isTitleRef(q) ? q : "—",
          lotPlan: isLotPlan(q) ? q : "—",
          owner: "—",
          state: stateFilter || "—",
          matchedBy: isTitleRef(q) ? "title" : isLotPlan(q) ? "lotPlan" : "address",
        });
      }

      setVerifying(false);
    }, 700);
  };

  /** ---------- Upload Handlers ---------- */
  const onInputFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFiles(Array.from(e.dataTransfer.files || []));
  };

  /** ---------- Analyze with AI (calls /api/doc-analyze) ---------- */
  const analyzeFiles = async () => {
    if (files.length === 0) return;
    setAnalyzing(true);
    setAiSuggestions([]);

    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));

      const res = await fetch("/api/doc-analyze", {
        method: "POST",
        body: form,
      });

      const data = (await res.json()) as DocAnalyzeResponse;

      if (!res.ok || data.error) {
        console.error("Analyzer error:", data.error || res.statusText);
        alert("Analyze failed. Check server logs.");
        setAnalyzing(false);
        return;
      }

      // Merge extracted snapshot fields
      setSnapshot((prev) => {
        // If we don't even have a prev snapshot (user hasn't verified yet),
        // start a minimal one so the UI can display something useful.
        const base: Snapshot =
          prev ?? {
            address: "—",
            titleRef: "—",
            lotPlan: "—",
            owner: "—",
            state: stateFilter || "—",
            matchedBy: "unknown",
          };

        const ex = data.extracted || {};

        return {
          address: ex.address ?? base.address ?? "—",
          titleRef: ex.titleRef ?? base.titleRef ?? "—",
          lotPlan: ex.lotPlan ?? base.lotPlan ?? "—",
          owner: ex.owner ?? base.owner ?? "—",
          // IMPORTANT: when mixing ?? with || we add parens to the ?? chain
          state: (ex.state ?? base.state ?? stateFilter) || "—",
          matchedBy: base.matchedBy ?? "unknown",
        };
      });

      // Merge suggestions (AI) with our defaults later via state
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        // Normalize to our shape
        const extras: Recommendation[] = data.suggestions.map((s) => ({
          id: s.id,
          label: s.label,
          desc: s.desc,
        }));
        setAiSuggestions(extras);
      }
    } catch (err) {
      console.error(err);
      alert("Analyze failed. Check network/server logs.");
    } finally {
      setAnalyzing(false);
    }
  };

  /** ---------- Recommended searches ---------- */
  const baseRecommendations: Recommendation[] = useMemo(() => {
    if (!snapshot) return [];
    return [
      { id: "seller", label: "Seller Disclosure Package", desc: "Core forms + title + plan + rates + zoning" },
      { id: "title", label: "Title Search", desc: "Current ownership & encumbrances" },
      { id: "plan", label: "Plan / DP / Lot Plan", desc: "Lot/plan & parcel details" },
      { id: "rates", label: "Current Rates Balance", desc: "Council rates & outstanding balance" },
      { id: "zoning", label: "Zoning / Planning Report", desc: "Planning overlays & zoning summary" },
      { id: "historic", label: "Historical Title", desc: "Chain of title ownership" },
    ];
  }, [snapshot]);

  // Combine defaults + AI recs, de-dup by id
  const recommendations = useMemo(() => {
    const map = new Map<string, Recommendation>();
    baseRecommendations.forEach((r) => map.set(r.id, r));
    aiSuggestions.forEach((r) => map.set(r.id, { ...map.get(r.id), ...r }));
    return Array.from(map.values());
  }, [baseRecommendations, aiSuggestions]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /** --------------- Render --------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Property Search</h1>
        <p className="text-sm text-neutral-600">
          Search by address, title reference, lot/plan, or owner name — or upload a contract/disclosure and we’ll
          suggest searches.
        </p>
      </div>

      {/* Search */}
      <section className="card">
        <form onSubmit={onSearch} className="flex flex-col gap-3 md:flex-row">
          <div className="md:w-40">
            <label htmlFor="state" className="sr-only">
              State
            </label>
            <select
              id="state"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#cc3369]"
            >
              {AU_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Search address, title reference, lot/plan, or owner"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#cc3369]"
            />
          </div>

          <button type="submit" className="rounded-lg bg-[#cc3369] px-4 py-2 text-white hover:opacity-90">
            Search
          </button>
        </form>
      </section>

      {/* Snapshot */}
      {submitted && (
        <section className="card">
          {!snapshot || verifying ? (
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-[#cc3369]" />
              Verifying property…
            </div>
          ) : (
            <div className="flex flex-col gap-4 md:flex-row">
              <MapPreview query={snapshot.address !== "—" ? snapshot.address : undefined} />
              <div className="flex-1">
                <h2 className="text-base font-semibold">Property Snapshot</h2>
                <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-neutral-500">Matched by</dt>
                    <dd className="font-medium capitalize">{snapshot.matchedBy}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">State</dt>
                    <dd className="font-medium">{snapshot.state || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-neutral-500">Address</dt>
                    <dd className="font-medium">{snapshot.address || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Title Reference</dt>
                    <dd className="font-medium">{snapshot.titleRef || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Lot / Plan</dt>
                    <dd className="font-medium">{snapshot.lotPlan || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Owner</dt>
                    <dd className="font-medium">{snapshot.owner || "—"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Upload (UI in your style) */}
      <section className="card">
        <h2 className="text-base font-semibold">Upload documents</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Upload a <b>property contract</b> or <b>seller disclosure statement</b>. We’ll parse key details and recommend
          searches.
        </p>

        <div
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          className={`mt-3 rounded-xl border-2 border-dashed p-10 text-center ${
            dragOver ? "border-[#cc3369] bg-[#fff6f9]" : "border-neutral-300 bg-white"
          }`}
        >
          <input id="file-input" type="file" multiple onChange={onInputFiles} className="hidden" />
          <label htmlFor="file-input" className="cursor-pointer">
            <div className="text-sm text-neutral-700">
              Drag & drop files here, or <span className="text-[#cc3369] underline">browse</span>
            </div>
            <div className="mt-2 text-xs text-neutral-500">PDF, DOC, DOCX, PNG, JPG — up to ~25MB each</div>
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={analyzeFiles}
            disabled={files.length === 0 || analyzing}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              files.length === 0 || analyzing ? "bg-neutral-300 cursor-not-allowed" : "bg-[#cc3369] hover:opacity-90"
            }`}
          >
            {analyzing ? "Analyzing…" : "Analyze file with AI"}
          </button>
        </div>
      </section>

      {/* Only show searches + footer AFTER verification */}
      {snapshot && !verifying && (
        <>
          {/* Recommended Searches */}
          <section className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Recommended Searches</h2>
              <span className="text-xs text-neutral-500">
                for {snapshot.address} {snapshot.state ? `(${snapshot.state})` : ""}
              </span>
            </div>

            {recommendations.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">No recommendations yet.</p>
            ) : (
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((r) => {
                  const checked = selected.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className={`relative rounded-lg border p-4 cursor-pointer ${
                        checked ? "border-[#cc3369] bg-rose-50/50" : "bg-white hover:bg-neutral-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="absolute left-3 top-3 h-4 w-4 accent-[#cc3369]"
                        checked={checked}
                        onChange={() => toggleSelect(r.id)}
                      />
                      <div className="pl-7">
                        <div className="font-medium">{r.label}</div>
                        {r.desc && <div className="mt-1 text-sm text-neutral-600">{r.desc}</div>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* Other Searches */}
          <section className="card">
            <button
              type="button"
              onClick={() => setOpenOther((o) => !o)}
              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-neutral-50"
            >
              <span className="text-base font-semibold">Other searches</span>
              <span className={`transform transition-transform ${openOther ? "rotate-180" : ""}`}>⌄</span>
            </button>

            {openOther && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ALL_PRODUCTS.map((p) => {
                  const checked = selected.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`relative rounded-lg border p-4 cursor-pointer ${
                        checked ? "border-[#cc3369] bg-rose-50/50" : "bg-white hover:bg-neutral-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="absolute left-3 top-3 h-4 w-4 accent-[#cc3369]"
                        checked={checked}
                        onChange={() => toggleSelect(p.id)}
                      />
                      <div className="pl-7">
                        <div className="font-medium">{p.label}</div>
                        {p.desc && <div className="mt-1 text-sm text-neutral-600">{p.desc}</div>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* Footer Action Bar */}
          <section>
            <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">
              <div className="text-sm text-neutral-700">
                {selected.length > 0 ? (
                  <>
                    <span className="font-medium">{selected.length}</span> selected
                  </>
                ) : (
                  <>Select items to continue</>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  disabled={selected.length === 0}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:text-neutral-400"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Continue with: ${selected.join(", ")}`)}
                  disabled={selected.length === 0}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:bg-neutral-300 bg-[#cc3369] hover:opacity-90"
                >
                  Continue
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}