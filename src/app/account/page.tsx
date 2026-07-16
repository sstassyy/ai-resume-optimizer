import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUsageStatus } from "@/lib/subscription";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { LogoutButton } from "@/components/LogoutButton";
import { CancelSubscriptionButton } from "@/components/SubscriptionActions";

export default async function AccountPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const [user, usage] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId } }),
    getUsageStatus(session.userId),
  ]);
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-brand-dark">Личный кабинет</h1>

        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-brand-dark">Профиль</h2>
          <p className="text-sm text-black/60">{user.email}</p>
        </Card>

        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-brand-dark">Тариф</h2>
          {user.plan === "pro" ? (
            <>
              <p className="mb-3 text-sm text-black/60">
                Pro — активна до{" "}
                {user.planRenewsAt
                  ? new Date(user.planRenewsAt).toLocaleDateString("ru-RU")
                  : "—"}
              </p>
              <CancelSubscriptionButton />
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-black/60">
                Бесплатный тариф: использовано {usage.used} из {usage.limit} адаптаций в
                этом месяце
              </p>
              <Link href="/account/upgrade">
                <Button variant="secondary">Обновить тариф</Button>
              </Link>
            </>
          )}
        </Card>

        <Card className="mb-6">
          <h2 className="mb-4 text-sm font-medium text-brand-dark">Смена пароля</h2>
          <ChangePasswordForm />
        </Card>

        <Card>
          <LogoutButton />
          <div className="mt-4 border-t border-black/5 pt-4">
            <DeleteAccountButton />
          </div>
        </Card>
      </main>
    </div>
  );
}
