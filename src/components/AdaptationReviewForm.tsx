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
import { DiffSectionList } from "@/components/DiffSectionList";
import { ADAPTATION_DISCLAIMER, type DiffSection } from "@/services/aiService";

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
      router.push(`/adaptation/${adaptationId}/score?resumeId=${data.resume.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <DiffSectionList sections={diffSections} />

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
