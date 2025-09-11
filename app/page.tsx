"use client";

import React, { useState } from "react";

const PRIMARY = "#cc3369";
const TEXT = "#333333";

export default function HomePage() {
  const [address, setAddress] = useState("");
  const [verified, setVerified] = useState(false);
  const [addrDetails, setAddrDetails] = useState<any>(null);

  function onSearch() {
    console.log("Search clicked:", address);
    // Add your search logic here
    setVerified(true);
    setAddrDetails({}); // placeholder
  }

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "40px 16px",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>QLD Sellers Disclosure Package</h1>
      <p style={{ marginBottom: 24, color: "#666" }}>
        Enter an address to see recommended searches.
      </p>

      {/* Address input + Search button */}
 {/* Address input + Search button */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  }}
>
  <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
    <input
      value={address}
      onChange={(e) => {
        setAddress(e.target.value);
        setVerified(false);
        setAddrDetails(null);
      }}
      placeholder="Start typing address…"
      style={{
        width: "100%",
        padding: "12px 44px 12px 12px",
        border: "1px solid #ddd",
        borderRadius: 10,
        fontSize: 16,
        color: TEXT,
      }}
    />
    {verified && (
      <span
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#19a55a",
        }}
      >
        ✓
      </span>
    )}
  </div>

  <button
    onClick={onSearch}
    disabled={!address.trim()}
    style={{
      padding: "12px 18px",
      borderRadius: 10,
      border: "none",
      background: address.trim() ? PRIMARY : "#ccc",
      color: "#fff",
      fontWeight: 700,
      width: 140,
      height: 44,
    }}
  >
    Search
  </button>
</div>


      {/* Results placeholder */}
      {verified && (
        <div style={{ marginTop: 24 }}>
          <h3>Recommended searches will show here</h3>
        </div>
      )}
    </main>
  );
}
