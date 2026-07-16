"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-black/60 hover:text-brand-dark"
    >
      ← Назад
    </button>
  );
}
