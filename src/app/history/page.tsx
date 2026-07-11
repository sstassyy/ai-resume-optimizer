import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { CompareSelector, type HistoryVersionItem } from "@/components/CompareSelector";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resumes = await db.resume.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "asc" },
  });

  if (resumes.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <AppHeader email={user.email} />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
          <h1 className="mb-1 text-2xl font-semibold text-brand-dark">История версий</h1>
          <Card className="mt-6 text-sm text-black/50">
            Пока нет ни одного резюме.{" "}
            <Link href="/resumes/new" className="text-brand-mint hover:underline">
              Добавьте первое
            </Link>
            .
          </Card>
        </main>
      </div>
    );
  }

  const byId = new Map(resumes.map((r) => [r.id, r]));
  function findRootId(resume: (typeof resumes)[number]): string {
    let current = resume;
    while (current.parentResumeId) {
      const parent = byId.get(current.parentResumeId);
      if (!parent) break;
      current = parent;
    }
    return current.id;
  }

  const groups = new Map<string, typeof resumes>();
  for (const resume of resumes) {
    const rootId = findRootId(resume);
    const list = groups.get(rootId) ?? [];
    list.push(resume);
    groups.set(rootId, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.version - b.version);
  }

  const vacancyIds = [...new Set(resumes.map((r) => r.vacancyId).filter((id): id is string => !!id))];
  const adaptationIds = [
    ...new Set(resumes.map((r) => r.adaptationId).filter((id): id is string => !!id)),
  ];

  const [vacancies, adaptations] = await Promise.all([
    vacancyIds.length
      ? db.vacancy.findMany({ where: { id: { in: vacancyIds } } })
      : Promise.resolve([]),
    adaptationIds.length
      ? db.adaptation.findMany({ where: { id: { in: adaptationIds } } })
      : Promise.resolve([]),
  ]);
  const vacancyById = new Map(vacancies.map((v) => [v.id, v]));
  const adaptationById = new Map(adaptations.map((a) => [a.id, a]));

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-1 text-2xl font-semibold text-brand-dark">История версий</h1>
        <p className="mb-6 text-sm text-black/50">
          Выберите две версии одного резюме, чтобы сравнить их
        </p>

        <div className="space-y-6">
          {[...groups.entries()].map(([rootId, versions]) => {
            const root = byId.get(rootId)!;
            const items: HistoryVersionItem[] = versions.map((v) => ({
              id: v.id,
              version: v.version,
              createdAt: v.createdAt.toISOString(),
              vacancyLabel: v.vacancyId
                ? vacancyById.get(v.vacancyId)?.rawText.slice(0, 40)
                : undefined,
              atsScore: v.adaptationId
                ? (adaptationById.get(v.adaptationId)?.atsScore ?? undefined)
                : undefined,
            }));

            return (
              <Card key={rootId}>
                <h2 className="mb-3 text-sm font-semibold text-brand-dark">{root.title}</h2>
                <CompareSelector versions={items} />
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
