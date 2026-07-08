"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Input, Textarea, Label } from "@/components/ui/Input";

export type ExperienceEntry = {
  company: string;
  role: string;
  period: string;
  description: string;
};
export type EducationEntry = { institution: string; degree: string; period: string };

export type ResumeFieldsValue = {
  fullName: string;
  contacts: { email: string; phone: string };
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
};

export type ResumeFieldsHandle = { getValue: () => ResumeFieldsValue };

const emptyExperience: ExperienceEntry = { company: "", role: "", period: "", description: "" };
const emptyEducation: EducationEntry = { institution: "", degree: "", period: "" };

// Shared editable resume fields — used by the manual builder, the post-upload
// parse review step, and the adaptation before/after review. Owns its own
// field state (seeded from initialValue) and exposes the current value via
// ref so each caller controls its own submit button/loading/error handling.
export const ResumeFieldsForm = forwardRef<ResumeFieldsHandle, { initialValue: ResumeFieldsValue }>(
  function ResumeFieldsForm({ initialValue }, ref) {
    const [fullName, setFullName] = useState(initialValue.fullName);
    const [email, setEmail] = useState(initialValue.contacts.email);
    const [phone, setPhone] = useState(initialValue.contacts.phone);
    const [experience, setExperience] = useState<ExperienceEntry[]>(
      initialValue.experience.length ? initialValue.experience : [emptyExperience]
    );
    const [education, setEducation] = useState<EducationEntry[]>(
      initialValue.education.length ? initialValue.education : [emptyEducation]
    );
    const [skillsText, setSkillsText] = useState(initialValue.skills.join(", "));

    useImperativeHandle(ref, () => ({
      getValue: () => ({
        fullName,
        contacts: { email, phone },
        experience,
        education,
        skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    }));

    return (
      <div className="space-y-6">
        <div>
          <Label htmlFor="fullName">ФИО</Label>
          <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
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
            <Input id="contactPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
                        experience.map((it, j) => (j === i ? { ...it, company: e.target.value } : it))
                      )
                    }
                  />
                  <Input
                    placeholder="Должность"
                    value={entry.role}
                    onChange={(e) =>
                      setExperience(
                        experience.map((it, j) => (j === i ? { ...it, role: e.target.value } : it))
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
                      experience.map((it, j) => (j === i ? { ...it, period: e.target.value } : it))
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
                      experience.map((it, j) => (j === i ? { ...it, description: e.target.value } : it))
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
                      education.map((it, j) => (j === i ? { ...it, institution: e.target.value } : it))
                    )
                  }
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Специальность/степень"
                    value={entry.degree}
                    onChange={(e) =>
                      setEducation(
                        education.map((it, j) => (j === i ? { ...it, degree: e.target.value } : it))
                      )
                    }
                  />
                  <Input
                    placeholder="Период"
                    value={entry.period}
                    onChange={(e) =>
                      setEducation(
                        education.map((it, j) => (j === i ? { ...it, period: e.target.value } : it))
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
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="React, TypeScript, коммуникация"
          />
        </div>
      </div>
    );
  }
);
