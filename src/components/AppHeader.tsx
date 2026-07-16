"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { tab: "resumes", href: "/dashboard", label: "Резюме" },
  { tab: "vacancies", href: "/dashboard?tab=vacancies", label: "Вакансии" },
  { tab: "adaptations", href: "/dashboard?tab=adaptations", label: "Адаптации", highlight: true },
];

export function AppHeader({ email }: { email: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = pathname === "/dashboard" ? (searchParams.get("tab") ?? "resumes") : null;

  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="shrink-0 text-lg font-semibold text-brand-dark">
            Hired.
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden truncate text-sm text-black/50 sm:inline">{email}</span>
            <Link href="/account" aria-label="Личный кабинет">
              <Button variant="ghost" className="!px-2.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 5.5h14M3 10h14M3 14.5h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
        <nav className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {NAV_LINKS.map((link) => {
            const active = currentTab === link.tab;
            if (link.highlight) {
              return (
                <Link
                  key={link.tab}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                    active
                      ? "bg-brand-mint text-white"
                      : "bg-brand-mint/15 text-brand-mint hover:bg-brand-mint/25"
                  }`}
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <Link
                key={link.tab}
                href={link.href}
                className={`px-2 py-2 font-medium ${
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
