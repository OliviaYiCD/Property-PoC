// app/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/** ------------------------------
 *  MOCK DATA
 *  ------------------------------ */
type OrderType = "Property" | "VOI" | "AML" | "Company";
type OrderStatus = "In Progress" | "Completed" | "Needs Attention";

interface OrderRow {
  id: string;
  type: OrderType;
  status: OrderStatus;
  date: string;
  href: string;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  ago: string;
  href: string;
  icon?: string;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    title: "123 Maple Street, Anytown",
    subtitle: "Property Search",
    ago: "2 hours ago",
    href: "/",
    icon: "🏠",
  },
  {
    id: "a2",
    title: "Acme Corp",
    subtitle: "Company Due Diligence",
    ago: "1 day ago",
    href: "/company",
    icon: "🏢",
  },
  {
    id: "a3",
    title: "Client Verification – John Smith",
    subtitle: "VOI + AML Check",
    ago: "3 days ago",
    href: "/voi",
    icon: "🪪",
  },
];

const RECENT_ORDERS: OrderRow[] = [
  {
    id: "#LS-1024",
    type: "Property",
    status: "In Progress",
    date: "2025-03-10",
    href: "/",
  },
  {
    id: "#LS-1023",
    type: "Company",
    status: "Completed",
    date: "2025-03-09",
    href: "/company",
  },
  {
    id: "#LS-1022",
    type: "VOI",
    status: "Needs Attention",
    date: "2025-03-08",
    href: "/voi",
  },
  {
    id: "#LS-1021",
    type: "AML",
    status: "Completed",
    date: "2025-03-07",
    href: "/voi",
  },
];

const TRENDING = [
  { label: "Property Title Search", count: 124, href: "/" },
  { label: "Company Director Search", count: 89, href: "/company" },
  { label: "AML Individual Check", count: 72, href: "/voi" },
  { label: "Historical Title Search", count: 56, href: "/" },
];

const AU_STATES = [
  { value: "QLD", label: "QLD" },
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "SA", label: "SA" },
  { value: "WA", label: "WA" },
  { value: "TAS", label: "TAS" },
  { value: "ACT", label: "ACT" },
  { value: "NT", label: "NT" },
];

function statusChipClass(s: OrderStatus) {
  if (s === "Completed") return "bg-green-100 text-green-800";
  if (s === "Needs Attention") return "bg-yellow-100 text-yellow-900";
  return "bg-blue-100 text-blue-800";
}

/** ------------------------------
 *  PAGE
 *  ------------------------------ */
export default function DashboardPage() {
  const metrics = useMemo(() => {
    const inProgress =
      RECENT_ORDERS.filter((o) => o.status === "In Progress").length + 12;
    const completed =
      RECENT_ORDERS.filter((o) => o.status === "Completed").length + 5;
    const needsAttention =
      RECENT_ORDERS.filter((o) => o.status === "Needs Attention").length + 2;
    return { inProgress, completed, needsAttention };
  }, []);

  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search:", { query, state: stateFilter });
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
      <h1 className="text-2xl font-semibold">Welcome back!</h1>
  <p className="text-sm text-neutral-600">
    You have <b>{metrics.inProgress}</b> active orders and{" "}
    <b>{metrics.needsAttention}</b> needing attention.
  </p>
      </div>

      {/* Search bar with state dropdown */}
      <section className="card">
      <div>
        <h1 className="text-2xl font-semibold">Property Search</h1>
        <p className="text-sm text-neutral-600">
          Search for properties using address, title reference, or lot/plan.
        </p>
      </div>
        <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
          <div className="md:w-40">
            <label htmlFor="state" className="sr-only">
              State
            </label>
            <select
              id="state"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#cc3369]"
            >
              {AU_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter address, title reference, or lot/plan"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#cc3369]"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-[#cc3369] px-4 py-2 text-white hover:opacity-90"
          >
            Search
          </button>
        </form>
      </section>

      {/* Order Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardStat
          title="In Progress"
          value={metrics.inProgress}
          help="Searches being processed"
        />
        <CardStat title="Completed" value={metrics.completed} help="Finished this week" />
        <CardStat
          title="Needs Attention"
          value={metrics.needsAttention}
          help="Requires your input"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card">
            <SectionHeader title="Recent Activity" link={{ href: "/", label: "View All" }} />
            <ul className="mt-3 divide-y divide-neutral-200">
              {RECENT_ACTIVITY.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <div className="text-xl">{a.icon ?? "•"}</div>
                  <div className="flex-1">
                    <Link href={a.href} className="block font-medium hover:underline">
                      {a.title}
                    </Link>
                    <p className="text-sm text-neutral-600">
                      {a.subtitle} • {a.ago}
                    </p>
                  </div>
                  <Link href={a.href} className="text-sm text-[#cc3369] hover:underline">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <SectionHeader title="Recent Orders" />
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-neutral-500">
                  <tr>
                    <th className="px-2 py-2">Order ID</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {RECENT_ORDERS.map((o) => (
                    <tr key={o.id}>
                      <td className="px-2 py-3 font-medium">{o.id}</td>
                      <td className="px-2 py-3">{o.type}</td>
                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs ${statusChipClass(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-2 py-3">{o.date}</td>
                      <td className="px-2 py-3 text-right">
                        <Link href={o.href} className="text-[#cc3369] hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card">
            <SectionHeader title="Notifications" />
            <ul className="mt-3 space-y-2 text-sm">
              <li className="rounded-lg bg-yellow-50 p-3 text-yellow-900">
                2 VOI verifications require manual review.{" "}
                <Link href="/voi/results" className="underline">
                  Review now
                </Link>
                .
              </li>
              <li className="rounded-lg bg-blue-50 p-3 text-blue-900">
                New: “VOI + AML Combo” package.{" "}
                <Link href="/voi" className="underline">
                  Start one
                </Link>
                .
              </li>
            </ul>
          </section>

          <section className="card">
            <SectionHeader title="Trending Searches" link={{ href: "/", label: "View Catalog" }} />
            <ul className="mt-3 divide-y divide-neutral-200">
              {TRENDING.map((t) => (
                <li key={t.label} className="flex justify-between py-3">
                  <Link href={t.href} className="hover:underline">
                    {t.label}
                  </Link>
                  <span className="text-sm text-neutral-500">{t.count}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Helpers */
function SectionHeader({
  title,
  link,
}: {
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      {link && (
        <Link href={link.href} className="text-sm text-[#cc3369] hover:underline">
          {link.label}
        </Link>
      )}
    </div>
  );
}

function CardStat({ title, value, help }: { title: string; value: number; help?: string }) {
  return (
    <div className="card">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
      {help && <div className="mt-1 text-xs text-neutral-500">{help}</div>}
    </div>
  );
}