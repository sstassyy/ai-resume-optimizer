"use client";

import { useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ResumeFieldsForm,
  ResumeFieldsHandle,
  ResumeFieldsValue,
} from "@/components/ResumeFieldsForm";
import { ADAPTATION_DISCLAIMER } from "@/services/aiService";

type DiffSection = { label: string; before: string; after: string };

export function AdaptationReviewForm({
  adaptationId,
  initialValue,
  diffSections,
  addedKeywords,
}: {
  adaptationId: string;
  initialValue: ResumeFieldsValue;
  diffSections: DiffSection[];
  addedKeywords: string[];
}) {
  const router = useRouter();
  const fieldsRef = useRef<ResumeFieldsHandle>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const value = fieldsRef.current!.getValue();
      const res = await fetch(`/api/adaptations/${adaptationId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить резюме");
        return;
      }
      router.push(`/adaptation/${adaptationId}/score`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {diffSections.length > 0 && (
        <Card className="space-y-4">
          <h2 className="text-sm font-medium text-brand-dark">Было / стало</h2>
          {diffSections.map((section) => (
            <div key={section.label} className="space-y-2">
              <p className="text-xs font-medium text-black/50">{section.label}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-black/5 p-3 text-xs text-black/60">
                  {section.before || "—"}
                </div>
                <div className="rounded-lg bg-brand-mint/10 p-3 text-xs text-brand-dark">
                  {section.after || "—"}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {addedKeywords.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-medium text-brand-dark">Добавленные ключевые слова</h2>
          <div className="flex flex-wrap gap-2">
            {addedKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-brand-mint/15 px-3 py-1 text-xs font-medium text-brand-mint"
              >
                {keyword}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-medium text-brand-dark">
          Проверьте и отредактируйте перед сохранением
        </h2>
        <ResumeFieldsForm ref={fieldsRef} initialValue={initialValue} />
      </Card>

      <p className="text-xs text-black/40">{ADAPTATION_DISCLAIMER}</p>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Сохраняем…" : "Сохранить как новую версию"}
      </Button>
    </form>
  );
}
