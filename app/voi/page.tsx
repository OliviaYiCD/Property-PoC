"use client";

import { useEffect, useState } from "react";

const PRIMARY = "#cc3369";
const TEXT = "#333333";

// Change if your Vercel URL changes
const VERCEL_ORIGIN = "https://property-po-c-cwf7.vercel.app";

type Mode = "biometric" | "biometric_aml" | "aml_only";
type Delivery = "sms" | "email";

export default function VoiPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // e.g. 0468…
  const [dob, setDob] = useState("");     // YYYY-MM-DD (AML only)
  const [mode, setMode] = useState<Mode>("biometric");
  const [delivery, setDelivery] = useState<Delivery>("sms");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AML-only uses email link flow (no SMS)
  useEffect(() => {
    if (mode === "aml_only") setDelivery("email");
  }, [mode]);

  function auMobileTo61(raw: string) {
    const digits = raw.replace(/\D/g, "");
    return digits.startsWith("0") ? "61" + digits.slice(1) : digits;
  }

  function verificationTypeLabel(m: Mode) {
    if (m === "aml_only") return "AML";
    if (m === "biometric_aml") return "Biometric + AML";
    return "Biometric";
  }

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const verificationType = verificationTypeLabel(mode);

      const payload: any = {
        firstName: first,
        lastName: last,
        email,
        verificationType,            // "Biometric" | "Biometric + AML" | "AML"
        delivery,                    // "sms" | "email"
        redirect_success_url: `${VERCEL_ORIGIN}/voi/thanks`,
        redirect_cancel_url: `${VERCEL_ORIGIN}/voi`,
      };

      if (delivery === "sms" && mode !== "aml_only") {
        payload.phone = auMobileTo61(phone); // 61…
      }
      if (mode === "aml_only") {
        payload.dob = dob; // YYYY-MM-DD
      }

      const res = await fetch("/api/aplyid/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Show full error text if not OK
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data = await res.json().catch(() => ({} as any));

      // If SMS, server should already have triggered the text
      if (delivery === "sms") {
        alert("If the mobile is valid, an SMS has been sent.");
        return;
      }

      // Email flow expects a start link from the API
      const startUrl: string | undefined =
        data.start_process_url || data.url || data.link;

      if (startUrl) {
        // Open the link (optional)
        window.open(startUrl, "_blank");

        // Compose an email with the link (PoC convenience)
        if (email) {
          const subject = encodeURIComponent("Your APLYiD Identity Verification Link");
          const body = encodeURIComponent(
            `Hi ${first || ""},

Please complete your verification using the secure link below:

${startUrl}

Thanks!`
          );
          window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
        } else {
          prompt("Copy your verification link:", startUrl);
        }
      } else {
        // No link returned — show raw payload so we can debug quickly
        alert("Started, but no link returned. Check Results or see console.");
        // eslint-disable-next-line no-console
        console.log("APLYiD start response:", data);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to start verification");
    } finally {
      setLoading(false);
    }
  }

  const disabled =
    loading ||
    !first ||
    !last ||
    (mode === "aml_only"
      ? !email || !dob
      : delivery === "sms"
      ? !phone
      : !email);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 16px" }}>
      <h1>VOI + AML</h1>
      <p>Enter details, choose verification type & delivery, then click <b>Start</b>.</p>

      {/* Name */}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginTop: 16 }}>
        <input
          placeholder="First name"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Last name"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Verification type */}
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Verification</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          style={{ ...inputStyle, width: "100%", background: "white", appearance: "none" }}
        >
          <option value="biometric">Biometric Only</option>
          <option value="biometric_aml">Biometric + AML Check</option>
          <option value="aml_only">AML Check Only</option>
        </select>
        <p style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
          {mode === "biometric"
            ? "Face + ID document verification."
            : mode === "biometric_aml"
            ? "Face + ID document verification with AML screening (PEP/sanctions, etc.)."
            : "Run AML screening only (no biometric capture)."}
        </p>
      </div>

      {/* Delivery (hidden for AML-only; email enforced) */}
      {mode !== "aml_only" && (
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Delivery</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label style={radioLabel}>
              <input
                type="radio"
                name="delivery"
                checked={delivery === "sms"}
                onChange={() => setDelivery("sms")}
              />{" "}
              SMS
            </label>
            <label style={radioLabel}>
              <input
                type="radio"
                name="delivery"
                checked={delivery === "email"}
                onChange={() => setDelivery("email")}
              />{" "}
              Email
            </label>
          </div>
        </div>
      )}

      {/* Contact & DOB */}
      {mode === "aml_only" ? (
        <>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <input
              placeholder="Email (to send the report/link)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <input
              type="date"
              placeholder="DOB (YYYY-MM-DD)"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              style={inputStyle}
            />
          </div>
        </>
      ) : delivery === "email" ? (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <input
            placeholder="Email (to send the verification link)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <input
            placeholder="Mobile (e.g. 0468 920 567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />
          <p style={{ marginTop: -4, color: "#666", fontSize: 13 }}>
            We convert <code>04…</code> to <code>61…</code> automatically.
          </p>
        </div>
      )}

      <button
        onClick={start}
        disabled={disabled}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 8,
          color: "#fff",
          background: disabled ? "#bbb" : PRIMARY,
          border: "none",
          fontWeight: 700,
        }}
      >
        {loading ? "Starting…" : mode === "aml_only" ? "Start AML Check" : "Start VOI"}
      </button>

      {error && (
        <pre style={{ color: "crimson", marginTop: 12, whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      <p style={{ marginTop: 16, color: "#666" }}>
        After completion, users are redirected to the “Thanks” page. You can view results on{" "}
        <a href="/voi/results">Results</a>.
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: 16,
  color: TEXT,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#666",
  display: "block",
  marginBottom: 6,
};

const radioLabel: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  border: "1px solid #eee",
  borderRadius: 8,
};
