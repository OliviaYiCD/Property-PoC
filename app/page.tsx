"use client";

import { useMemo, useState } from "react";
import AddressField from "./AddressField";

/** ---------- THEME ---------- */
const PRIMARY = "#cc3369";
const TEXT = "#333333";
const BG = "#ffffff";

/** ---------- TYPES ---------- */
type Item = {
  id: string;
  label: string;
  eta: string;
  priceType:
    | { kind: "fixed"; amount: number }
    | { kind: "perLot"; amount: number }
    | { kind: "perPlan"; amount: number }
    | { kind: "unknown" };
  optional?: boolean;
  checked: boolean;
};

type LotPlan = {
  lot: string;
  planPrefix: string;
  planNumber: string;
};

/** ---------- HELPERS ---------- */
function aud(n: number) {
  return n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 2,
  });
}

function priceLabel(item: Item) {
  if (item.priceType.kind === "fixed") return aud(item.priceType.amount);
  if (item.priceType.kind === "perLot")
    return `${aud(item.priceType.amount)} per lot`;
  if (item.priceType.kind === "perPlan")
    return `${aud(item.priceType.amount)} per plan`;
  return "Price unknown";
}

function computeTotal(items: Item[]) {
  let total = 0;
  for (const it of items) {
    if (!it.checked) continue;
    switch (it.priceType.kind) {
      case "fixed":
        total += it.priceType.amount;
        break;
      case "perLot":
        total += it.priceType.amount * 1; // assume 1 lot
        break;
      case "perPlan":
        total += it.priceType.amount * 1; // assume 1 plan
        break;
      case "unknown":
        break;
    }
  }
  return total;
}

/** Detect QLD Lot/Plan patterns like "12/RP12345" or "Lot 7 SP123456" */
function detectLotPlan(input: string): LotPlan | null {
  const s = input.trim();
  const patA =
    /\b(?:lot|l)\s*(\d+)\s*(?:on\s*)?([a-zA-Z]{1,5})\s*0*?(\d{1,8})\b/i;
  const patB = /\b(\d+)\s*\/\s*([a-zA-Z]{1,5})\s*0*?(\d{1,8})\b/;

  const mA = s.match(patA);
  if (mA) {
    return {
      lot: mA[1],
      planPrefix: mA[2].toUpperCase(),
      planNumber: mA[3],
    };
  }
  const mB = s.match(patB);
  if (mB) {
    return {
      lot: mB[1],
      planPrefix: mB[2].toUpperCase(),
      planNumber: mB[3],
    };
  }
  return null;
}

export default function Page() {
  /** Single input: Address OR Lot/Plan */
  const [input, setInput] = useState("");
  const [verified, setVerified] = useState(false); // Google verified address
  const lp = useMemo(() => detectLotPlan(input), [input]);

  /** Property type toggle (to show Body Corporate item) */
  const [propertyType, setPropertyType] = useState<"house" | "strata">("house");

  /** Show results */
  const [showResults, setShowResults] = useState(false);

  /** Items */
  const initialItems = useMemo<Item[]>(
    () => [
      {
        id: "qld-seller-disclosure-form",
        label: "QLD Seller Disclosure Form",
        eta: "instant",
        priceType: { kind: "fixed", amount: 0 },
        checked: true,
      },
      {
        id: "title",
        label: "Title",
        eta: "instant",
        priceType: { kind: "perLot", amount: 19.0 },
        checked: true,
      },
      {
        id: "plan",
        label: "Plan",
        eta: "instant",
        priceType: { kind: "perPlan", amount: 20.72 },
        checked: true,
      },
      {
        id: "current-rates",
        label: "Current Rates Balance",
        eta: "48 hours",
        priceType: { kind: "fixed", amount: 0 },
        checked: true,
      },
      {
        id: "water-meter",
        label: "Water Meter Reading",
        eta: "instant",
        priceType: { kind: "perLot", amount: 49.25 },
        checked: true,
      },
      {
        id: "contaminated-land",
        label: "Contaminated Land Search",
        eta: "24 hours",
        priceType: { kind: "unknown" },
        checked: true,
      },
      {
        id: "zoning",
        label: "Seller Disclosure Zoning Report",
        eta: "24 hours",
        priceType: { kind: "fixed", amount: 55 },
        checked: true,
      },
      {
        id: "contamination-notices",
        label: "Contamination Notices (optional)",
        eta: "24 hours",
        priceType: { kind: "fixed", amount: 65 },
        optional: true,
        checked: false,
      },
    ],
    []
  );
  const [items, setItems] = useState<Item[]>(initialItems);

  /** Body Corporate item */
  const strataItem: Item = {
    id: "body-corporate-cert",
    label: "Body corporate info cert (standard BCCM Form 33)",
    eta: "7 days",
    priceType: { kind: "perLot", amount: 0 }, // variable per lot
    checked: false,
  };

  const visibleItems = useMemo(() => {
    if (propertyType === "strata") {
      const exists = items.some((i) => i.id === strataItem.id);
      return exists ? items : [...items, strataItem];
    }
    return items.filter((i) => i.id !== strataItem.id);
  }, [items, propertyType]);

  const total = useMemo(() => computeTotal(visibleItems), [visibleItems]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  /** Search button */
  const onSearch = () => {
    if (lp || input.trim()) {
      setShowResults(true);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{
        background: BG,
        color: TEXT,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div className="w-full max-w-3xl p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: TEXT }}>
          <strong>QLD Seller Disclosure Package</strong>
        </h1>
        <p className="text-center mb-6" style={{ color: TEXT }}>
          Enter <u>an address</u> or <u>Lot/Plan</u> to see recommended searches.
        </p>

        {/* Input */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-full max-w-xl">
            <label className="block text-sm font-medium mb-1">
              Address or Lot/Plan
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <AddressField
                  value={input}
                  onChange={(v) => {
                    setInput(v);
                    setVerified(false);
                  }}
                  onVerified={(ok) => setVerified(ok)}
                />
              </div>
              {verified && !lp && (
                <span
                  aria-label="verified"
                  title="Address verified"
                  className="shrink-0"
                  style={{ color: "#16a34a", fontSize: 20 }}
                >
                  ✔
                </span>
              )}
            </div>
            {lp && (
              <div
                className="mt-2 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm"
                style={{ background: "#eef2ff", border: "1px solid #e0e7ff" }}
              >
                <span className="font-medium" style={{ color: "#3730a3" }}>
                  Detected Lot/Plan:
                </span>
                <span style={{ color: "#3730a3" }}>
                  Lot {lp.lot} {lp.planPrefix}
                  {lp.planNumber}
                </span>
              </div>
            )}
          </div>

          {/* Property type */}
          <div className="w-full max-w-xl">
            <label className="text-sm font-medium mb-1">Property type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as any)}
              className="rounded-lg border px-3 py-2 w-full"
            >
              <option value="house">House / Non-strata</option>
              <option value="strata">Strata</option>
            </select>
          </div>

          <button
            onClick={onSearch}
            className="rounded-lg px-5 py-2 font-medium"
            style={{
              background: PRIMARY,
              color: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              marginTop: 4,
            }}
          >
            Search
          </button>
        </div>

        {/* Results */}
        {showResults && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3 text-center">
              Recommended searches — QLD Seller Disclosure Package
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr
                    style={{
                      background: "#fafafa",
                      borderBottom: "1px solid #eee",
                      textAlign: "left",
                    }}
                  >
                    <th className="py-2 pl-2 pr-3">Select</th>
                    <th className="py-2 pr-3">Item</th>
                    <th className="py-2 pr-3">ETA</th>
                    <th className="py-2 pr-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((it) => (
                    <tr key={it.id} className="border-b" style={{ borderColor: "#eee" }}>
                      <td className="py-2 pl-2 pr-3 align-middle">
                        <input
                          type="checkbox"
                          checked={it.checked}
                          onChange={() => toggleItem(it.id)}
                        />
                      </td>
                      <td className="py-2 pr-3 align-middle">
                        {it.label}
                        {it.optional && (
                          <span className="ml-2 text-xs" style={{ color: "#6b7280" }}>
                            (optional)
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3 align-middle">{it.eta}</td>
                      <td className="py-2 pr-3 align-middle text-right">
                        {priceLabel(it)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-5 flex items-center justify-between">
              <div className="text-lg font-semibold">Total: {aud(total)}</div>
              <button
                className="rounded-lg px-5 py-2 font-medium"
                style={{ background: PRIMARY, color: "white" }}
                onClick={() => alert("Continue → Checkout (coming soon)")}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}