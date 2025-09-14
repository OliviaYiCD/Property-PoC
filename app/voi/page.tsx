"use client";

import { useMemo, useState } from "react";

const PRIMARY = "#cc3369";
const TEXT = "#333333";

type FlowType = "biometric" | "biometric_aml" | "aml_only";
type Comm = "link" | "sms" | "email";

export default function VOIPage() {
  const [flow, setFlow] = useState<FlowType>("aml_only"); // default to AML-only for your test
  const [comm, setComm] = useState<Comm>("link");
  const [first, setFirst] = useState("Olivia");
  const [last, setLast] = useState("Yi");
  const [email, setEmail] = useState("yiqiwei333@gmail.com");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("01/01/1990"); // DD/MM/YYYY for PEP
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startUrl, setStartUrl] = useState<string | null>(null);
  const [pepResult, setPepResult] = useState<any>(null);

  const showPhone = comm === "sms";
  const showEmail = comm === "email" || flow !== "aml_only"; // email is needed for biometric invite

  const payload = useMemo(
    () => ({
      firstname: first,
      lastname: last,
      email: showEmail ? email : undefined,
      phone: showPhone ? phone : undefined,
      communication_method: comm as "link" | "sms" | "email",
      dob, // only used by AML/PEP route (ignored by identity-verifications)
      mode: flow,
    }),
    [first, last, email, phone, comm, dob, flow, showEmail, showPhone]
  );

  async function startBiometricOrCombo(fakeOverride?: boolean) {
    setError(null);
    setStarting(true);
    setStartUrl(null);
    setPepResult(null);
    try {
      const qs = new URLSearchParams();
      if (typeof fakeOverride === "boolean")
        qs.set("fake", fakeOverride ? "1" : "0");

      const res = await fetch(`/api/aplyid/start?${qs.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(
          data?.error ||
            `Failed to start verification (status ${res.status}). ${data?.hint || ""}`
        );
      } else {
        setStartUrl(data.start_process_url || null);
      }
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setStarting(false);
    }
  }

  async function startPepOnly(fakeOverride?: boolean) {
    setError(null);
    setStarting(true);
    setStartUrl(null);
    setPepResult(null);
    try {
      const qs = new URLSearchParams();
      if (typeof fakeOverride === "boolean")
        qs.set("fake", fakeOverride ? "1" : "0");

      const res = await fetch(`/api/aplyid/pep?${qs.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: payload.firstname,
          lastname: payload.lastname,
          dob: payload.dob, // DD/MM/YYYY
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(
          data?.error ||
            `PEP check failed (status ${res.status}). ${data?.hint || ""}`
        );
      } else {
        setPepResult(data.raw || data);
      }
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setStarting(false);
    }
  }

  async function handleStart(fakeOverride?: boolean) {
    if (flow === "aml_only") {
      return startPepOnly(fakeOverride);
    }
    // biometric or combo
    return startBiometricOrCombo(fakeOverride);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: TEXT }}>
        VOI + AML
      </h1>
      <p className="mb-6" style={{ color: TEXT }}>
        Start a verification or run a PEP (AML) check.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Flow selection */}
        <div className="rounded-lg border p-4 bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Verification type</h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="flow"
                checked={flow === "biometric"}
                onChange={() => setFlow("biometric")}
              />
              Biometric only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="flow"
                checked={flow === "biometric_aml"}
                onChange={() => setFlow("biometric_aml")}
              />
              Biometric + AML
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="flow"
                checked={flow === "aml_only"}
                onChange={() => setFlow("aml_only")}
              />
              AML (PEP) only
            </label>
          </div>
        </div>

        {/* Delivery + Person details */}
        <div className="rounded-lg border p-4 bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Delivery & person</h2>

          {/* Only relevant to biometric flows */}
          <label className="block text-sm font-medium">Delivery method</label>
          <div className="flex gap-3 mb-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="comm"
                checked={comm === "link"}
                onChange={() => setComm("link")}
                disabled={flow === "aml_only"}
              />
              Link / QR
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="comm"
                checked={comm === "sms"}
              onChange={() => setComm("sms")}
              disabled={flow === "aml_only"}
              />
              SMS
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="comm"
                checked={comm === "email"}
                onChange={() => setComm("email")}
                disabled={flow === "aml_only"}
              />
              Email
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium">First name</label>
              <input
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Last name</label>
              <input
                value={last}
                onChange={(e) => setLast(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            {/* Email only matters for biometric invites */}
            {flow !== "aml_only" && (
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            )}

            {/* DOB required for AML/PEP */}
            {flow === "aml_only" && (
              <div>
                <label className="block text-sm font-medium">
                  Date of birth (DD/MM/YYYY)
                </label>
                <input
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="DD/MM/YYYY"
                />
              </div>
            )}

            {flow !== "aml_only" && showPhone && (
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="+61…"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          className="rounded-lg px-3 py-2"
          style={{ background: PRIMARY, color: "white" }}
          onClick={() => handleStart()}
          disabled={starting}
        >
          {starting ? "Submitting…" : flow === "aml_only" ? "Run PEP" : "Start verification"}
        </button>

        <button
          className="rounded-lg border px-3 py-2"
          onClick={() => handleStart(true)}
          disabled={starting}
          title="Force FAKE mode for demo"
        >
          {flow === "aml_only" ? "Run PEP (fake)" : "Start (fake)"}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div
          className="mt-4 rounded-md border px-3 py-2"
          style={{ borderColor: "#fecaca", background: "#fff1f2", color: "#7f1d1d" }}
        >
          {error}
        </div>
      )}

      {/* Biometric link */}
      {startUrl && flow !== "aml_only" && (
        <div className="mt-6 rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Invite link</h3>
          <div className="flex items-center gap-2">
            <input readOnly value={startUrl} className="w-full rounded-lg border px-3 py-2" />
            <button
              className="rounded-lg border px-3 py-2"
              onClick={() => navigator.clipboard.writeText(startUrl)}
            >
              Copy
            </button>
            <a
              className="rounded-lg px-3 py-2"
              style={{ background: PRIMARY, color: "white" }}
              href={startUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open
            </a>
          </div>
        </div>
      )}

      {/* PEP JSON */}
      {pepResult && flow === "aml_only" && (
        <div className="mt-6 rounded-lg border p-4">
          <h3 className="font-semibold mb-2">PEP Result (raw)</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(pepResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}