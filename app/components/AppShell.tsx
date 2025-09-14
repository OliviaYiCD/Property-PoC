"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const HEADER_H = 56; // keep in sync with TopHeader height
const SIDEBAR_W = 224; // 56 * 4 (Tailwind w-56)

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If you want the sidebar on *all* pages:
  const showSidebar = !["/sign-in", "/sign-up"].includes(pathname);
  // If you only wanted it on dashboard, you'd do: const showSidebar = pathname === "/";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar is fixed; we always render it (except auth pages) */}
      {showSidebar && <Sidebar />}

      {/* Main content: push right by sidebar width and down by header height */}
      <div
        className={
          showSidebar
            ? `ml-[${SIDEBAR_W}px] pt-[${HEADER_H}px]`
            : `pt-[${HEADER_H}px]`
        }
        // Tailwind doesn’t accept arbitrary calc inside string interpolation here,
        // so use the closest utilities:
        // -> Alternatively, comment the above and use this:
        // className={`${showSidebar ? "ml-56" : ""} pt-14`}
      >
        <main className="mx-auto w-full max-w-7xl px-6 py-6">{children}</main>
      </div>
    </div>
  );
}