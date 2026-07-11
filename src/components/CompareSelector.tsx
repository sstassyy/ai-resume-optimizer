"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export type HistoryVersionItem = {
  id: string;
  version: number;
  createdAt: string;
  vacancyLabel?: string;
  atsScore?: number;
};

export function CompareSelector({ versions }: { versions: HistoryVersionItem[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  function onCompare() {
    if (selected.length !== 2) return;
    router.push(`/resumes/compare?a=${selected[0]}&b=${selected[1]}`);
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <div
          key={v.id}
          className="flex min-h-[44px] items-center gap-3 rounded-lg border border-black/10 px-3 py-2"
        >
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={selected.includes(v.id)}
              onChange={() => toggle(v.id)}
              className="h-5 w-5 shrink-0 accent-brand-mint"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-brand-dark">
                Версия {v.version}
                {v.atsScore !== undefined && (
                  <span className="ml-2 rounded-full bg-brand-mint/15 px-2 py-0.5 text-xs font-medium text-brand-mint">
                    ATS {v.atsScore}
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-black/50">
                {new Date(v.createdAt).toLocaleDateString("ru-RU")}
                {v.vacancyLabel ? ` · ${v.vacancyLabel}` : ""}
              </p>
            </div>
          </label>
          <Link
            href={`/resumes/${v.id}/export`}
            className="flex min-h-[44px] shrink-0 items-center px-2 text-xs font-medium text-brand-mint hover:underline"
          >
            Экспорт
          </Link>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        disabled={selected.length !== 2}
        onClick={onCompare}
        className="w-full"
      >
        Сравнить выбранные
      </Button>
    </div>
  );
}
