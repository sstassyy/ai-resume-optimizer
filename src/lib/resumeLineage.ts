import type { Resume } from "@/generated/prisma/client";

// Groups a flat list of resumes into "lineages" — every version descending
// from one root (a resume with parentResumeId = null) — by walking each
// row's parent pointer up to its root. Each group is sorted ascending by
// version. Shared by the Dashboard (shows only the latest per lineage) and
// History (shows every version) pages.
export function groupResumesByLineage<T extends Pick<Resume, "id" | "parentResumeId" | "version">>(
  resumes: T[]
): Map<string, T[]> {
  const byId = new Map(resumes.map((r) => [r.id, r]));

  function findRootId(resume: T): string {
    let current = resume;
    while (current.parentResumeId) {
      const parent = byId.get(current.parentResumeId);
      if (!parent) break;
      current = parent;
    }
    return current.id;
  }

  const groups = new Map<string, T[]>();
  for (const resume of resumes) {
    const rootId = findRootId(resume);
    const list = groups.get(rootId) ?? [];
    list.push(resume);
    groups.set(rootId, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.version - b.version);
  }

  return groups;
}
