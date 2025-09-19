"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

// Tiny inline SVG mark so there's no external file to break.
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ulite-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4477" />
          <stop offset="100%" stopColor="#cc3369" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="26" height="26" rx="8" fill="url(#ulite-g)" />
      {/* U stroke (no font dependency) */}
      <path
        d="M8 7 v8 a6 6 0 0 0 12 0 V7"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function TopHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b bg-white">
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
        {/* Left: Logo (no hamburger) */}
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-lg font-semibold text-neutral-800">UnityLite</span>
        </Link>

        {/* Right: Search + Auth */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center rounded-md border bg-gray-50 px-2 py-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
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
  );
}