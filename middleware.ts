import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const locales = ['en', 'tr', 'fa', 'ar', 'zh', 'ru'];
const defaultLocale = 'en';

const intlMiddleware = createIntlMiddleware({ locales, d