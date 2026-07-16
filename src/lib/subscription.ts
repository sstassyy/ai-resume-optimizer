import { db } from "@/lib/db";

// Freemium gate: N free resume adaptations per calendar month, unlimited on
// "pro". Metered at adaptation creation (the core AI-driven action) rather
// than analysis or export.
export const FREE_MONTHLY_ADAPTATION_LIMIT = 3;

export type UsageStatus = {
  plan: string;
  used: number;
  limit: number | null; // null = unlimited
  remaining: number | null;
  isOverLimit: boolean;
};

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const user = await db.user.findUnique({ where: { id: userId } });
  const plan = user?.plan ?? "free";

  if (plan !== "free") {
    return { plan, used: 0, limit: null, remaining: null, isOverLimit: false };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const used = await db.adaptation.count({
    where: { resume: { userId }, createdAt: { gte: startOfMonth } },
  });

  return {
    plan,
    used,
    limit: FREE_MONTHLY_ADAPTATION_LIMIT,
    remaining: Math.max(0, FREE_MONTHLY_ADAPTATION_LIMIT - used),
    isOverLimit: used >= FREE_MONTHLY_ADAPTATION_LIMIT,
  };
}
