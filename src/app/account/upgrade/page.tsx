import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { FREE_MONTHLY_ADAPTATION_LIMIT } from "@/lib/subscription";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/Card";
import { UpgradeButton } from "@/components/SubscriptionActions";

export default async function UpgradePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <BackButton />
        <h1 className="mb-1 text-2xl font-semibold text-brand-dark">Тарифы</h1>
        <p className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Тестовый режим — оплата не производится, платёжный провайдер пока не
          подключён.
        </p>

        {user.plan === "pro" ? (
          <Card className="text-sm text-black/60">У вас уже активен тариф Pro.</Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h2 className="mb-1 text-sm font-semibold text-brand-dark">Бесплатный</h2>
              <p className="mb-4 text-2xl font-semibold text-brand-dark">0 ₽</p>
              <ul className="space-y-1.5 text-sm text-black/60">
                <li>• {FREE_MONTHLY_ADAPTATION_LIMIT} адаптации резюме в месяц</li>
                <li>• Анализ вакансий без ограничений</li>
                <li>• Экспорт в PDF/DOCX</li>
              </ul>
            </Card>
            <Card>
              <h2 className="mb-1 text-sm font-semibold text-brand-dark">Pro</h2>
              <p className="mb-4 text-2xl font-semibold text-brand-dark">
                990 ₽<span className="text-sm font-normal text-black/40">/мес</span>
              </p>
              <ul className="mb-4 space-y-1.5 text-sm text-black/60">
                <li>• Неограниченные адаптации резюме</li>
                <li>• Анализ вакансий без ограничений</li>
                <li>• Экспорт в PDF/DOCX</li>
              </ul>
              <UpgradeButton />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
