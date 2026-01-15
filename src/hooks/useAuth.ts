'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    status: 'loading',
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data.user) {
          setAuthState({
            user: data.user,
            status: 'authenticated',
          });
        } else {
          setAuthState({
            user: null,
            status: 'unauthenticated',
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          user: null,
          status: 'unauthenticated',
        });
      }
    }

    checkAuth();
  }, []);

  return authState;
}
