import { NextRequest, NextResponse } from "next/server";
import { verifySession, sessionCookieName } from "@/lib/auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/resumes",
  "/vacancies",
  "/analyze",
  "/analysis",
  "/adaptation",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(sessionCookieName)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resumes/:path*",
    "/vacancies/:path*",
    "/analyze/:path*",
    "/analysis/:path*",
    "/adaptation/:path*",
  ],
};
