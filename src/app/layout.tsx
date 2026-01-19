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
