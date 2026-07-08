import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  FileValidationError,
  saveUploadedFile,
  extractTextFromFile,
} from "@/lib/fileStorage";
import { parseResumeText } from "@/lib/resumeParser";

export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Нужен файл резюме" }, { status: 400 });
  }

  try {
    const { relativePath, buffer } = await saveUploadedFile(session.userId, file);
    const extractedText = await extractTextFromFile(file, buffer);
    const parsed = parseResumeText(extractedText);

    return NextResponse.json({ sourceFileUrl: relativePath, parsed });
  } catch (err) {
    if (err instanceof FileValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
