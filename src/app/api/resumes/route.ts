import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { resumeBuilderSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const resumes = await db.resume.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(resumes);
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = resumeBuilderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const { title, sourceFileUrl, ...content } = parsed.data;

  const resume = await db.resume.create({
    data: {
      userId: session.userId,
      title,
      sourceFileUrl: sourceFileUrl ?? null,
      contentJson: JSON.stringify(content),
    },
  });

  return NextResponse.json(resume, { status: 201 });
}
