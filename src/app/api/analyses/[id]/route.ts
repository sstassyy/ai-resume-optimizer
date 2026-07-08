import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const analysis = await db.analysis.findUnique({
    where: { id },
    include: { resume: true, vacancy: true },
  });

  if (
    !analysis ||
    analysis.resume.userId !== session.userId ||
    analysis.vacancy.userId !== session.userId
  ) {
    return NextResponse.json({ error: "Анализ не найден" }, { status: 404 });
  }

  return NextResponse.json(analysis);
}
