import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AnalyzeNewForm } from "@/components/AnalyzeNewForm";

export default async function NewAnalysisPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [resumes, vacancies] = await Promise.all([
    db.resume.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    db.vacancy.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, rawText: true, sourceType: true },
    }),
  ]);

  const missing = resumes.length === 0 || vacancies.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <BackButton />
        <h1 className="mb-1 text-2xl font-semibold text-brand-dark">Новая адаптация</h1>
        <p className="mb-6 text-sm text-black/50">
          Выберите резюме и вакансию, чтобы посмотреть, насколько они совпадают
        </p>

        {missing ? (
          <Card className="space-y-3 text-sm text-black/60">
            {resumes.length === 0 && (
              <p>
                Сначала добавьте резюме —{" "}
                <Link href="/resumes/new" className="text-brand-mint hover:underline">
                  создать резюме
                </Link>
                .
              </p>
            )}
            {vacancies.length === 0 && (
              <p>
                Сначала добавьте вакансию —{" "}
                <Link href="/vacancies/new" className="text-brand-mint hover:underline">
                  добавить вакансию
                </Link>
                .
              </p>
            )}
            <Link href="/dashboard">
              <Button variant="ghost">Вернуться на дашборд</Button>
            </Link>
          </Card>
        ) : (
          <AnalyzeNewForm resumes={resumes} vacancies={vacancies} />
        )}
      </main>
    </div>
  );
}
