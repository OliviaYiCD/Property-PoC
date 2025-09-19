// app/components/BannerCarousel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type BannerSlide = {
  eyebrow?: string;
  title: string;
  desc?: string;
  cta?: { label: string; href: string };
  /** Tailwind classes for the background color, e.g. "bg-indigo-600" */
  bg?: string;
};

export default function BannerCarousel({
  slides,
  intervalMs = 6000,
  className = "",
  compact = false,
}: {
  slides: BannerSlide[];
  /** Auto-advance interval in ms (default 6000) */
  intervalMs?: number;
  className?: string;
  /** Use smaller paddings / typography */
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovering = useRef<boolean>(false);

  // Auto-advance logic with hover pause
  useEffect(() => {
    if (hovering.current || slides.length === 0) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, slides.length, intervalMs]);

  const goTo = (i: number) => {
    if (slides.length === 0) return;
    setIndex(((i % slides.length) + slides.length) % slides.length);
  };

  // Render empty state safely
  if (slides.length === 0) {
    return (
      <div className={`rounded-2xl bg-neutral-200 p-6 ${className}`}>
        <div className="text-sm text-neutral-600">No announcements right now.</div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => {
        hovering.current = true;
        if (timer.current) clearTimeout(timer.current);
      }}
      onMouseLeave={() => {
        hovering.current = false;
        // trigger effect to resume timer
        setIndex((i) => i);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Announcements"
    >
      {/* Slides container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <section
            key={i}
            className="min-w-full"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={i !== index}
            role="group"
          >
            <div
              className={[
                s.bg || "bg-indigo-600",
                compact
                  ? "relative px-5 py-4 sm:px-6 sm:py-5 text-white"
                  : "relative px-5 py-6 sm:px-8 sm:py-8 text-white",
              ].join(" ")}
            >
              {/* subtle sheen */}
              <div className="pointer-events-none absolute inset-0 opacity-20">
                <div className="absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-white blur-3xl" />
                <div className="absolute right-10 bottom-0 h-28 w-28 rounded-full bg-white blur-2xl" />
              </div>

              <div className="relative flex items-center gap-6">
                <div className="flex-1">
                  {s.eyebrow && (
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest/relaxed opacity-80">
                      {s.eyebrow}
                    </div>
                  )}
                  <h3
                    className={
                      compact
                        ? "text-xl font-semibold"
                        : "text-2xl sm:text-3xl font-semibold leading-tight"
                    }
                  >
                    {s.title}
                  </h3>
                  {s.desc && (
                    <p
                      className={
                        compact
                          ? "mt-1 max-w-2xl text-sm/6 opacity-90"
                          : "mt-1 max-w-2xl text-sm/7 opacity-90"
                      }
                    >
                      {s.desc}
                    </p>
                  )}
                </div>

                {s.cta && (
                  <Link
                    href={s.cta.href}
                    className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow hover:opacity-90"
                  >
                    {s.cta.label}
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Dots (no arrows) */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 w-4 rounded-full transition-all ${
              i === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}