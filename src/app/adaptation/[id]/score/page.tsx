import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ATS_SCORE_DISCLAIMER } from "@/services/aiService";

export default async function AdaptationScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const adaptation = await db.adaptation.findUnique({
    where: { id },
    include: { resume: true, vacancy: true },
  });

  if (
    !adaptation ||
    adaptation.resume.userId !== user.userId ||
    adaptation.vacancy.userId !== user.userId ||
    adaptation.atsScore === null ||
    !adaptation.recommendationsJson
  ) {
    notFound();
  }

  const { factorScores, reasons, recommendations } = JSON.parse(adaptation.recommendationsJson) as {
    factorScores: { keywords: number; structure: number; density: number };
    reasons: string[];
    recommendations: string[];
  };

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-1 text-2xl font-semibold text-brand-dark">ATS Score</h1>
        <p className="mb-6 text-sm text-black/50">{adaptation.resume.title}</p>

        <Card className="mb-6 text-center">
          <p className="text-5xl font-semibold text-brand-mint">{adaptation.atsScore}</p>
          <p className="mt-1 text-sm text-black/50">из 100</p>
        </Card>

        <Card className="mb-6 space-y-4">
          <ProgressBar label="Ключевые слова" percent={factorScores.keywords} />
          <ProgressBar label="Структура резюме" percent={factorScores.structure} />
          <ProgressBar label="Плотность текста" percent={factorScores.density} />
        </Card>

        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-brand-dark">Почему такая оценка</h2>
          <ul className="space-y-1.5 text-sm text-black/60">
            {reasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-brand-dark">Рекомендации</h2>
          {recommendations.length === 0 ? (
            <p className="text-sm text-black/40">
              Рекомендаций нет — резюме хорошо оптимизировано.
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm text-black/60">
              {recommendations.map((rec) => (
                <li key={rec}>• {rec}</li>
              ))}
            </ul>
          )}
        </Card>

        <p className="mb-6 text-xs text-black/40">{ATS_SCORE_DISCLAIMER}</p>

        <Link href="/dashboard">
          <Button className="w-full">Готово</Button>
        </Link>
      </main>
    </div>
  );
}
