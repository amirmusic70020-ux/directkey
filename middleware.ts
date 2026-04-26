import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'tr', 'fa', 'ar', 'zh', 'ru'],
  defaultLocale: 'en',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|\..*).*)'],
};
