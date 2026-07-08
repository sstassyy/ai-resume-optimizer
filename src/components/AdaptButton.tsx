"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AdaptButton({ resumeId, vacancyId }: { resumeId: string; vacancyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
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
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
