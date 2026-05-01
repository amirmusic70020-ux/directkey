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
  const host = req.headers.get('host') || hostname;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'directkey.app';

  let subdomain: string | null = null;
  if (host.endsWith(`.${rootDomain}`)) {
    subdomain = host.replace(`.${rootDomain}`, '');
  }

  // ── Agency subdomain — rewrite to /en but pass subdomain via header ──────
  // We keep the [locale] layout so html/body structure is correct.
  if (subdomain) {
    const url = req.nextUrl.clone();
    if (pathname === '/') {
      url.pathname = '/en';
    } else {
      const firstSegment = pathname.split('/')[1];
      if (!locales.includes(firstSegment)) {
        url.pathname = `/en${pathname}`;
      }
    }
    const res = NextResponse.rewrite(url);
    res.headers.set('x-subdomain', subdomain);
    return res;
  }

  // ── Main domain: SaaS marketing + dashboard ──────────────────────────────
  if (SAAS_PATHS.test(pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|favicon\\.ico|.*\\..+).*)'],
};
