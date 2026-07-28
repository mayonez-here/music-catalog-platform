"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getStoredUser } from "@/lib/auth";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/search", label: "Search" },
  { href: "/library", label: "Library" },
  { href: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getStoredUser()?.username ?? null);
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/search" className="flex items-center gap-3 group">
          <span className="flex items-end gap-0.5 h-6">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-signature-gradient animate-pulse_bar"
                style={{ height: "100%", animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            SunnyPlays
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-signature-gradient-soft border border-white/10" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {username && (
            <span className="hidden sm:block text-sm text-muted">
              <span className="text-ink font-medium">{username}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm font-medium px-3 py-1.5 rounded-full border border-border text-muted hover:text-ink hover:border-white/20 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      <nav className="flex sm:hidden items-center gap-1 px-6 pb-3 -mt-1">
        {LINKS.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-sm rounded-full ${
                active ? "bg-signature-gradient-soft text-ink border border-white/10" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
