"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function AdaptButton({ resumeId, vacancyId }: { resumeId: string; vacancyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  async function onClick() {
    setError(null);
    setLimitReached(false);
    setLoading(true);
    try {
      const res = await fetch("/api/adaptations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, vacancyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось адаптировать резюме");
        setLimitReached(data.code === "LIMIT_REACHED");
        return;
      }
      router.push(`/adaptation/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={onClick} disabled={loading}>
        {loading ? "Адаптируем…" : "Адаптировать резюме"}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
          {limitReached && (
            <>
              {" "}
              <Link href="/account/upgrade" className="font-medium underline">
                Перейти на Pro →
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
