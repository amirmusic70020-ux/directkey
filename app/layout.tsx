import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'DirectKey – AI Real Estate Sales Agent',
  description: 'SARA qualifies leads, answers questions, and books viewings automatically on WhatsApp — 24/7.',
};

// Root layout is intentionally minimal so that sub-layouts (locale, saas)
// can control their own <html> / <body> wrappers for lang/dir/fonts.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
