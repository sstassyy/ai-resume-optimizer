import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/Card";
import { DiffSectionList } from "@/components/DiffSectionList";
import { diffResumeVersions } from "@/lib/resumeDiff";
import type { ResumeContent } from "@/services/aiService";

export default async function CompareResumesPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { a, b } = await searchParams;
  if (!a || !b) notFound();

  const [resumeA, resumeB] = await Promise.all([
    db.resume.findUnique({ where: { id: a } }),
    db.resume.findUnique({ where: { id: b } }),
  ]);

  if (
    !resumeA ||
    !resumeB ||
    resumeA.userId !== user.userId ||
    resumeB.userId !== user.userId
  ) {
    notFound();
  }

  const [older, newer] = resumeA.createdAt <= resumeB.createdAt ? [resumeA, resumeB] : [resumeB, resumeA];

  const [olderAdaptation, newerAdaptation] = await Promise.all([
    older.adaptationId ? db.adaptation.findUnique({ where: { id: older.adaptationId } }) : null,
    newer.adaptationId ? db.adaptation.findUnique({ where: { id: newer.adaptationId } }) : null,
  ]);

  const olderContent = older.contentJson
    ? (JSON.parse(older.contentJson) as NonNullable<ResumeContent>)
    : null;
  const newerContent = newer.contentJson
    ? (JSON.parse(newer.contentJson) as NonNullable<ResumeContent>)
    : null;

  const sections = diffResumeVersions(olderContent, newerContent);
  const scoreDelta =
    olderAdaptation?.atsScore != null && newerAdaptation?.atsScore != null
      ? newerAdaptation.atsScore - olderAdaptation.atsScore
      : null;

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <BackButton />
        <h1 className="mb-1 text-2xl font-semibold text-brand-dark">Сравнение версий</h1>
        <p className="mb-6 text-sm text-black/50">
          Версия {older.version} ({new Date(older.createdAt).toLocaleDateString("ru-RU")}) → Версия{" "}
          {newer.version} ({new Date(newer.createdAt).toLocaleDateString("ru-RU")})
        </p>

        {scoreDelta !== null && (
          <Card className="mb-6 text-center">
            <p className="text-sm text-black/50">Изменение ATS score</p>
            <p className="mt-1 text-3xl font-semibold text-brand-dark">
              {olderAdaptation!.atsScore} → {newerAdaptation!.atsScore}{" "}
              <span className={scoreDelta >= 0 ? "text-brand-mint" : "text-red-600"}>
                ({scoreDelta >= 0 ? "+" : ""}
                {scoreDelta})
              </span>
            </p>
          </Card>
        )}

        {sections.length === 0 ? (
          <Card className="text-sm text-black/50">Между этими версиями нет отличий.</Card>
        ) : (
          <DiffSectionList sections={sections} heading="Отличия" />
        )}
      </main>
    </div>
  );
}
