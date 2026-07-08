import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

export class FileValidationError extends Error {}

export function validateUploadedFile(file: File) {
  if (!(file.type in ALLOWED_TYPES)) {
    throw new FileValidationError("Разрешены только файлы PDF и DOCX");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError("Файл слишком большой (максимум 5MB)");
  }
  if (file.size === 0) {
    throw new FileValidationError("Файл пустой");
  }
}

// Saves a validated file under uploads/<userId>/ with a random name (never trusts the
// original filename) and returns the path relative to UPLOADS_ROOT for DB storage.
export async function saveUploadedFile(
  userId: string,
  file: File
): Promise<{ relativePath: string; buffer: Buffer }> {
  validateUploadedFile(file);

  const userDir = path.join(UPLOADS_ROOT, userId);
  await mkdir(userDir, { recursive: true });

  const ext = ALLOWED_TYPES[file.type];
  const fileName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(userDir, fileName), buffer);

  return { relativePath: path.posix.join(userId, fileName), buffer };
}

export async function readStoredFile(relativePath: string): Promise<Buffer> {
  const resolved = path.join(UPLOADS_ROOT, relativePath);
  if (!resolved.startsWith(UPLOADS_ROOT)) {
    throw new FileValidationError("Некорректный путь к файлу");
  }
  return readFile(resolved);
}

export async function extractTextFromFile(
  file: File,
  buffer: Buffer
): Promise<string> {
  try {
    if (file.type === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text.trim();
    }
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch {
    return "";
  }
}
