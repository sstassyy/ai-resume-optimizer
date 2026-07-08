import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  FileValidationError,
  saveUploadedFile,
  extractTextFromFile,
} from "@/lib/fileStorage";

export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const title = formData?.get("title");

  if (!(file instanceof File) || typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { error: "Нужен файл и название резюме" },
      { status: 400 }
    );
  }

  try {
    const { relativePath, buffer } = await saveUploadedFile(session.userId, file);
    const extractedText = await extractTextFromFile(file, buffer);

    const resume = await db.resume.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        sourceFileUrl: relativePath,
        contentJson: extractedText
          ? JSON.stringify({ rawText: extractedText })
          : null,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (err) {
    if (err instanceof FileValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
