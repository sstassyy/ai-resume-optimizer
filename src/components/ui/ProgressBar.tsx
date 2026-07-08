export function ProgressBar({ label, percent }: { label: string; percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-brand-dark">{label}</span>
        <span className="text-black/50">{clamped}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-brand-mint transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
