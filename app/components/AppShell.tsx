"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !["/sign-in", "/sign-up"].includes(pathname);

  // Default: open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSidebarOpen(window.innerWidth >= 768);
    }
  }, []);

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#333] overflow-x-hidden">
      {/* Header (no hamburger / no toggle prop) */}
      <TopHeader />

      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
        />
      )}

      {/* Push content by header; only pad left when sidebar is open on md+ */}
      <main className={`pt-14 ${showSidebar && sidebarOpen ? "md:pl-56" : ""}`}>
        <div className="mx-auto w-full max-w-7xl px-6 py-6">{children}</div>
      </main>
    </div>
  );
}