'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

import type { UserSummary } from '@/types/user';
import { getCurrentUser } from '@/lib/api/users';
import { createClient } from '@/lib/supabase/client';

type UserContextType = {
  user: UserSummary | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (isMounted) setUser(userData);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUser();
      } else {
        setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session && event === 'SIGNED_IN') {
          fetchUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      },
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, isAuthenticated: !!user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
