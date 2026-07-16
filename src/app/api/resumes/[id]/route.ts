import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { deleteStoredFile } from "@/lib/fileStorage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const resume = await db.resume.findUnique({ where: { id } });

  if (!resume || resume.userId !== session.userId) {
    return NextResponse.json({ error: "Резюме не найдено" }, { status: 404 });
  }

  if (resume.sourceFileUrl) {
    await deleteStoredFile(resume.sourceFileUrl);
  }
  await db.resume.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
