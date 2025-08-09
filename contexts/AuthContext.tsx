import React, { createContext, useContext, useEffect, useState } from 'react';
// If TS complains about the next line, create a `declarations.d.ts` with: declare module '@react-native-firebase/auth';
import {User} from '@react-native-firebase/auth';
import { AuthService } from '@/services/AuthService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await AuthService.signIn(email, password);
  };

  const signInWithGoogle = async () => {
    await AuthService.signInWithGoogle();
  };

  const signOut = async () => {
    await AuthService.signOut();
  };

  const value: AuthContextType = {
    user,
    loading,
    isLoggedIn: !!user,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for consuming the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
