"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  companyName: string;
};

export function WorkspaceModal({ open, onClose, companyName }: Props) {
  const [year, setYear] = useState(2023);
  const [selected, setSelected] = useState<string[]>([]);

  // very lightweight mock nodes for the diagram
  const nodes = useMemo(
    () => [
      { id: "hold", label: "ACME HOLDINGS", x: 320, y: 80 },
      { id: "pty", label: "ACME PTY LTD", x: 320, y: 160 },
      { id: "whole", label: "ACME WHOLE...", x: 170, y: 260 },
      { id: "retail", label: "ACME RETAIL", x: 470, y: 260 },
      { id: "nz", label: "ACME NZ LTD", x: 320, y: 340 },
      { id: "newsub", label: "NEW SUBSIDIA...", x: 540, y: 200 },
    ],
    []
  );

  const edges = useMemo(
    () => [
      ["hold", "pty"],
      ["pty", "whole"],
      ["pty", "retail"],
      ["retail", "nz"],
      ["pty", "newsub"],
    ],
    []
  );

  if (!open) return null;

  const insightUrl = `/insight360?company=${encodeURIComponent(companyName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4">
      <div className="card w-full max-w-5xl !p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <div className="text-sm text-neutral-500">Workspace</div>
            <div className="text-lg font-semibold">{companyName}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
          >
            Close
          </button>
        </div>

        {/* Canvas */}
        <div className="px-5 py-6">
          <div className="relative h-[320px] w-full rounded-lg border bg-white">
            {/* edges (very simple lines) */}
            <svg className="absolute inset-0 h-full w-full">
              {edges.map(([from, to], idx) => {
                const a = nodes.find((n) => n.id === from)!;
                const b = nodes.find((n) => n.id === to)!;
                return (
                  <line
                    key={idx}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="#cbd5e1"
                    strokeWidth={2}
                  />
                );
              })}
            </svg>

            {/* nodes */}
            {nodes.map((n) => {
              const active = selected.includes(n.id);
              return (
                <button
                  key={n.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-xs ${
                    active
                      ? "border-[#cc3369] bg-rose-50 text-[#cc3369]"
                      : "bg-white"
                  }`}
                  style={{ left: n.x, top: n.y }}
                  onClick={() => {
                    setSelected((prev) =>
                      prev.includes(n.id)
                        ? prev.filter((id) => id !== n.id)
                        : [...prev, n.id]
                    );
                  }}
                  title="Click to select"
                >
                  {n.label}
                </button>
              );
            })}
          </div>

          {/* Timeline */}
          <div className="mt-5 rounded-lg border">
            <div className="border-b px-4 py-2 text-sm font-medium">Timeline</div>
            <div className="px-4 py-3 text-sm text-neutral-600">
              Explore historical structure snapshots
            </div>
            <div className="px-4 pb-4">
              <div className="mb-1 text-sm">Year: {year}</div>
              <input
                type="range"
                min={2015}
                max={2025}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          </div>

          {/* Selected row */}
          <div className="mt-5 rounded-lg border">
            <div className="border-b px-4 py-2 text-sm font-medium">Selected</div>
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
              {selected.length === 0 ? (
                <span className="text-neutral-500">None</span>
              ) : (
                selected.map((id) => (
                  <span
                    key={id}
                    className="rounded-full border px-2.5 py-0.5 text-xs"
                  >
                    {nodes.find((n) => n.id === id)?.label ?? id}
                  </span>
                ))
              )}

              <div className="ml-auto flex gap-2">
                <button className="rounded-md border px-2.5 py-1 hover:bg-neutral-50">
                  + Add subsidiary
                </button>
                <button
                  className="rounded-md border px-2.5 py-1 hover:bg-neutral-50"
                  onClick={() => setSelected([])}
                >
                  Clear selection
                </button>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="mt-5 rounded-lg border">
            <div className="border-b px-4 py-2 text-sm font-medium">Export</div>
            <div className="px-4 py-3 text-sm text-neutral-600">
              Save current layout and attach to your order as a PDF.
            </div>
            <div className="px-4 pb-4">
              <button className="btn-primary w-full">Save to order</button>
            </div>
          </div>
        </div>

        {/* Footer with CTAs */}
        <div className="flex items-center justify-between gap-3 border-t bg-neutral-50 px-5 py-3">
          <button
            className="rounded-md border px-3 py-1.5 hover:bg-neutral-100"
            onClick={onClose}
          >
          </button>

          <div className="flex items-center gap-2">
            {/* New: Edit with Insight360 */}
            <Link
              href={insightUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border px-3 py-1.5 hover:bg-neutral-100"
              title="Open in Insight360 (new tab)"
            >
              Edit with Insight360
            </Link>

            <button className="rounded-md border px-3 py-1.5 hover:bg-neutral-100">
              Save & attach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}