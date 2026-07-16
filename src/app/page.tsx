import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FREE_MONTHLY_ADAPTATION_LIMIT } from "@/lib/subscription";

const FEATURES = [
  {
    title: "Анализ вакансии",
    description: "Сравниваем ваше резюме с текстом вакансии и показываем, чего в нём не хватает.",
  },
  {
    title: "Адаптация резюме",
    description: "Переписываем формулировки под конкретную вакансию, не выдумывая новых фактов.",
  },
  {
    title: "ATS Score",
    description: "Прозрачная, фиксированная формула оценки — видно, из чего складывается балл.",
  },
  {
    title: "Экспорт в PDF и DOCX",
    description: "Готовый файл с корректной кириллицей — можно сразу отправлять работодателю.",
  },
  {
    title: "История версий и сравнение",
    description: "Все версии одного резюме в одном месте, с наглядным сравнением изменений.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <span className="text-lg font-semibold text-brand-dark">Hired.</span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/register">
              <Button>Начать бесплатно</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <section className="mb-20 text-center">
          <h1 className="text-4xl font-semibold text-brand-dark sm:text-5xl">
            Повышайте шанс получить приглашение на интервью
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-black/60">
            Адаптируем резюме под конкретную вакансию и показываем, насколько оно пройдёт
            автоматические фильтры — прозрачно, с разбором каждого балла.
          </p>
        </section>

        <section className="mb-20">
          <h2 className="mb-6 text-center text-2xl font-semibold text-brand-dark">
            Как это работает
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <h3 className="mb-2 text-sm font-semibold text-brand-dark">{f.title}</h3>
                <p className="text-sm text-black/60">{f.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-center text-2xl font-semibold text-brand-dark">Тарифы</h2>
          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="mb-1 text-sm font-semibold text-brand-dark">Бесплатный</h3>
              <p className="mb-4 text-2xl font-semibold text-brand-dark">0 ₽</p>
              <ul className="space-y-1.5 text-sm text-black/60">
                <li>• {FREE_MONTHLY_ADAPTATION_LIMIT} адаптации резюме в месяц</li>
                <li>• Анализ вакансий без ограничений</li>
                <li>• Экспорт в PDF/DOCX</li>
              </ul>
            </Card>
            <Card>
              <h3 className="mb-1 text-sm font-semibold text-brand-dark">Pro</h3>
              <p className="mb-4 text-2xl font-semibold text-brand-dark">
                990 ₽<span className="text-sm font-normal text-black/40">/мес</span>
              </p>
              <ul className="mb-4 space-y-1.5 text-sm text-black/60">
                <li>• Неограниченные адаптации резюме</li>
                <li>• Анализ вакансий без ограничений</li>
                <li>• Экспорт в PDF/DOCX</li>
              </ul>
              <Link href="/register">
                <Button className="w-full">Начать бесплатно</Button>
              </Link>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
