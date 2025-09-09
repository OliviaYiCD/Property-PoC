"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { parsePlace, type StructuredAddress } from "@/lib/address";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = {
  value: string;
  onChange: (v: string) => void;
  onVerified: (details: StructuredAddress) => void;
};

export default function AddressField({ value, onChange, onVerified }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function init() {
      const w = window as any;
      if (!w.google || !inputRef.current) return;
      const ac = new w.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "au" },
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace?.();
        if (!place?.formatted_address) return;
        const parsed = parsePlace(place);
        onChange(parsed.formattedAddress);
        onVerified(parsed);
      });
    }
    // try now (in case script already loaded)
    init();
    // also listen for script load later
    (window as any).__initPlaces = init;
  }, [onChange, onVerified]);

  return (
    <>
      <Script
        id="google-places"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          const fn = (window as any).__initPlaces;
          if (typeof fn === "function") fn();
        }}
      />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing address…"
        style={{
          width: "100%",
          padding: "12px 44px 12px 12px",
          border: "1px solid #ddd",
          borderRadius: 10,
          fontSize: 16,
          color: "#333333",
        }}
      />
    </>
  );
}
