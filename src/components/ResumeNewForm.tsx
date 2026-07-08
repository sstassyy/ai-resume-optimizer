"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";

type ExperienceEntry = { company: string; role: string; period: string; description: string };
type EducationEntry = { institution: string; degree: string; period: string };

const emptyExperience: ExperienceEntry = { company: "", role: "", period: "", description: "" };
const emptyEducation: EducationEntry = { institution: "", degree: "", period: "" };

export function ResumeNewForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"upload" | "builder">("upload");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Upload tab state
  const [uploadTitle, setUploadTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Builder tab state
  const [title, setTitle] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState<ExperienceEntry[]>([emptyExperience]);
  const [education, setEducation] = useState<EducationEntry[]>([emptyEducation]);

  async function onUploadSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Выберите файл резюме");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("title", uploadTitle || file.name);
      formData.set("file", file);
      const res = await fetch("/api/resumes/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось загрузить файл");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onBuilderSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          fullName,
          contacts: { email, phone },
          experience,
          education,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить резюме");
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
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "upload" ? "bg-white text-brand-dark shadow-sm" : "text-black/50"
          }`}
        >
          Загрузить файл
        </button>
        <button
          type="button"
          onClick={() => setTab("builder")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "builder" ? "bg-white text-brand-dark shadow-sm" : "text-black/50"
          }`}
        >
          Заполнить пошагово
        </button>
      </div>

      <Card>
        {tab === "upload" ? (
          <form onSubmit={onUploadSubmit} className="space-y-4">
            <div>
              <Label htmlFor="uploadTitle">Название резюме</Label>
              <Input
                id="uploadTitle"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Например, Резюме — Frontend разработчик"
              />
            </div>
            <div>
              <Label htmlFor="file">Файл (PDF или DOCX, до 5MB)</Label>
              <input
                id="file"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-brand-dark file:mr-4 file:rounded-lg file:border-0 file:bg-brand-dark/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-dark hover:file:bg-brand-dark/15"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Загружаем…" : "Загрузить резюме"}
            </Button>
          </form>
        ) : (
          <form onSubmit={onBuilderSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Название резюме</Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например, Резюме — Frontend разработчик"
              />
            </div>
            <div>
              <Label htmlFor="fullName">ФИО</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Телефон</Label>
                <Input
                  id="contactPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Опыт работы</Label>
                <button
                  type="button"
                  onClick={() => setExperience([...experience, emptyExperience])}
                  className="text-xs font-medium text-brand-mint hover:underline"
                >
                  + Добавить место работы
                </button>
              </div>
              <div className="space-y-3">
                {experience.map((entry, i) => (
                  <div key={i} className="rounded-lg border border-black/10 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Компания"
                        value={entry.company}
                        onChange={(e) =>
                          setExperience(
                            experience.map((it, j) =>
                              j === i ? { ...it, company: e.target.value } : it
                            )
                          )
                        }
                      />
                      <Input
                        placeholder="Должность"
                        value={entry.role}
                        onChange={(e) =>
                          setExperience(
                            experience.map((it, j) =>
                              j === i ? { ...it, role: e.target.value } : it
                            )
                          )
                        }
                      />
                    </div>
                    <Input
                      className="mt-2"
                      placeholder="Период (например, 2022–2024)"
                      value={entry.period}
                      onChange={(e) =>
                        setExperience(
                          experience.map((it, j) =>
                            j === i ? { ...it, period: e.target.value } : it
                          )
                        )
                      }
                    />
                    <Textarea
                      className="mt-2"
                      rows={3}
                      placeholder="Обязанности и достижения"
                      value={entry.description}
                      onChange={(e) =>
                        setExperience(
                          experience.map((it, j) =>
                            j === i ? { ...it, description: e.target.value } : it
                          )
                        )
                      }
                    />
                    {experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setExperience(experience.filter((_, j) => j !== i))}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Образование</Label>
                <button
                  type="button"
                  onClick={() => setEducation([...education, emptyEducation])}
                  className="text-xs font-medium text-brand-mint hover:underline"
                >
                  + Добавить учебное заведение
                </button>
              </div>
              <div className="space-y-3">
                {education.map((entry, i) => (
                  <div key={i} className="rounded-lg border border-black/10 p-3">
                    <Input
                      placeholder="Учебное заведение"
                      value={entry.institution}
                      onChange={(e) =>
                        setEducation(
                          education.map((it, j) =>
                            j === i ? { ...it, institution: e.target.value } : it
                          )
                        )
                      }
                    />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Специальность/степень"
                        value={entry.degree}
                        onChange={(e) =>
                          setEducation(
                            education.map((it, j) =>
                              j === i ? { ...it, degree: e.target.value } : it
                            )
                          )
                        }
                      />
                      <Input
                        placeholder="Период"
                        value={entry.period}
                        onChange={(e) =>
                          setEducation(
                            education.map((it, j) =>
                              j === i ? { ...it, period: e.target.value } : it
                            )
                          )
                        }
                      />
                    </div>
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEducation(education.filter((_, j) => j !== i))}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Навыки (через запятую)</Label>
              <Textarea
                id="skills"
                rows={2}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, коммуникация"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Сохраняем…" : "Сохранить резюме"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
