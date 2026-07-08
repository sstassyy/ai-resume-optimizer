// Heuristic "resume parsing" for uploaded PDF/DOCX files — regex/keyword based,
// not real NLP. Produces the same structured shape the manual builder produces
// (src/lib/validation.ts resumeBuilderSchema) so the rest of the app never has
// to special-case "resume came from a file". The user reviews/corrects the
// result before it's saved (src/components/ResumeNewForm.tsx), so imperfect
// splitting here is acceptable — nothing from the source text is dropped, at
// worst it lands in the wrong field's description.

export type ParsedExperienceEntry = {
  company: string;
  role: string;
  period: string;
  description: string;
};

export type ParsedEducationEntry = {
  institution: string;
  degree: string;
  period: string;
};

export type ParsedResumeContent = {
  fullName: string;
  contacts: { email: string; phone: string };
  experience: ParsedExperienceEntry[];
  education: ParsedEducationEntry[];
  skills: string[];
};

const EXPERIENCE_HEADER = /^(опыт\s*работы|опыт|experience|work experience)\s*:?\s*$/i;
const EDUCATION_HEADER = /^(образование|education)\s*:?\s*$/i;
const SKILLS_HEADER = /^(ключевые\s*навыки|навыки|skills)\s*:?\s*$/i;

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(\+?\d[\d\s\-()]{7,}\d)/;
// "Company — Role (period)" / "Company - Role (period)", loosely
const ENTRY_HEADER_RE = /^(.+?)\s*[—–-]\s*(.+?)\s*\(([^)]+)\)\s*$/;

type Section = "none" | "experience" | "education" | "skills";

function splitIntoParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (line.trim() === "") {
      if (current.length) paragraphs.push(current.join("\n"));
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length) paragraphs.push(current.join("\n"));
  return paragraphs;
}

function parseExperienceParagraph(paragraph: string): ParsedExperienceEntry {
  const lines = paragraph.split("\n").map((l) => l.trim());
  const match = lines[0]?.match(ENTRY_HEADER_RE);
  if (match) {
    return {
      company: match[1].trim(),
      role: match[2].trim(),
      period: match[3].trim(),
      description: lines.slice(1).join(" ").trim(),
    };
  }
  return { company: "", role: "", period: "", description: paragraph.trim() };
}

function parseEducationParagraph(paragraph: string): ParsedEducationEntry {
  const lines = paragraph.split("\n").map((l) => l.trim());
  const match = lines[0]?.match(ENTRY_HEADER_RE);
  if (match) {
    return {
      institution: match[1].trim(),
      degree: match[2].trim(),
      period: match[3].trim(),
    };
  }
  return { institution: paragraph.replace(/\n/g, " ").trim(), degree: "", period: "" };
}

function parseSkills(block: string): string[] {
  const seen = new Set<string>();
  const skills: string[] = [];
  for (const raw of block.split(/[,;\n]+/)) {
    const skill = raw.trim();
    if (!skill) continue;
    const key = skill.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    skills.push(skill);
  }
  return skills;
}

function guessFullName(headerLines: string[]): string {
  for (const line of headerLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 60) continue;
    if (EMAIL_RE.test(trimmed) || PHONE_RE.test(trimmed)) continue;
    return trimmed;
  }
  return "";
}

export function parseResumeText(text: string): ParsedResumeContent {
  const lines = text.split("\n");

  const buckets: Record<Section, string[]> = {
    none: [],
    experience: [],
    education: [],
    skills: [],
  };

  let current: Section = "none";
  for (const line of lines) {
    const trimmed = line.trim();
    if (EXPERIENCE_HEADER.test(trimmed)) {
      current = "experience";
      continue;
    }
    if (EDUCATION_HEADER.test(trimmed)) {
      current = "education";
      continue;
    }
    if (SKILLS_HEADER.test(trimmed)) {
      current = "skills";
      continue;
    }
    buckets[current].push(line);
  }

  const emailMatch = text.match(EMAIL_RE);
  const phoneMatch = text.match(PHONE_RE);

  return {
    fullName: guessFullName(buckets.none),
    contacts: {
      email: emailMatch?.[0] ?? "",
      phone: phoneMatch?.[0]?.trim() ?? "",
    },
    experience: splitIntoParagraphs(buckets.experience).map(parseExperienceParagraph),
    education: splitIntoParagraphs(buckets.education).map(parseEducationParagraph),
    skills: parseSkills(buckets.skills.join("\n")),
  };
}
