import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const locales = ['en', 'tr', 'fa', 'ar', 'zh', 'ru'];
const defaultLocale = 'en';

const intlMiddleware = createIntlMiddleware({ locales, defaultLocale });

// Paths that should skip ALL middleware (static assets, API routes, Next internals)
const SKIP_PATTERNS = /^\/(api|_next|_vercel|favicon\.ico|.*\..+)/;

// Paths that belong to the SaaS dashboard (no intl processing)
const SAAS_PATHS = /^\/(login|register|dashboard|privacy|terms)(\/|$)|^\/$/;

export function middleware(req: NextRequest) {
  const { hostname, pathname } = req.nextUrl;

  // ── Skip static / API / Next internals ──────────────────────────────────
  if (SKIP_PATTERNS.test(pathname)) return NextResponse.next();

  // ── Subdomain detection ──────────────────────────────────────────────────
  // In production: remax.directkey.app → subdomain = "remax"
  // In development: localhost (no subdomain)
  const host = req.headers.get('host') || hostname;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'directkey.app';

  let subdomain: string | null = null;
  if (host.endsWith(`.${rootDomain}`)) {
    subdomain = host.replace(`.${rootDomain}`, '');
  }

  // ── Agency subdomain → real-estate site (locale routing) ────────────────
  if (subdomain) {
    // Rewrite all subdomain traffic to /en/* (the real-estate site)
    // preserving the path so subdomain.directkey.app/projects works
    const url = req.nextUrl.clone();
    // If path is just "/" go to /en
    if (pathname === '/') {
      url.pathname = '/en';
      return NextResponse.rewrite(url);
    }
    // If not already under a locale, prepend /en
    const firstSegment = pathname.split('/')[1];
    if (!locales.includes(firstSegment)) {
      url.pathname = `/en${pathname}`;
      return NextResponse.rewrite(url);
    }
    // Already has locale — pass to intl middleware
    return intlMiddleware(req);
  }

  // ── Main domain: SaaS marketing + dashboard ──────────────────────────────
  // Routes like /, /login, /register, /dashboard → no intl processing
  if (SAAS_PATHS.test(pathname)) {
    return NextResponse.next();
  }

  // Everything else on main domain → intl middleware (for /en, /tr, etc.)
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|favicon\\.ico|.*\\..+).*)'],
};
