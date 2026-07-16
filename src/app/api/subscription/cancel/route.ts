import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const latest = await db.subscription.findFirst({
    where: { userId: session.userId, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  await db.$transaction([
    db.user.update({
      where: { id: session.userId },
      data: { plan: "free", planRenewsAt: null },
    }),
    ...(latest
      ? [
          db.subscription.update({
            where: { id: latest.id },
            data: { status: "canceled" },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ plan: "free" });
}
