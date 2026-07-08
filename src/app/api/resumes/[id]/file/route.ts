import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { readStoredFile } from "@/lib/fileStorage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const resume = await db.resume.findUnique({ where: { id } });

  if (!resume || resume.userId !== session.userId || !resume.sourceFileUrl) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  const buffer = await readStoredFile(resume.sourceFileUrl);
  const contentType = resume.sourceFileUrl.endsWith(".pdf")
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${resume.title}"`,
    },
  });
}
