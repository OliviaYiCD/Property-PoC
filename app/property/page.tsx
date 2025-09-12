// app/property/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import AddressField from "../AddressField"; // Google Places input

type Recommendation = {
  id: string;
  label: string;
  href: string;
  desc?: string;
};

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

export default function PropertyPage() {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search property", { query, state: stateFilter });
  };

  const recommendations: Recommendation[] =
    query.trim().length === 0
      ? []
      : [
          { id: "qld-seller-disclosure", label: "QLD Seller Disclosure Package", href: "#", desc: "Core forms + title + plan + rates + zoning" },
          { id: "title", label: "Title Search", href: "#", desc: "Current ownership & encumbrances" },
          { id: "plan", label: "Plan / DP / Lot Plan", href: "#", desc: "Lot/plan & parcel details" },
          { id: "rates", label: "Current Rates Balance", href: "#", desc: "Council rates & outstanding balance" },
          { id: "zoning", label: "Zoning / Planning Report", href: "#", desc: "Planning overlays & zoning summary" },
          { id: "historic", label: "Historical Title", href: "#", desc: "Chain of title ownership" },
        ];

  /** ---------- File upload handlers ---------- */
  const onInputFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    setFiles(dropped);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const analyzeFiles = async () => {
    // TODO: POST to your /api/doc-analyze endpoint (to be added)
    // Example:
    // const form = new FormData();
    // files.forEach((f) => form.append("files", f));
    // const res = await fetch("/api/doc-analyze", { method: "POST", body: form });
    // const json = await res.json();
    console.log("Analyze files:", files.map((f) => f.name));
    alert("Demo only: files captured. Hook this up to your parser/recommender next.");
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold">Property Search</h1>
        <p className="text-sm text-neutral-600">
          Search by address, title reference, or lot/plan — or upload a contract/disclosure and we’ll suggest searches.
        </p>
      </div>

      {/* Search card */}
      <section className="card">
        <form onSubmit={onSearch} className="flex flex-col gap-3 md:flex-row">
          <div className="md:w-40">
            <label htmlFor="state" className="sr-only">State</label>
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
            <AddressField value={query} onChange={(v) => setQuery(v)} onVerified={() => {}} />
          </div>

          <button type="submit" className="rounded-lg bg-[#cc3369] px-4 py-2 text-white hover:opacity-90">
            Search
          </button>
        </form>
      </section>

      {/* Upload card */}
      <section className="card">
        <div className="mb-2">
          <h2 className="text-base font-semibold">Upload documents</h2>
          <p className="text-sm text-neutral-600">
            Upload a <b>property contract</b> or <b>seller disclosure statement</b>. We’ll parse key details and recommend searches.
          </p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center ${
            dragOver ? "border-[#cc3369] bg-[#fff6f9]" : "border-neutral-200 bg-white"
          }`}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            multiple
            onChange={onInputFiles}
            className="hidden"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <div className="text-sm text-neutral-600">
              Drag & drop files here, or <span className="text-[#cc3369] underline">browse</span>
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              PDF, DOC, DOCX, PNG, JPG — up to ~25MB each
            </div>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-4 rounded-lg border bg-white">
            <div className="px-3 py-2 text-sm font-medium">Selected files</div>
            <ul className="divide-y divide-neutral-200 text-sm">
              {files.map((f) => (
                <li key={f.name} className="flex items-center justify-between px-3 py-2">
                  <span className="truncate">{f.name}</span>
                  <span className="text-neutral-500">{Math.round(f.size / 1024)} KB</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <button
            onClick={analyzeFiles}
            disabled={files.length === 0}
            className={`rounded-lg px-4 py-2 text-white ${
              files.length === 0
                ? "cursor-not-allowed bg-neutral-300"
                : "bg-[#cc3369] hover:opacity-90"
            }`}
          >
             
            Analyze file with AI
          </button>
        </div>
      </section>

      {/* Recommended Searches */}
      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Recommended Searches</h2>
          {query && (
            <span className="text-sm text-neutral-500">
              for <span className="font-medium">{query}</span>
              {stateFilter ? ` (${stateFilter})` : ""}
            </span>
          )}
        </div>

        {recommendations.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            Enter a property or upload a document to see recommended searches.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((r) => (
              <Link
                key={r.id}
                href={r.href}
                className="rounded-lg border bg-white p-4 hover:bg-neutral-50"
              >
                <div className="font-medium">{r.label}</div>
                {r.desc ? <div className="mt-1 text-sm text-neutral-600">{r.desc}</div> : null}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}