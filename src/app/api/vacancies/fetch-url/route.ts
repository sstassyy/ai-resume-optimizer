import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { vacancyFetchUrlSchema } from "@/lib/validation";
import { fetchVacancyText } from "@/lib/vacancyFetcher";

export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = vacancyFetchUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const { text, success } = await fetchVacancyText(parsed.data.url);
  return NextResponse.json({ text, success });
}
