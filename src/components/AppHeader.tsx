"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/dashboard", label: "Дашборд" },
  { href: "/history", label: "История" },
];

export function AppHeader({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function onLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="shrink-0 text-lg font-semibold text-brand-dark">
            <span className="sm:hidden">ARO</span>
            <span className="hidden sm:inline">AI Resume Optimizer</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden truncate text-sm text-black/50 sm:inline">{email}</span>
            <Button variant="ghost" onClick={onLogout} disabled={loggingOut}>
              {loggingOut ? "Выходим…" : "Выйти"}
            </Button>
          </div>
        </div>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-1 py-2 font-medium ${
                  active ? "text-brand-mint" : "text-black/60 hover:text-brand-dark"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
