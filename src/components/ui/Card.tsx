export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
