"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

const PRIMARY = "#cc3369";
const TEXT = "#333333";

type Item = {
  code: string;
  title: string;
  priceText: string;
  eta: string;
  priceValue?: number;
  variable?: boolean;
  defaultChecked?: boolean;
};
type StructuredAddress = {
  formattedAddress: string;
  lat: number | null;
  lng: number | null;
  unit?: string | null;
  streetNumber?: string | null;
  street?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  country?: string | null;
};

declare global {
  interface Window {
    google: any;
  }
}

function parsePlace(place: any): StructuredAddress {
  const comps = place?.address_components || [];
  const get = (type: string, field: "short_name" | "long_name" = "short_name") =>
    comps.find((c: any) => c.types?.includes(type))?.[field] ?? null;

  const lat = place?.geometry?.location?.lat?.() ?? null;
  const lng = place?.geometry?.location?.lng?.() ?? null;

  return {
    formattedAddress: place?.formatted_address || "",
    lat,
    lng,
    unit: get("subpremise"),
    streetNumber: get("street_number"),
    street: get("route", "long_name"),
    suburb: get("locality", "long_name") || get("postal_town", "long_name"),
    state: get("administrative_area_level_1"),
    postcode: get("postal_code"),
    country: get("country"),
  };
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [verified, setVerified] = useState(false);
  const [addrDetails, setAddrDetails] = useState<StructuredAddress | null>(null);
  const [showList, setShowList] = useState(false);
  const [isStrata, setIsStrata] = useState(false);

  const baseItems: Item[] = [
    { code: "QLD_FORM", title: "QLD Seller Disclosure Form", priceText: "$0", eta: "instant", priceValue: 0, defaultChecked: true },
    { code: "TITLE", title: "Title", priceText: "$19.00 per lot", eta: "instant", priceValue: 19.0, defaultChecked: true },
    { code: "PLAN", title: "Plan", priceText: "$20.72 per plan", eta: "instant", priceValue: 20.72, defaultChecked: true },
    { code: "RATES", title: "Current Rates Balance", priceText: "$0", eta: "48 hours", priceValue: 0, defaultChecked: true },
    { code: "WATER", title: "Water Meter reading", priceText: "$49.25 per lot", eta: "instant", priceValue: 49.25, defaultChecked: true },
    { code: "CONTAM_SEARCH", title: "Contaminated Land Search", priceText: "price unknown", eta: "24hours", variable: true, defaultChecked: true },
    { code: "ZONING", title: "Seller Disclosure Zoning report", priceText: "$55", eta: "24hours", priceValue: 55, defaultChecked: true },
    { code: "CONTAM_NOTICES", title: "Contamination Notices", priceText: "$65", eta: "24 hours", priceValue: 65, defaultChecked: false },
  ];
  const strataItem: Item = {
    code: "FORM33",
    title: "Body corporate info cert (standard BCCM Form 33)",
    priceText: "price variable per lot",
    eta: "7 days",
    variable: true,
    defaultChecked: true,
  };

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const items = useMemo<Item[]>(() => {
    const full = isStrata ? [...baseItems, strataItem] : baseItems;
    const init: Record<string, boolean> = {};
    full.forEach((it) => (init[it.code] = it.defaultChecked ?? true));
    setSelected(init);
    return full;
  }, [isStrata, showList]);

  function toggle(code: string) {
    setSelected((prev) => ({ ...prev, [code]: !prev[code] }));
  }

  const total = useMemo(() => {
    let sum = 0;
    let hasVariable = false;
    items.forEach((it) => {
      if (!selected[it.code]) return;
      if (it.variable) { hasVariable = true; return; }
      if (typeof it.priceValue === "number") sum += it.priceValue;
    });
    return { sum, hasVariable };
  }, [items, selected]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const autoRef = useRef<any>(null);
  const [googleReady, setGoogleReady] = useState(false);

  function initAutocomplete() {
    if (!window.google || !inputRef.current) return;
    autoRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "au" },
    });
    autoRef.current.addListener("place_changed", () => {
      const place = autoRef.current.getPlace();
      if (!place?.formatted_address) return;
      const parsed = parsePlace(place);
      setAddress(parsed.formattedAddress);
      setVerified(true);
      setAddrDetails(parsed);
    });
  }

  useEffect(() => {
    if (googleReady) initAutocomplete();
  }, [googleReady]);

  function onSearch() {
    if (!address.trim()) return;
    if (!verified) {
      setVerified(true);
      setAddrDetails({ formattedAddress: address, lat: null, lng: null });
    }
    setShowList(true);
  }

  return (
    <main style={{ minHeight: "100vh", background: "white", color: TEXT, fontFamily: "system-ui, sans-serif", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 50 }}>
      <Script
        id="google-places"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />

      <div style={{ width: "100%", maxWidth: 880, textAlign: "center" }}>
        <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 800 }}>QLD Sellers Disclosure Package</h1>
        <p style={{ marginBottom: 24 }}>Enter an address to see recommended searches.</p>

        {/* Address input */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 620 }}>
            <input
              ref={inputRef}
              value={address}
              onChange={(e) => { setAddress(e.target.value); setVerified(false); setAddrDetails(null); }}
              placeholder="Start typing address…"
              style={{ width: "100%", padding: "12px 44px 12px 12px", border: "1px solid #ddd", borderRadius: 10, fontSize: 16, color: TEXT }}
            />
            {verified && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#19a55a" }}>✓</span>}
          </div>

          <button onClick={onSearch} disabled={!address.trim()} style={{ padding: "12px 18px", borderRadius: 10, border: "none", background: address.trim() ? PRIMARY : "#ccc", color: "#fff", fontWeight: 700 }}>
            Search
          </button>
        </div>

        {addrDetails && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
            <div><strong>Formatted:</strong> {addrDetails.formattedAddress}</div>
            {addrDetails.lat && addrDetails.lng && (
              <div><strong>Coords:</strong> {addrDetails.lat.toFixed(6)}, {addrDetails.lng.toFixed(6)}</div>
            )}
          </div>
        )}

        {showList && (
          <>
            <div style={{ margin: "10px 0 18px" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={isStrata} onChange={(e) => setIsStrata(e.target.checked)} />
                <span>Property is strata (Body corporate applies)</span>
              </label>
            </div>

            <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 10, background: "#fafafa", textAlign: "left" }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>QLD Seller Disclosure Package</div>
              <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 180px 140px", fontWeight: 700, fontSize: 13, borderBottom: "1px solid #ddd", padding: "10px 12px" }}>
                <div></div><div>Item</div><div style={{ textAlign: "right" }}>Price</div><div style={{ textAlign: "right" }}>ETA</div>
              </div>
              {items.map((it) => {
                const checked = selected[it.code];
                return (
                  <div key={it.code} style={{ display: "grid", gridTemplateColumns: "36px 1fr 180px 140px", padding: "12px 12px", borderBottom: "1px solid #f1f1f1", background: "#fff" }}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(it.code)} />
                    <div>{it.title}</div>
                    <div style={{ textAlign: "right" }}>{it.priceText}</div>
                    <div style={{ textAlign: "right" }}>{it.eta}</div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 14 }}>
                <div><strong>Total: </strong>${total.sum.toFixed(2)}{total.hasVariable && " + variable items"}</div>
                <button style={{ padding: "10px 18px", background: PRIMARY, color: "#fff", borderRadius: 10 }}>Continue</button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
