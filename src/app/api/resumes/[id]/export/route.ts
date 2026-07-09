import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { renderResumePdf } from "@/lib/pdfExport";
import { renderResumeDocx } from "@/lib/docxExport";
import type { ResumeContent } from "@/services/aiService";

function contentDisposition(title: string, extension: string): string {
  const asciiFallback = title.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "") || "resume";
  const encoded = encodeURIComponent(`${title}.${extension}`);
  return `attachment; filename="${asciiFallback}.${extension}"; filename*=UTF-8''${encoded}`;
}

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

  if (!resume || resume.userId !== session.userId) {
    return NextResponse.json({ error: "Резюме не найдено" }, { status: 404 });
  }
  if (!resume.contentJson) {
    return NextResponse.json(
      { error: "У этого резюме нет содержимого для экспорта" },
      { status: 422 }
    );
  }

  const content = JSON.parse(resume.contentJson) as NonNullable<ResumeContent>;
  const format = request.nextUrl.searchParams.get("format");

  if (format === "pdf") {
    const buffer = await renderResumePdf(content, resume.title);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition(resume.title, "pdf"),
      },
    });
  }

  if (format === "docx") {
    const buffer = await renderResumeDocx(content, resume.title);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": contentDisposition(resume.title, "docx"),
      },
    });
  }

  return NextResponse.json({ error: "Некорректный формат экспорта" }, { status: 400 });
}
