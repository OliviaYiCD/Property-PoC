// app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

/* Icons */
function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth={2}
         className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICONS = {
  home: "M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V9.75z",
  property: "M3 4.5h18m-18 6.75h18m-18 6.75h18",
  company: "M3.75 21h16.5M4.5 3h15v18H4.5V3z",
  user: "M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a8.25 8.25 0 1115 0H4.5z",
  plus: "M12 4.5v15m7.5-7.5h-15",
  mail: "M3.75 6.75h16.5v10.5H3.75V6.75zM3.75 6.75l8.25 5.25 8.25-5.25",
  doc: "M7.5 3.75h6l3 3v12.75A.75.75 0 0115.75 20h-8.5a.75.75 0 01-.75-.75V4.5a.75.75 0 01.75-.75z",
  chevronLeft: "M15 19l-7-7 7-7",
  chevronRight: "M9 5l7 7-7 7",
  pin: "M12 17.25l3-9h2.25M12 17.25l-3-9H6.75M12 17.25V21",
  pinFilled:
    "M12 21v-3.75l3-9h2.25L14.5 6.5l.75-2.75L12 5.5 8.75 3.75 9.5 6.5 6.75 8.25H9l3 9V21z",
};

/* Types */
type FlatItem = { href: string; label: string; d: string };

/* Nav registry */
const NAV_MAIN: FlatItem[] = [
  { href: "/", label: "Dashboard", d: ICONS.home },
  { href: "/property", label: "Property", d: ICONS.property },
  { href: "/company", label: "Company", d: ICONS.company },
];

const IND_GROUP = {
  label: "Individual",
  d: ICONS.user,
  children: [
    { href: "/voi", label: "VOI / AML", d: ICONS.doc },
    { href: "/individual/asic", label: "ASIC Search", d: ICONS.doc },
    { href: "/individual/afsa", label: "AFSA Bankruptcy", d: ICONS.doc },
  ] as FlatItem[],
};

const NAV_EXTRAS: FlatItem[] = [
  { href: "/digisign", label: "DigiSign", d: ICONS.plus },
  { href: "/orders", label: "Orders", d: ICONS.mail },
];

const CATALOG: FlatItem[] = [...NAV_MAIN, ...IND_GROUP.children, ...NAV_EXTRAS];

/* Favorites (localStorage) */
const FAV_KEY = "ul:favs:v1";
const loadFavs = (): string[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
};
const saveFavs = (v: string[]) => { try { localStorage.setItem(FAV_KEY, JSON.stringify(v)); } catch {} };

function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => setFavs(loadFavs()), []);
  const toggle = (href: string) =>
    setFavs(prev => {
      const next = prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href];
      saveFavs(next);
      return next;
    });
  return { favs, toggle };
}

/* Row */
function Row({
  item, active, isPinned, onTogglePin,
}: { item: FlatItem; active: boolean; isPinned: boolean; onTogglePin: (href: string) => void }) {
  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active ? "bg-rose-50 text-[#cc3369]" : "text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        <Icon d={item.d} />
        <span className="truncate">{item.label}</span>
      </Link>
      <button
        type="button"
        onClick={() => onTogglePin(item.href)}
        aria-label={isPinned ? "Unpin from favorites" : "Pin to favorites"}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-500 hover:bg-neutral-200"
      >
        <Icon d={isPinned ? ICONS.pinFilled : ICONS.pin} className="h-4 w-4" />
      </button>
    </div>
  );
}

/* Sidebar */
export default function Sidebar({
  isOpen = true,
  onClose,
  onOpen,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}) {
  const pathname = usePathname();
  const { favs, toggle } = useFavorites();

  const shouldOpenIndividual = useMemo(
    () => pathname.startsWith("/individual") || pathname === "/voi",
    [pathname]
  );
  const [openIndividual, setOpenIndividual] = useState<boolean>(shouldOpenIndividual);

  const favoriteItems: FlatItem[] = favs
    .map(h => CATALOG.find(i => i.href === h))
    .filter(Boolean) as FlatItem[];

  return (
    <>
      {/* FIXED edge toggle — always visible */}
      <button
        type="button"
        onClick={() => (isOpen ? onClose?.() : onOpen?.())}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="fixed left-9 top-[460px] z-50 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border bg-white shadow"
      >
        <Icon d={isOpen ? ICONS.chevronLeft : ICONS.chevronRight} className="h-4 w-4" />
      </button>

      <aside
        className={`fixed left-0 top-[56px] z-30 h-[calc(100vh-56px)] w-56 overflow-y-auto border-r border-neutral-200 bg-white p-4 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar"
      >
        <nav className="mt-2 flex flex-col gap-3">
          {/* Favorites */}
          {favoriteItems.length > 0 && (
            <div>
              <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Favorites
              </div>
              <div className="flex flex-col gap-1">
                {favoriteItems.map(item => (
                  <Row
                    key={`fav-${item.href}`}
                    item={item}
                    active={pathname === item.href || pathname.startsWith(item.href + "/")}
                    isPinned={true}
                    onTogglePin={toggle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Main Menu */}
          <div>
            <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Main Menu
            </div>

            <div className="flex flex-col gap-1">
              {NAV_MAIN.map(item => (
                <Row
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  isPinned={favs.includes(item.href)}
                  onTogglePin={toggle}
                />
              ))}
            </div>

            {/* Individual group */}
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setOpenIndividual(o => !o)}
                aria-expanded={openIndividual}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith("/individual") || pathname === "/voi"
                    ? "bg-rose-50 text-[#cc3369]"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Icon d={IND_GROUP.d} />
                {IND_GROUP.label}
              </button>

              {openIndividual && (
                <div className="ml-8 mt-1 flex flex-col gap-1">
                  {IND_GROUP.children.map(sub => {
                    const active = pathname === sub.href || pathname.startsWith(sub.href + "/");
                    const pinned = favs.includes(sub.href);
                    return (
                      <div key={sub.href} className="relative">
                        <Link
                          href={sub.href}
                          className={`block rounded-lg px-3 py-1.5 text-sm ${
                            active ? "text-[#cc3369] font-medium" : "text-neutral-600 hover:bg-neutral-100"
                          }`}
                        >
                          {sub.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggle(sub.href)}
                          aria-label={pinned ? "Unpin from favorites" : "Pin to favorites"}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-500 hover:bg-neutral-200"
                        >
                          <Icon d={pinned ? ICONS.pinFilled : ICONS.pin} className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Extras */}
            <div className="mt-1 flex flex-col gap-1">
              {NAV_EXTRAS.map(item => (
                <Row
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  isPinned={favs.includes(item.href)}
                  onTogglePin={toggle}
                />
              ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}