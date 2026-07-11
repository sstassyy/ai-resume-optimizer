import { Card } from "@/components/ui/Card";
import type { DiffSection } from "@/services/aiService";

// Renders a set of before/after field diffs as two-column cards. Shared by
// the adaptation review screen (AI-generated draft vs original) and the
// version comparison screen (any two saved resume versions) — same visual
// language for "what changed" everywhere in the app.
export function DiffSectionList({
  sections,
  heading = "Было / стало",
}: {
  sections: DiffSection[];
  heading?: string;
}) {
  if (sections.length === 0) return null;

  return (
    <Card className="space-y-4">
      <h2 className="text-sm font-medium text-brand-dark">{heading}</h2>
      {sections.map((section) => (
        <div key={section.label} className="space-y-2">
          <p className="text-xs font-medium text-black/50">{section.label}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-black/5 p-3 text-xs text-black/60">
              {section.before || "—"}
            </div>
            <div className="rounded-lg bg-brand-mint/10 p-3 text-xs text-brand-dark">
              {section.after || "—"}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}
