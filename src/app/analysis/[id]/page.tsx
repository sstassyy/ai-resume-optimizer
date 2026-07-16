import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AdaptButton } from "@/components/AdaptButton";
import { ANALYSIS_DISCLAIMER } from "@/services/aiService";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const analysis = await db.analysis.findUnique({
    where: { id },
    include: { resume: true, vacancy: true },
  });

  if (
    !analysis ||
    analysis.resume.userId !== user.userId ||
    analysis.vacancy.userId !== user.userId
  ) {
    notFound();
  }

  const categoryScores = JSON.parse(analysis.categoryScoresJson) as {
    skills: number;
    experience: number;
    education: number;
  };
  const matchedSkills = JSON.parse(analysis.matchedSkillsJson) as string[];
  const missingSkills = JSON.parse(analysis.missingSkillsJson) as string[];

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <BackButton />
        <h1 className="mb-1 text-2xl font-semibold text-brand-dark">
          Результаты анализа
        </h1>
        <p className="mb-6 text-sm text-black/50">
          {analysis.resume.title} · общее совпадение {analysis.matchPercent}%
        </p>

        <Card className="mb-6 space-y-4">
          <ProgressBar label="Навыки" percent={categoryScores.skills} />
          <ProgressBar label="Опыт" percent={categoryScores.experience} />
          <ProgressBar label="Образование" percent={categoryScores.education} />
        </Card>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-sm font-medium text-brand-dark">
              Есть в резюме и в вакансии
            </h2>
            {matchedSkills.length === 0 ? (
              <p className="text-sm text-black/40">Совпадений не найдено</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-brand-mint/15 px-3 py-1 text-xs font-medium text-brand-mint"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </Card>
          <Card>
            <h2 className="mb-3 text-sm font-medium text-brand-dark">
              Не хватает в резюме
            </h2>
            {missingSkills.length === 0 ? (
              <p className="text-sm text-black/40">Пробелов не найдено</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-black/15 px-3 py-1 text-xs font-medium text-black/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        <p className="mb-6 text-xs text-black/40">{ANALYSIS_DISCLAIMER}</p>

        <AdaptButton resumeId={analysis.resumeId} vacancyId={analysis.vacancyId} />
      </main>
    </div>
  );
}
