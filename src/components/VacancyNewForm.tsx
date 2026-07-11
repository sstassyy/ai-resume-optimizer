"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";

type Mode = "text" | "file" | "url";

const modeLabels: Record<Mode, string> = {
  text: "Текст",
  file: "Файл",
  url: "Ссылка",
};

export function VacancyNewForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // URL mode is two-step: enter a link, extract its text server-side, then
  // review/edit the extracted text before actually saving the vacancy.
  const [url, setUrl] = useState("");
  const [urlStep, setUrlStep] = useState<"input" | "preview">("input");
  const [extractedText, setExtractedText] = useState("");
  const [extractionFailed, setExtractionFailed] = useState(false);
  const [extracting, setExtracting] = useState(false);

  async function onExtractUrl() {
    setError(null);
    setExtracting(true);
    try {
      const res = await fetch("/api/vacancies/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось извлечь текст");
        return;
      }
      setExtractedText(data.text);
      setExtractionFailed(!data.success);
      setUrlStep("preview");
    } finally {
      setExtracting(false);
    }
  }

  async function saveVacancy(body: Record<string, string>) {
    const res = await fetch("/api/vacancies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Не удалось сохранить вакансию");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "url" && urlStep === "input") {
      if (!url.trim()) {
        setError("Введите ссылку на вакансию");
        return;
      }
      await onExtractUrl();
      return;
    }

    setLoading(true);
    try {
      if (mode === "file") {
        if (!file) {
          setError("Выберите файл вакансии");
          return;
        }
        const formData = new FormData();
        formData.set("file", file);
        const res = await fetch("/api/vacancies/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Не удалось сохранить вакансию");
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } else if (mode === "url") {
        if (!extractedText.trim()) {
          setError("Текст вакансии не может быть пустым");
          return;
        }
        await saveVacancy({ sourceType: "url", rawText: extractedText, sourceUrl: url });
      } else {
        await saveVacancy({ sourceType: "text", rawText: text });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 rounded-lg bg-black/5 p-1">
        {(Object.keys(modeLabels) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 min-h-[44px] rounded-md py-2 text-sm font-medium transition-colors ${
              mode === m ? "bg-white text-brand-dark shadow-sm" : "text-black/50"
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "text" && (
            <div>
              <Label htmlFor="vacancyText">Текст вакансии</Label>
              <Textarea
                id="vacancyText"
                rows={10}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Вставьте полный текст вакансии"
              />
            </div>
          )}

          {mode === "url" && urlStep === "input" && (
            <div>
              <Label htmlFor="vacancyUrl">Ссылка на вакансию</Label>
              <Input
                id="vacancyUrl"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/job/123"
              />
              <p className="mt-1.5 text-xs text-black/40">
                Мы попробуем автоматически извлечь текст вакансии со страницы —
                вы сможете проверить и поправить его перед сохранением.
              </p>
            </div>
          )}

          {mode === "url" && urlStep === "preview" && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="vacancyExtracted">Текст вакансии</Label>
                <button
                  type="button"
                  onClick={() => setUrlStep("input")}
                  className="inline-flex min-h-[44px] items-center text-xs font-medium text-brand-mint hover:underline"
                >
                  ← Изменить ссылку
                </button>
              </div>
              {extractionFailed && (
                <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Не удалось автоматически извлечь текст со страницы. Вставьте
                  его вручную ниже.
                </p>
              )}
              <Textarea
                id="vacancyExtracted"
                rows={10}
                required
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Вставьте текст вакансии вручную"
              />
            </div>
          )}

          {mode === "file" && (
            <div>
              <Label htmlFor="vacancyFile">Файл (PDF или DOCX, до 5MB)</Label>
              <input
                id="vacancyFile"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-brand-dark file:mr-4 file:rounded-lg file:border-0 file:bg-brand-dark/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-dark hover:file:bg-brand-dark/15"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading || extracting}>
            {mode === "url" && urlStep === "input"
              ? extracting
                ? "Извлекаем текст…"
                : "Извлечь текст"
              : loading
                ? "Сохраняем…"
                : "Сохранить вакансию"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
