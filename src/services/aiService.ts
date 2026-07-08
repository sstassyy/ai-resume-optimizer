// Thin abstraction over the AI provider used for vacancy analysis, resume
// adaptation and ATS scoring. Everything in this file is a stub for Release 1 —
// implementations land in Release 2 (analysis), Release 3 (adaptation) and
// Release 4 (ATS score), backed by Anthropic Claude (`claude-sonnet-4-6` via
// `/v1/messages`). Keeping all AI calls behind this module means swapping
// providers later only touches this file.

export class AiServiceNotImplementedError extends Error {}

// Non-negotiable instruction injected into every resume-adaptation system
// prompt: the model must never invent experience, skills or achievements that
// aren't already present in the user's source resume.
export const NO_FABRICATION_RULE =
  "Не придумывай факты, опыт, навыки или достижения, отсутствующие в исходном резюме пользователя. " +
  "Разрешено только переформулировать, структурировать и расставлять акценты на основе того, что пользователь действительно указал.";

export const ADAPTATION_DISCLAIMER =
  "Проверьте сгенерированный текст — AI мог неточно интерпретировать формулировки. " +
  "Ответственность за достоверность резюме несёт пользователь.";

export const ATS_SCORE_DISCLAIMER =
  "Оценка приблизительная и носит рекомендательный характер.";

export type ExtractedRequirements = {
  mustHave: string[];
  niceToHave: string[];
};

export type MatchAnalysis = {
  matchPercent: number;
  matchedSkills: string[];
  missingSkills: string[];
};

export type AdaptationResult = {
  adaptedContent: unknown; // structured resume content, same shape as Resume.contentJson
  diff: unknown; // before/after diff for the comparison screen
};

export type AtsScoreResult = {
  score: number; // 0-100
  reasons: string[];
  recommendations: string[];
};

export async function extractVacancyRequirements(
  _vacancyText: string
): Promise<ExtractedRequirements> {
  throw new AiServiceNotImplementedError("Not implemented — Release 2");
}

export async function analyzeVacancyMatch(
  _resumeContent: unknown,
  _vacancyText: string
): Promise<MatchAnalysis> {
  throw new AiServiceNotImplementedError("Not implemented — Release 2");
}

export async function adaptResume(
  _resumeContent: unknown,
  _vacancyText: string,
  _matchAnalysis: MatchAnalysis
): Promise<AdaptationResult> {
  throw new AiServiceNotImplementedError("Not implemented — Release 3");
}

export async function scoreAts(_adaptedContent: unknown): Promise<AtsScoreResult> {
  throw new AiServiceNotImplementedError("Not implemented — Release 4");
}
