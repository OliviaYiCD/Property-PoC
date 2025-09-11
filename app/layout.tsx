// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "Property PoC",
  description: "Playground",
};

const PRIMARY = "#cc3369";
const TEXT = "#333333";
const BG = "#ffffff";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Maps JS + Places (for AddressField) */}
        <Script
          id="gmaps"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places&v=weekly`}
          strategy="afterInteractive"
        />
      </head>
      <body style={{ background: BG, color: TEXT }}>
        {/* Top Nav */}
        <header
          style={{
            borderBottom: "1px solid #eee",
            background: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold" style={{ color: TEXT }}>
              UnityLite PoC
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/" className="hover:underline" style={{ color: TEXT }}>
                Property
              </Link>
              <Link href="/voi" className="hover:underline" style={{ color: TEXT }}>
                VOI + AML
              </Link>
              <Link href="/company" className="hover:underline" style={{ color: TEXT }}>
                Company search
              </Link>
            </div>

            {String(process.env.APLYID_FAKE_START).toLowerCase() === "true" && (
              <span
                className="rounded-md border px-2 py-1 text-xs"
                style={{
                  borderColor: "#ffecb5",
                  background: "#fff8db",
                  color: "#7a5b00",
                }}
                title="APLYID fake mode is ON for this deployment"
              >
                Demo mode
              </span>
            )}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>

        {/* small helper class (no styled-jsx) */}
        <style>{`
          .btn-primary {
            background: ${PRIMARY};
            color: #fff;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
          }
        `}</style>
      </body>
    </html>
  );
}