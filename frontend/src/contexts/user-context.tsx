'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from 'react';

import type { UserSummary } from '@/types/user';
import { getCurrentUser } from '@/lib/api/users';
import { createClient } from '@/lib/supabase/client';

type UserContextType = {
  user: UserSummary | null;
  setUser: (user: UserSummary | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const userIdRef = useRef<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser(controller.signal);
        userIdRef.current = userData?.id ?? null;
        setUser(userData);
      } catch (e) {
        console.log('Error fetching user data');
        userIdRef.current = null;
        setUser(null);
      } finally {
        setIsLoading(false);
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
        if (event === 'SIGNED_OUT') {
          userIdRef.current = null;
          setUser(null);
          return;
        }
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          // Skip if already have this user
          if (session?.user.id === userIdRef.current) return;
          fetchUser();
        }
      },
    );

    return () => {
      controller.abort();
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, isLoading, isAuthenticated: !!user }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
