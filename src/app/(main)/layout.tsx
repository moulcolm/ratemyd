'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FullPageLoader } from '@/components/shared/LoadingSpinner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return <FullPageLoader />;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
