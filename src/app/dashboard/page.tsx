import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [resumes, vacancies] = await Promise.all([
    db.resume.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    }),
    db.vacancy.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-brand-dark">Дашборд</h1>
            <p className="mt-1 text-sm text-black/50">
              Ваши резюме и вакансии в одном месте
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/resumes/new">
              <Button variant="secondary">+ Резюме</Button>
            </Link>
            <Link href="/analyze/new">
              <Button>Новая адаптация</Button>
            </Link>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-3 text-lg font-medium text-brand-dark">Резюме</h2>
          {resumes.length === 0 ? (
            <Card className="text-sm text-black/50">
              Пока нет ни одного резюме.{" "}
              <Link href="/resumes/new" className="text-brand-mint hover:underline">
                Добавьте первое
              </Link>
              .
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {resumes.map((resume) => (
                <Card key={resume.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-brand-dark">{resume.title}</p>
                    <p className="mt-1 text-black/40">
                      Версия {resume.version} ·{" "}
                      {new Date(resume.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <Link
                    href={`/resumes/${resume.id}/export`}
                    className="flex min-h-[44px] shrink-0 items-center px-2 text-xs font-medium text-brand-mint hover:underline"
                  >
                    Экспорт
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-brand-dark">Вакансии</h2>
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
                <Card key={vacancy.id} className="text-sm">
                  <p className="line-clamp-2 font-medium text-brand-dark">
                    {vacancy.rawText}
                  </p>
                  <p className="mt-1 text-black/40">
                    Источник: {sourceLabel(vacancy.sourceType)} ·{" "}
                    {new Date(vacancy.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>
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
