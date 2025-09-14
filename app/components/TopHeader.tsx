"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function TopHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white">
      {/* Remove max-w-7xl and use px-6 for padding */}
      <div className="flex w-full items-center justify-between px-6 py-3">
        
        {/* Left: Text logo flush left */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-600 text-white font-bold">
            U
          </div>
          <span className="text-lg font-semibold text-neutral-800">UnityLite</span>
        </Link>

        {/* Right: Search + Sign-in */}
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