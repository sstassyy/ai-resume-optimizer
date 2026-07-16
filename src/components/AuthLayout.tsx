import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-semibold text-brand-dark">
            Hired.
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-brand-dark">{title}</h1>
          <p className="mt-1 text-sm text-black/50">{subtitle}</p>
        </div>
        <Card>{children}</Card>
      </div>
    </div>
  );
}
