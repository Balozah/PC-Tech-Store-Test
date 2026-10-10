import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy";

const intlMiddleware = createMiddleware(routing);

// Root-level files the app actually serves (app/icon.svg, robots.ts, sitemap.ts).
const ROOT_FILES = new Set(["/icon.svg", "/robots.txt", "/sitemap.xml"]);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Any other root-level "file" (/favicon.ico, /.env, /wp-login.php) would match
  // [locale] and crash its root layout with a 500, so answer 404 here.
  if (/^\/[^/]*\.[^/]*$/.test(pathname)) {
    return ROOT_FILES.has(pathname) ? NextResponse.next() : new NextResponse(null, { status: 404 });
  }
  // Deeper paths with a dot (/ar/x.png) keep skipping the locale middleware.
  if (pathname.includes(".")) return NextResponse.next();

  if (pathname.startsWith("/dashboard")) {
    return updateSession(request);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel).*)"],
};
