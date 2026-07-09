import { db } from "@/lib/db";
import {
  extractVacancyRequirements,
  analyzeVacancyMatch,
  type MatchAnalysis,
} from "@/services/aiService";

// Reuses the most recent Analysis row for this resume/vacancy pair if one
// exists (avoids recomputing what the user already saw on the Analysis
// screen); falls back to computing it fresh otherwise.
export async function getOrComputeMatchAnalysis(
  resumeId: string,
  vacancyId: string,
  resumeContent: unknown,
  vacancyRawText: string
): Promise<MatchAnalysis> {
  const latestAnalysis = await db.analysis.findFirst({
    where: { resumeId, vacancyId },
    orderBy: { createdAt: "desc" },
  });

  if (latestAnalysis) {
    return {
      matchPercent: latestAnalysis.matchPercent,
      categoryScores: JSON.parse(latestAnalysis.categoryScoresJson),
      matchedSkills: JSON.parse(latestAnalysis.matchedSkillsJson),
      missingSkills: JSON.parse(latestAnalysis.missingSkillsJson),
    };
  }

  const requirements = await extractVacancyRequirements(vacancyRawText);
  return analyzeVacancyMatch(resumeContent, vacancyRawText, requirements);
}
