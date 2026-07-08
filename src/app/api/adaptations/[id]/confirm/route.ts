import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { adaptationConfirmSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const adaptation = await db.adaptation.findUnique({
    where: { id },
    include: { resume: true, vacancy: true },
  });

  if (
    !adaptation ||
    adaptation.resume.userId !== session.userId ||
    adaptation.vacancy.userId !== session.userId
  ) {
    return NextResponse.json({ error: "Адаптация не найдена" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adaptationConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const newResume = await db.resume.create({
    data: {
      userId: session.userId,
      title: `${adaptation.resume.title} — адаптировано`,
      contentJson: JSON.stringify(parsed.data),
      parentResumeId: adaptation.resume.id,
      version: adaptation.resume.version + 1,
      vacancyId: adaptation.vacancy.id,
    },
  });

  return NextResponse.json(newResume, { status: 201 });
}
