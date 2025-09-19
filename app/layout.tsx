import "./globals.css";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import AppShell from "./components/AppShell";

export const metadata = {
  title: "Property PoC",
  description: "Playground",
};

const PRIMARY = "#cc3369";
const TEXT = "#333333";
const BG = "#ffffff";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            id="gmaps"
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places&v=weekly`}
            strategy="afterInteractive"
          />
        </head>
        <body style={{ background: BG, color: TEXT }}>
          <AppShell>{children}</AppShell>

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
    </ClerkProvider>
  );
}