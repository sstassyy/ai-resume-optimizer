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
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res: Response;
      if (mode === "file") {
        if (!file) {
          setError("Выберите файл вакансии");
          return;
        }
        const formData = new FormData();
        formData.set("file", file);
        res = await fetch("/api/vacancies/upload", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/vacancies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceType: mode,
            rawText: mode === "text" ? text : url,
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить вакансию");
        return;
      }
      router.push("/dashboard");
      router.refresh();
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
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
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
          {mode === "url" && (
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Сохраняем…" : "Сохранить вакансию"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
