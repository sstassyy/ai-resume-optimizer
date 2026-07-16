import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const vacancy = await db.vacancy.findUnique({ where: { id } });

  if (!vacancy || vacancy.userId !== session.userId) {
    return NextResponse.json({ error: "Вакансия не найдена" }, { status: 404 });
  }

  await db.vacancy.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
