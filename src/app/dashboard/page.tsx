import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUsageStatus } from "@/lib/subscription";
import { groupResumesByLineage } from "@/lib/resumeLineage";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DeleteIconButton } from "@/components/DeleteIconButton";
import { CompareSelector, type HistoryVersionItem } from "@/components/CompareSelector";

type Tab = "resumes" | "vacancies" | "adaptations";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { tab: rawTab } = await searchParams;
  const tab: Tab = rawTab === "vacancies" || rawTab === "adaptations" ? rawTab : "resumes";

  const [resumes, vacancies, usage] = await Promise.all([
    db.resume.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    }),
    db.vacancy.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    }),
    getUsageStatus(user.userId),
  ]);

  const vacancyIds = [...new Set(resumes.map((r) => r.vacancyId).filter((id): id is string => !!id))];
  const adaptationIds = [
    ...new Set(resumes.map((r) => r.adaptationId).filter((id): id is string => !!id)),
  ];
  const [resumeVacancies, adaptations] = await Promise.all([
    vacancyIds.length
      ? db.vacancy.findMany({ where: { id: { in: vacancyIds } } })
      : Promise.resolve([]),
    adaptationIds.length
      ? db.adaptation.findMany({ where: { id: { in: adaptationIds } } })
      : Promise.resolve([]),
  ]);
  const vacancyById = new Map(resumeVacancies.map((v) => [v.id, v]));
  const adaptationById = new Map(adaptations.map((a) => [a.id, a]));

  const lineages = groupResumesByLineage(resumes);

  const roots = [...lineages.values()]
    .map((versions) => versions[0])
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const adaptationGroups = [...lineages.entries()]
    .map(([rootId, versions]) => {
      const items: HistoryVersionItem[] = versions.slice(1).map((v) => ({
        id: v.id,
        version: v.version,
        createdAt: v.createdAt.toISOString(),
        vacancyLabel: v.vacancyId ? vacancyById.get(v.vacancyId)?.rawText.slice(0, 40) : undefined,
        atsScore: v.adaptationId ? (adaptationById.get(v.adaptationId)?.atsScore ?? undefined) : undefined,
      }));
      return { rootId, title: versions[0].title, items };
    })
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.items[b.items.length - 1].createdAt.localeCompare(a.items[a.items.length - 1].createdAt));

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {usage.plan === "free" && (
          <Card className="mb-6 flex flex-col items-start justify-between gap-3 text-sm sm:flex-row sm:items-center">
            <p className="text-black/60">
              Бесплатный тариф: использовано {usage.used} из {usage.limit} адаптаций в
              этом месяце
            </p>
            <Link href="/account/upgrade" className="shrink-0 font-medium text-brand-mint hover:underline">
              Обновить тариф →
            </Link>
          </Card>
        )}

        {tab === "resumes" && (
          <section>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold text-brand-dark">Резюме</h1>
              <Link href="/resumes/new">
                <Button variant="secondary">+ Резюме</Button>
              </Link>
            </div>
            {roots.length === 0 ? (
              <Card className="text-sm text-black/50">
                Пока нет ни одного резюме.{" "}
                <Link href="/resumes/new" className="text-brand-mint hover:underline">
                  Добавьте первое
                </Link>
                .
              </Card>
            ) : (
              <div className="space-y-3">
                {roots.map((r) => (
                  <Card key={r.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-brand-dark">{r.title}</p>
                      <p className="mt-1 text-black/40">
                        {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center">
                      <Link
                        href={`/resumes/${r.id}/export`}
                        className="flex min-h-[44px] items-center px-2 text-xs font-medium text-brand-mint hover:underline"
                      >
                        Экспорт
                      </Link>
                      <DeleteIconButton
                        confirmMessage={`Удалить резюме «${r.title}»? Это действие необратимо.`}
                        deleteUrl={`/api/resumes/${r.id}`}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "vacancies" && (
          <section>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold text-brand-dark">Вакансии</h1>
              <Link href="/vacancies/new">
                <Button variant="secondary">+ Вакансия</Button>
              </Link>
            </div>
            {vacancies.length === 0 ? (
              <Card className="text-sm text-black/50">
                Пока нет ни одной вакансии.{" "}
                <Link href="/vacancies/new" className="text-brand-mint hover:underline">
                  Добавьте первую
                </Link>
                .
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {vacancies.map((vacancy) => (
                  <Card key={vacancy.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-medium text-brand-dark">
                        {vacancy.rawText}
                      </p>
                      <p className="mt-1 text-black/40">
                        Источник: {sourceLabel(vacancy.sourceType)} ·{" "}
                        {new Date(vacancy.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <DeleteIconButton
                      confirmMessage="Удалить эту вакансию? Это действие необратимо."
                      deleteUrl={`/api/vacancies/${vacancy.id}`}
                    />
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "adaptations" && (
          <section>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold text-brand-dark">Готовые адаптации</h1>
              <Link href="/analyze/new">
                <Button>Новая адаптация</Button>
              </Link>
            </div>
            {adaptationGroups.length === 0 ? (
              <Card className="text-sm text-black/50">
                Пока нет ни одной адаптации.{" "}
                <Link href="/analyze/new" className="text-brand-mint hover:underline">
                  Создайте первую
                </Link>
                .
              </Card>
            ) : (
              <div className="space-y-4">
                {adaptationGroups.map((g) => (
                  <Card key={g.rootId}>
                    <h2 className="mb-3 text-sm font-semibold text-brand-dark">{g.title}</h2>
                    <CompareSelector versions={g.items} />
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function sourceLabel(sourceType: string) {
  if (sourceType === "text") return "текст";
  if (sourceType === "file") return "файл";
  if (sourceType === "url") return "ссылка";
  return sourceType;
}
