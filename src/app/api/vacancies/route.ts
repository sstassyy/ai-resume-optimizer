import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { vacancySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const vacancies = await db.vacancy.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vacancies);
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = vacancySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const vacancy = await db.vacancy.create({
    data: {
      userId: session.userId,
      sourceType: parsed.data.sourceType,
      rawText: parsed.data.rawText,
      sourceUrl: parsed.data.sourceType === "url" ? parsed.data.sourceUrl : null,
    },
  });

  return NextResponse.json(vacancy, { status: 201 });
}
