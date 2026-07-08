import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { adaptationCreateSchema } from "@/lib/validation";
import {
  extractVacancyRequirements,
  analyzeVacancyMatch,
  adaptResume,
  type MatchAnalysis,
} from "@/services/aiService";

export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adaptationCreateSchema.safeParse(body);
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

  const resumeContent = resume.contentJson ? JSON.parse(resume.contentJson) : null;

  const latestAnalysis = await db.analysis.findFirst({
    where: { resumeId: resume.id, vacancyId: vacancy.id },
    orderBy: { createdAt: "desc" },
  });

  let matchAnalysis: MatchAnalysis;
  if (latestAnalysis) {
    matchAnalysis = {
      matchPercent: latestAnalysis.matchPercent,
      categoryScores: JSON.parse(latestAnalysis.categoryScoresJson),
      matchedSkills: JSON.parse(latestAnalysis.matchedSkillsJson),
      missingSkills: JSON.parse(latestAnalysis.missingSkillsJson),
    };
  } else {
    const requirements = await extractVacancyRequirements(vacancy.rawText);
    matchAnalysis = await analyzeVacancyMatch(resumeContent, vacancy.rawText, requirements);
  }

  const result = await adaptResume(resumeContent, vacancy.rawText, matchAnalysis);

  const adaptation = await db.adaptation.create({
    data: {
      resumeId: resume.id,
      vacancyId: vacancy.id,
      adaptedContentJson: JSON.stringify(result.adaptedContent),
      diffJson: JSON.stringify({ sections: result.diff, addedKeywords: result.addedKeywords }),
    },
  });

  return NextResponse.json(adaptation, { status: 201 });
}
