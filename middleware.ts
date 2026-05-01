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
  // In production: persianjazz.directkey.app → subdomain = "persianjazz"
  // In development: localhost (no subdomain)
  const host = req.headers.get('host') || hostname;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'directkey.app';

  let subdomain: string | null = null;
  if (host.endsWith(`.${rootDomain}`)) {
    subdomain = host.replace(`.${rootDomain}`, '');
  }

  // ── Agency subdomain → per-agency real-estate site ───────────────────────
  if (subdomain) {
    const url = req.nextUrl.clone();

    // Rewrite all subdomain traffic to /agency/[subdomain]/[...rest]
    // e.g. persianjazz.directkey.app/projects → /agency/persianjazz/projects
    //      persianjazz.directkey.app/          → /agency/persianjazz
    const rest = pathname === '/' ? '' : pathname;
    url.pathname = `/agency/${subdomain}${rest}`;

    const res = NextResponse.rewrite(url);
    // Pass subdomain as header so server components can read it
    res.headers.set('x-subdomain', subdomain);
    return res;
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
