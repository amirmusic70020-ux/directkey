import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';

const locales = ['en', 'tr', 'fa', 'ar', 'zh', 'ru'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : 'en';
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
