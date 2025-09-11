import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Property PoC",
};

const TEXT = "#333333";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "white",
          color: TEXT,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Nav Bar */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "white",
            borderBottom: "1px solid #eee",
          }}
        >
          <div
            style={{
              maxWidth: 960,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
            }}
          >
            <div style={{ fontWeight: 800 }}>Property PoC</div>
            <div style={{ display: "flex", gap: 16 }}>
              <Link href="/">Property</Link>
              <Link href="/voi">VOI + AML</Link>
              <Link href="/company">Company search</Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
