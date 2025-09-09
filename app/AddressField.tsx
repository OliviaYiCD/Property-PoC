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
  const acRef = useRef<any>(null);

  // Safe init that won't freeze typing if the script isn't ready
  function initAutocomplete() {
    try {
      const w = window as any;
      if (!w.google || !w.google.maps || !inputRef.current) return;
      if (acRef.current) return; // already initialized

      acRef.current = new w.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "au" },
      });

      acRef.current.addListener("place_changed", () => {
        try {
          const place = acRef.current?.getPlace?.();
          if (!place?.formatted_address) return;
          const parsed = parsePlace(place);
          onChange(parsed.formattedAddress);
          onVerified(parsed);
        } catch (err) {
          console.error("place_changed handler failed", err);
        }
      });
    } catch (err) {
      console.error("Autocomplete init failed", err);
    }
  }

  useEffect(() => {
    // Try immediately (in case the script already loaded),
    // and store the initializer for the onLoad callback below.
    (window as any).__initPlaces = initAutocomplete;
    initAutocomplete();
    // No deps: we want this to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Load the Google Maps JS (Places) script once this component mounts */}
      <Script
        id="google-places"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          // if the component mounted before the script, init now
          const fn = (window as any).__initPlaces;
          if (typeof fn === "function") fn();
        }}
        onError={(e) => {
          console.error("Google Maps script failed to load", e);
          // input still works as a plain text field
        }}
      />

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)} // always allow typing
        placeholder="Start typing address…"
        autoComplete="off"
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
