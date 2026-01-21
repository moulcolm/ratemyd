import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'RateMyD - Anonymous Ranking',
  description: 'Anonymous ranking and comparison platform with ELO system',
  keywords: ['ranking', 'comparison', 'anonymous', 'ELO'],
  other: {
    '6a97888e-site-verification': 'a4df3b4fdd5b13f0ca1fb8e6df622058',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen transition-colors duration-300`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
