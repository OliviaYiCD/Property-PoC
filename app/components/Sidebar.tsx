"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

function Icon({ d }: { d: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function NavItem({
  href,
  label,
  d,
  active,
  onClick,
}: {
  href: string;
  label: string;
  d: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-rose-50 text-[#cc3369]"
          : "text-neutral-700 hover:bg-neutral-100"
      }`}
    >
      <Icon d={d} />
      {label}
    </Link>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
  onOpen,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const pathname = usePathname();

  const nav = [
    {
      href: "/",
      label: "Dashboard",
      d: "M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V9.75z",
    },
    {
      href: "/property",
      label: "Property",
      d: "M3 4.5h18m-18 6.75h18m-18 6.75h18",
    },
    {
      href: "/company",
      label: "Company",
      d: "M3.75 21h16.5M4.5 3h15v18H4.5V3z",
    },
  ] as const;

  const individual = {
    label: "Individual",
    d: "M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a8.25 8.25 0 1115 0H4.5z",
    children: [
      { href: "/voi", label: "VOI / AML" },
      { href: "/individual/asic", label: "ASIC Search" },
      { href: "/individual/afsa", label: "AFSA Bankruptcy" },
    ],
  } as const;

  const extras = [
    {
      href: "/digisign",
      label: "DigiSign",
      d: "M16.5 3.75v16.5m-9-16.5v16.5m-6-9h18",
    },
    {
      href: "/orders",
      label: "Orders",
      d: "M3.75 6.75h16.5v10.5H3.75V6.75zM3.75 6.75l8.25 5.25 8.25-5.25",
    },
  ] as const;

  const shouldOpenIndividual = useMemo(
    () => pathname.startsWith("/individual") || pathname === "/voi",
    [pathname]
  );
  const [openIndividual, setOpenIndividual] = useState<boolean>(
    shouldOpenIndividual
  );

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={[
          "fixed left-0 top-14 h-[calc(100vh-56px)] w-56 overflow-y-auto border-r border-neutral-200 bg-white p-4 z-50",
          "transform transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
      >
        {/* Collapse button (desktop only, fully inside) */}
        {isOpen && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Collapse sidebar"
            className="hidden md:flex absolute top-6 right-2 h-7 w-7
                       items-center justify-center rounded-full border bg-white shadow"
            title="Collapse"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              d={item.d}
              active={pathname === item.href}
              onClick={handleNavClick}
            />
          ))}

          {/* Individual group */}
          <div>
            <button
              type="button"
              onClick={() => setOpenIndividual((o) => !o)}
              aria-expanded={openIndividual}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith("/individual") || pathname === "/voi"
                  ? "bg-rose-50 text-[#cc3369]"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <Icon d={individual.d} />
              {individual.label}
            </button>

            {openIndividual && (
              <div className="ml-8 mt-1 flex flex-col gap-1">
                {individual.children.map((sub) => {
                  const active =
                    pathname === sub.href || pathname.startsWith(sub.href + "/");
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={handleNavClick}
                      className={`block rounded-lg px-3 py-1.5 text-sm ${
                        active
                          ? "text-[#cc3369] font-medium"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {extras.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              d={item.d}
              active={pathname === item.href}
              onClick={handleNavClick}
            />
          ))}
        </nav>
      </aside>

      {/* Floating open button (when collapsed on desktop) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Expand sidebar"
          className="hidden md:flex fixed left-2 top-16 z-40 h-7 w-7
                     items-center justify-center rounded-full border bg-white shadow"
          title="Expand"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </>
  );
}