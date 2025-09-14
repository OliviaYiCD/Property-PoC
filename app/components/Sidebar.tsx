"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function Icon({ d }: { d: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-5 w-5"
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
}: {
  href: string;
  label: string;
  d: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
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

export default function Sidebar() {
  const pathname = usePathname();
  const [openIndividual, setOpenIndividual] = useState(false);

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
    {
      label: "Individual",
      d: "M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a8.25 8.25 0 1115 0H4.5z",
      children: [
        { href: "/voi", label: "VOI / AML" },
        { href: "/individual/asic", label: "ASIC Search" },
        { href: "/individual/afsa", label: "AFSA Bankruptcy" },
      ],
    },
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
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-56 border-r border-neutral-200 bg-white p-4">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-white font-bold">
          D
        </div>
        <span className="text-lg font-semibold text-neutral-800">UnityLite</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {nav.map((item) =>
          item.children ? (
            <div key={item.label}>
              <button
                onClick={() => setOpenIndividual((o) => !o)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith("/individual")
                    ? "bg-rose-50 text-[#cc3369]"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Icon d={item.d} />
                {item.label}
              </button>
              {openIndividual && (
                <div className="ml-8 mt-1 flex flex-col gap-1">
                  {item.children.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`block rounded-lg px-3 py-1.5 text-sm ${
                        pathname === sub.href
                          ? "text-[#cc3369] font-medium"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              d={item.d}
              active={pathname === item.href}
            />
          )
        )}
      </nav>
    </aside>
  );
}