'use client';

import { UserSummary } from '@/types/user';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

type UserContextType = {
  user: UserSummary | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {}, []);

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
