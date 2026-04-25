import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DirectKey - Properties in Turkey',
  description: 'Find your dream property in Turkey. Premium real estate for international buyers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
