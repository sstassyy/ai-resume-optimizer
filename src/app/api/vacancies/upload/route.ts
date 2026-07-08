import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  FileValidationError,
  validateUploadedFile,
  extractTextFromFile,
} from "@/lib/fileStorage";

export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Нужен файл вакансии" }, { status: 400 });
  }

  try {
    validateUploadedFile(file);
  } catch (err) {
    if (err instanceof FileValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rawText = await extractTextFromFile(file, buffer);

  if (!rawText) {
    return NextResponse.json(
      { error: "Не удалось извлечь текст из файла" },
      { status: 422 }
    );
  }

  const vacancy = await db.vacancy.create({
    data: {
      userId: session.userId,
      sourceType: "file",
      rawText,
    },
  });

  return NextResponse.json(vacancy, { status: 201 });
}
