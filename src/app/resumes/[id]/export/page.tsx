import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ResumePreview } from "@/components/ResumePreview";
import type { ResumeContent } from "@/services/aiService";

export default async function ResumeExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const resume = await db.resume.findUnique({ where: { id } });

  if (!resume || resume.userId !== user.userId) {
    notFound();
  }

  const content = resume.contentJson
    ? (JSON.parse(resume.contentJson) as NonNullable<ResumeContent>)
    : null;

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <BackButton />
        <h1 className="mb-1 text-2xl font-semibold text-brand-dark">Экспорт резюме</h1>
        <p className="mb-6 text-sm text-black/50">{resume.title}</p>

        {!content ? (
          <Card className="text-sm text-black/50">
            У этого резюме пока нет содержимого для экспорта.
          </Card>
        ) : (
          <>
            <div className="mb-6 flex gap-3">
              <a href={`/api/resumes/${resume.id}/export?format=pdf`}>
                <Button>Скачать PDF</Button>
              </a>
              <a href={`/api/resumes/${resume.id}/export?format=docx`}>
                <Button variant="secondary">Скачать DOCX</Button>
              </a>
            </div>
            <ResumePreview content={content} title={resume.title} />
          </>
        )}
      </main>
    </div>
  );
}
