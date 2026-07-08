// Thin abstraction over the AI provider used for vacancy analysis, resume
// adaptation and ATS scoring. Release 2 (analysis) below is implemented with
// deterministic mock logic, not a real Claude call — good enough to exercise
// the full pipeline and the Analysis screen. Adaptation (Release 3) and ATS
// scoring (Release 4) are still stubs. Swapping in the real Anthropic call
// (`claude-sonnet-4-6` via `/v1/messages`) later only touches this file.

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

export const ANALYSIS_DISCLAIMER =
  "Анализ рассчитан по упрощённой модели и носит рекомендательный характер — " +
  "перепроверьте требования вакансии самостоятельно.";

export type ExtractedRequirements = {
  mustHave: string[];
  niceToHave: string[];
};

export type CategoryScores = {
  skills: number;
  experience: number;
  education: number;
};

export type MatchAnalysis = {
  matchPercent: number;
  categoryScores: CategoryScores;
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

// Structured resume content as stored in Resume.contentJson — either the
// builder's shape (skills/experience/education) or a bare extracted rawText
// for uploaded files.
type ResumeContent = {
  skills?: string[];
  experience?: { role?: string; description?: string }[];
  education?: { degree?: string; institution?: string }[];
  rawText?: string;
} | null;

const SPLIT_PATTERN = /[,;\n.:]+|\s+и\s+/gi;
const MIN_PHRASE_LENGTH = 3;
const MAX_PHRASE_LENGTH = 80;
const MAX_REQUIREMENTS = 12;

export async function extractVacancyRequirements(
  vacancyText: string
): Promise<ExtractedRequirements> {
  const seen = new Set<string>();
  const phrases: string[] = [];

  for (const raw of vacancyText.split(SPLIT_PATTERN)) {
    const phrase = raw.trim().replace(/^[-•*\d.)\s]+/, "");
    if (phrase.length < MIN_PHRASE_LENGTH || phrase.length > MAX_PHRASE_LENGTH) continue;
    const key = phrase.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    phrases.push(phrase);
    if (phrases.length >= MAX_REQUIREMENTS) break;
  }

  const splitIndex = Math.ceil(phrases.length * 0.6);
  return {
    mustHave: phrases.slice(0, splitIndex),
    niceToHave: phrases.slice(splitIndex),
  };
}

function buildResumeSearchText(resumeContent: ResumeContent): string {
  if (!resumeContent) return "";
  const parts: string[] = [];
  if (Array.isArray(resumeContent.skills)) parts.push(...resumeContent.skills);
  if (Array.isArray(resumeContent.experience)) {
    for (const entry of resumeContent.experience) {
      if (entry.role) parts.push(entry.role);
      if (entry.description) parts.push(entry.description);
    }
  }
  if (Array.isArray(resumeContent.education)) {
    for (const entry of resumeContent.education) {
      if (entry.degree) parts.push(entry.degree);
      if (entry.institution) parts.push(entry.institution);
    }
  }
  if (resumeContent.rawText) parts.push(resumeContent.rawText);
  return parts.join(" ").toLowerCase();
}

function requirementMatches(requirement: string, resumeText: string): boolean {
  const normalized = requirement.toLowerCase();
  if (resumeText.includes(normalized)) return true;
  const significantWords = normalized.split(/\s+/).filter((w) => w.length >= 4);
  return significantWords.some((word) => resumeText.includes(word));
}

function experienceScore(resumeContent: ResumeContent): number {
  if (Array.isArray(resumeContent?.experience) && resumeContent.experience.length > 0) return 75;
  if (typeof resumeContent?.rawText === "string" && resumeContent.rawText.length > 200) return 55;
  return 20;
}

function educationScore(resumeContent: ResumeContent): number {
  if (Array.isArray(resumeContent?.education) && resumeContent.education.length > 0) return 75;
  if (
    typeof resumeContent?.rawText === "string" &&
    /образован|университет|институт|диплом|degree|university|bachelor|master/i.test(
      resumeContent.rawText
    )
  ) {
    return 55;
  }
  return 20;
}

export async function analyzeVacancyMatch(
  resumeContent: unknown,
  _vacancyText: string,
  requirements: ExtractedRequirements
): Promise<MatchAnalysis> {
  const content = resumeContent as ResumeContent;
  const resumeText = buildResumeSearchText(content);
  const allRequirements = [...requirements.mustHave, ...requirements.niceToHave];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  for (const requirement of allRequirements) {
    if (requirementMatches(requirement, resumeText)) {
      matchedSkills.push(requirement);
    } else {
      missingSkills.push(requirement);
    }
  }

  const skillsScore =
    allRequirements.length === 0
      ? 0
      : Math.round((matchedSkills.length / allRequirements.length) * 100);

  const categoryScores: CategoryScores = {
    skills: skillsScore,
    experience: experienceScore(content),
    education: educationScore(content),
  };

  const matchPercent = Math.round(
    (categoryScores.skills + categoryScores.experience + categoryScores.education) / 3
  );

  return { matchPercent, categoryScores, matchedSkills, missingSkills };
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
