// Thin abstraction over the AI provider used for vacancy analysis, resume
// adaptation and ATS scoring. Release 2 (analysis) and Release 3 (adaptation)
// below are implemented with deterministic mock logic, not a real Claude call
// — but shaped exactly like a real call's output (structured content, added
// keywords, before/after diff) so the frontend won't need to change when the
// real Anthropic call (`claude-sonnet-4-6` via `/v1/messages`) replaces these
// internals. ATS scoring (Release 4) is still a stub.

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

export type DiffSection = {
  label: string;
  before: string;
  after: string;
};

export type AdaptationResult = {
  adaptedContent: ResumeContent;
  addedKeywords: string[];
  diff: DiffSection[];
};

export type AtsScoreResult = {
  score: number; // 0-100
  reasons: string[];
  recommendations: string[];
};

// Structured resume content as stored in Resume.contentJson. Every resume —
// whether typed into the builder or uploaded and parsed (src/lib/resumeParser.ts)
// — is normalized into this one shape, so there's no separate "flat text"
// branch anywhere downstream (analysis, adaptation, future ATS scoring).
export type ResumeExperienceEntry = {
  company?: string;
  role?: string;
  period?: string;
  description?: string;
};
export type ResumeEducationEntry = {
  institution?: string;
  degree?: string;
  period?: string;
};
export type ResumeContent = {
  fullName?: string;
  contacts?: { email?: string; phone?: string };
  skills?: string[];
  experience?: ResumeExperienceEntry[];
  education?: ResumeEducationEntry[];
} | null;

const SPLIT_PATTERN = /[,;\n.:]+|\s+и\s+/gi;
const MIN_PHRASE_LENGTH = 3;
const MAX_PHRASE_LENGTH = 80;
const MAX_REQUIREMENTS = 12;
const MAX_KEYWORDS_TO_ADD = 5;

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
  return 20;
}

function educationScore(resumeContent: ResumeContent): number {
  if (Array.isArray(resumeContent?.education) && resumeContent.education.length > 0) return 75;
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
  resumeContent: unknown,
  _vacancyText: string,
  matchAnalysis: MatchAnalysis
): Promise<AdaptationResult> {
  const original = resumeContent as ResumeContent;
  if (!original) {
    return { adaptedContent: original, addedKeywords: [], diff: [] };
  }

  const adapted: NonNullable<ResumeContent> = JSON.parse(JSON.stringify(original));
  const diff: DiffSection[] = [];
  const addedKeywords: string[] = [];
  const matchedLower = new Set(matchAnalysis.matchedSkills.map((s) => s.toLowerCase()));

  // Reorder skills so ones matched against the vacancy come first — pure
  // reshuffling of what's already on the resume, nothing invented.
  const originalSkills = adapted.skills ?? [];
  if (originalSkills.length > 0) {
    const prioritized = [...originalSkills].sort((a, b) => {
      const aMatched = matchedLower.has(a.toLowerCase()) ? 0 : 1;
      const bMatched = matchedLower.has(b.toLowerCase()) ? 0 : 1;
      return aMatched - bMatched;
    });
    if (prioritized.join("|") !== originalSkills.join("|")) {
      diff.push({
        label: "Навыки",
        before: originalSkills.join(", "),
        after: prioritized.join(", "),
      });
      adapted.skills = prioritized;
    }
  }

  // Make sure the most recent experience entry explicitly names matched
  // skills it doesn't already mention — only skills confirmed present
  // elsewhere on the resume (matchAnalysis.matchedSkills), never invented.
  const experience = adapted.experience ?? [];
  if (experience.length > 0) {
    const entry = experience[0];
    const before = entry.description ?? "";
    const descLower = before.toLowerCase();
    const keywordsToAdd = matchAnalysis.matchedSkills
      .filter((skill) => !descLower.includes(skill.toLowerCase()))
      .slice(0, MAX_KEYWORDS_TO_ADD);

    if (keywordsToAdd.length > 0) {
      const after = `${before}${before.trim() ? " " : ""}Применялись навыки: ${keywordsToAdd.join(", ")}.`;
      entry.description = after;
      const roleLabel = [entry.company, entry.role].filter(Boolean).join(" — ") || "Опыт работы";
      diff.push({ label: `Опыт: ${roleLabel}`, before, after });
      addedKeywords.push(...keywordsToAdd);
    }
  }

  return { adaptedContent: adapted, addedKeywords, diff };
}

export async function scoreAts(_adaptedContent: unknown): Promise<AtsScoreResult> {
  throw new AiServiceNotImplementedError("Not implemented — Release 4");
}
