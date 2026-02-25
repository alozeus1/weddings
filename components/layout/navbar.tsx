"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { primaryRoutes } from "@/lib/content";

export function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gold-300/30 bg-ivory/85 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between lg:h-20">
        <Link href="/" className="font-display text-xl italic tracking-tight sm:text-2xl">
          Jessica &amp; Chibuike
        </Link>

        <div className="hidden items-center gap-10 lg:flex">
          <nav className="flex items-center gap-8">
            {primaryRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-xs font-medium uppercase tracking-[0.24em] text-ink transition",
                  pathname === route.href && "text-gold-600 underline decoration-gold-600 underline-offset-4"
                )}
                data-testid={`nav-${route.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {route.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/rsvp"
            className="rounded-full bg-gold-500 px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink shadow-soft"
          >
            RSVP
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex rounded-md border border-gold-300 p-2 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          <span className="text-sm font-semibold">Menu</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-gold-300/40 bg-ivory lg:hidden">
          <div className="container-shell flex flex-col py-4">
            {primaryRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "py-3 text-sm uppercase tracking-[0.22em]",
                  pathname === route.href ? "text-gold-600" : "text-ink"
                )}
                onClick={() => setOpen(false)}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
