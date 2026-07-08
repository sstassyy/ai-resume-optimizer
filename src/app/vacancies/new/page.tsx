import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { VacancyNewForm } from "@/components/VacancyNewForm";

export default async function NewVacancyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-1 text-2xl font-semibold text-brand-dark">Новая вакансия</h1>
        <p className="mb-6 text-sm text-black/50">
          Вставьте текст вакансии, загрузите файл или укажите ссылку
        </p>
        <VacancyNewForm />
      </main>
    </div>
  );
}
