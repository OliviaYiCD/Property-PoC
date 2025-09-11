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
  const [phone, setPhone] = useState(""); // e.g. 0468920567
  const [dob, setDob] = useState("");     // YYYY-MM-DD (AML only)
  const [mode, setMode] = useState<Mode>("biometric");
  const [delivery, setDelivery] = useState<Delivery>("sms");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user chooses AML-only, force delivery to Email (no SMS link for AML-only)
  useEffect(() => {
    if (mode === "aml_only") setDelivery("email");
  }, [mode]);

  function normaliseAuMobile(raw: string) {
    const digits = raw.replace(/\D/g, "");
    return digits.startsWith("0") ? "61" + digits.slice(1) : digits;
  }

  async function start() {
    if (mode === "aml_only") return startAmlOnly();
    return startBiometricFlow();
  }

  async function startBiometricFlow() {
    setLoading(true);
    setError(null);
    try {
      const contact_phone = delivery === "sms" ? normaliseAuMobile(phone) : undefined;
      const communication_method = delivery === "sms" ? "sms" : "link";

      const res = await fetch("/api/aplyid/send-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: first,
          lastname: last,
          email,
          contact_phone,
          communication_method,
          reference: `VOI-${Date.now()}`,
          redirect_success_url:
            communication_method === "link" ? `${VERCEL_ORIGIN}/voi/thanks` : undefined,
          redirect_cancel_url:
            communication_method === "link" ? `${VERCEL_ORIGIN}/voi` : undefined,
          biometric_only: mode === "biometric",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(JSON.stringify(json));

      if (communication_method === "sms") {
        alert("SMS sent (if the mobile is valid in AU format).");
        return;
      }

      const startUrl: string | undefined = json.start_process_url;
      if (!startUrl) throw new Error("No start_process_url returned.");

      window.open(startUrl, "_blank");

      if (email) {
        const subject = encodeURIComponent("Your APLYiD Identity Verification Link");
        const body = encodeURIComponent(
          `Hi ${first || ""},

Please complete your identity verification using the secure link below:

${startUrl}

Thanks!`
        );
        window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
      } else {
        prompt("Copy your verification link:", startUrl);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to start VOI");
    } finally {
      setLoading(false);
    }
  }

  async function startAmlOnly() {
    setLoading(true);
    setError(null);
    try {
      // Call our AML API route (next step below)
      const res = await fetch("/api/aplyid/aml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: first,
          lastname: last,
          email,
          dob,                       // YYYY-MM-DD
          reference: `AML-${Date.now()}`,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(JSON.stringify(json));

      if (json.report_url) {
        window.open(json.report_url, "_blank");
      } else {
        alert("AML check started. View status on Results.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to start AML-only check");
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
        <label style={{ fontSize: 14, color: "#666", display: "block", marginBottom: 6 }}>
          Verification
        </label>
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

      {/* Delivery (hidden for AML-only; email is enforced there) */}
      {mode !== "aml_only" && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 14, color: "#666", display: "block", marginBottom: 6 }}>
            Delivery
          </label>
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
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr", marginTop: 12 }}>
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
            placeholder="Mobile (e.g. 0468920567)"
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

const radioLabel: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  border: "1px solid #eee",
  borderRadius: 8,
};
