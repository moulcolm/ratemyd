'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface Session {
  user: User | null;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Clear the session cache
      queryClient.setQueryData(['session'], { user: null });
      // Cancel any ongoing queries
      await queryClient.cancelQueries({ queryKey: ['session'] });
      // Clear all queries to avoid refetch issues
      queryClient.removeQueries();
      // Navigate to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even on error
      window.location.href = '/';
    }
  };

  return {
    data: session,
    status: isLoading ? 'loading' : session?.user ? 'authenticated' : 'unauthenticated',
    signOut,
  };
}
