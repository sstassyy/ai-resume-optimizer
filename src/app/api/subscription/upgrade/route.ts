import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Stub activation — no real payment provider wired up yet (deferred per
// product decision). Never touches card data or moves real money; just
// flips the plan flag and records a Subscription row so the shape is ready
// for a real provider (YooKassa/etc.) to slot into later.
export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const currentPeriodEnd = new Date(Date.now() + THIRTY_DAYS_MS);

  await db.$transaction([
    db.user.update({
      where: { id: session.userId },
      data: { plan: "pro", planRenewsAt: currentPeriodEnd },
    }),
    db.subscription.create({
      data: {
        userId: session.userId,
        plan: "pro",
        status: "active",
        provider: "stub",
        currentPeriodEnd,
      },
    }),
  ]);

  return NextResponse.json({ plan: "pro", planRenewsAt: currentPeriodEnd });
}
