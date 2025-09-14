// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import Sidebar from "./components/Sidebar";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

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
          {/* Google Maps JS + Places (for AddressField) */}
          <Script
            id="gmaps"
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places&v=weekly`}
            strategy="afterInteractive"
          />
        </head>
        <body style={{ background: BG, color: TEXT }}>
          {/* Shell: sidebar + content */}
          <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
            <Sidebar />

            {/* Right side: top bar + page content */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Top bar */}
              <header className="sticky top-0 z-20 border-b bg-white">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
                  {/* Breadcrumb / placeholder */}
                  <div className="text-sm text-gray-500">
                    {/* Keep space so layout feels polished */}
                  </div>

                  {/* Right: search + help + auth */}
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center rounded-md border bg-gray-50 px-2 py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4 text-gray-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search"
                        className="ml-2 bg-transparent text-sm outline-none"
                      />
                    </div>

                    <button className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 18h.01M12 14a4 4 0 10-4-4h0a4 4 0 004 4z"
                        />
                      </svg>
                    </button>

                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100">
                          Sign in
                        </button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <UserButton appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }} />
                    </SignedIn>
                  </div>
                </div>
              </header>

              {/* Page content */}
              <main className="mx-auto w-full max-w-7xl px-6 py-6">
                {children}
              </main>
            </div>
          </div>

          {/* helper class for primary buttons (kept from your original) */}
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