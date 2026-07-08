"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AppHeader({ email }: { email: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function onLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="text-lg font-semibold text-brand-dark">
          AI Resume Optimizer
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-black/50 sm:inline">{email}</span>
          <Button variant="ghost" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? "Выходим…" : "Выйти"}
          </Button>
        </div>
      </div>
    </header>
  );
}
