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

  return NextResponse.json(adaptation);
}
