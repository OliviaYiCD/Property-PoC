// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import Script from "next/script";
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
          {/* Top Nav */}
          <header className="sticky top-0 z-20 border-b bg-white shadow-sm">
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
              {/* Left: Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500">
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="text-lg font-semibold tracking-tight">UnityLite</span>
              </div>

              {/* Center: Links */}
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
                <Link href="/" className="hover:text-[#cc3369]">Home</Link>
                <Link href="/property" className="hover:text-[#cc3369]">Property</Link>
                <Link href="/company" className="hover:text-[#cc3369]">Company</Link>
                <Link href="/voi" className="hover:text-[#cc3369]">VOI/AML</Link>
                <Link href="/digisign" className="hover:text-[#cc3369]">DigiSign</Link>
                <Link href="/orders" className="hover:text-[#cc3369]">Orders</Link>
              </div>

              {/* Right: Search + Help + Auth */}
              <div className="flex items-center gap-3">
                {/* Search Box */}
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

                {/* Help Icon */}
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

                {/* Auth: Sign in or User menu */}
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
                </SignedIn>
              </div>
            </nav>
          </header>

          <main className="mx-auto w-full max-w-7xl px-6 py-6">{children}</main>

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