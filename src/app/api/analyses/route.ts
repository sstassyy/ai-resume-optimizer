import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { analysisCreateSchema } from "@/lib/validation";
import { extractVacancyRequirements, analyzeVacancyMatch } from "@/services/aiService";

export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = analysisCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const [resume, vacancy] = await Promise.all([
    db.resume.findUnique({ where: { id: parsed.data.resumeId } }),
    db.vacancy.findUnique({ where: { id: parsed.data.vacancyId } }),
  ]);

  if (!resume || resume.userId !== session.userId) {
    return NextResponse.json({ error: "Резюме не найдено" }, { status: 404 });
  }
  if (!vacancy || vacancy.userId !== session.userId) {
    return NextResponse.json({ error: "Вакансия не найдена" }, { status: 404 });
  }

  const requirements = await extractVacancyRequirements(vacancy.rawText);
  await db.vacancy.update({
    where: { id: vacancy.id },
    data: { extractedRequirementsJson: JSON.stringify(requirements) },
  });

  const resumeContent = resume.contentJson ? JSON.parse(resume.contentJson) : null;
  const result = await analyzeVacancyMatch(resumeContent, vacancy.rawText, requirements);

  const analysis = await db.analysis.create({
    data: {
      resumeId: resume.id,
      vacancyId: vacancy.id,
      matchPercent: result.matchPercent,
      categoryScoresJson: JSON.stringify(result.categoryScores),
      matchedSkillsJson: JSON.stringify(result.matchedSkills),
      missingSkillsJson: JSON.stringify(result.missingSkills),
    },
  });

  return NextResponse.json(analysis, { status: 201 });
}
