"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteIconButton({
  confirmMessage,
  deleteUrl,
}: {
  confirmMessage: string;
  deleteUrl: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(deleteUrl, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Удалить"
      className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-lg leading-none text-black/30 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      ×
    </button>
  );
}
