"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Input";

type Resume = { id: string; title: string };
type Vacancy = { id: string; rawText: string; sourceType: string };

export function AnalyzeNewForm({
  resumes,
  vacancies,
}: {
  resumes: Resume[];
  vacancies: Vacancy[];
}) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState(resumes[0]?.id ?? "");
  const [vacancyId, setVacancyId] = useState(vacancies[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, vacancyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось выполнить анализ");
        return;
      }
      router.push(`/analysis/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="resumeId">Резюме</Label>
          <select
            id="resumeId"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:border-brand-mint focus:outline-none focus:ring-2 focus:ring-brand-mint/30"
          >
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="vacancyId">Вакансия</Label>
          <select
            id="vacancyId"
            value={vacancyId}
            onChange={(e) => setVacancyId(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:border-brand-mint focus:outline-none focus:ring-2 focus:ring-brand-mint/30"
          >
            {vacancies.map((vacancy) => (
              <option key={vacancy.id} value={vacancy.id}>
                {vacancy.rawText.slice(0, 60)}
                {vacancy.rawText.length > 60 ? "…" : ""}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Анализируем…" : "Проанализировать"}
        </Button>
      </form>
    </Card>
  );
}
