// contexts/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import {
  useAuth as useClerkAuth,
  useUser as useClerkUser,
  useSignIn,
} from '@clerk/clerk-expo';

export type AppUser = {
  uid: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
};

interface AuthContextType {
  user: AppUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  signInEmailPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();

  const user: AppUser | null = clerkUser
    ? {
        uid: clerkUser.id,
        email:
          clerkUser.primaryEmailAddress?.emailAddress ||
          clerkUser.emailAddresses[0]?.emailAddress ||
          null,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        fullName:
          clerkUser.fullName ||
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
          null,
      }
    : null;

  const signInEmailPassword = async (email: string, password: string) => {
    if (!signInLoaded || !signIn) throw new Error('SignIn instance not ready');

    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.status === 'complete') {
      await setActive!({ session: result.createdSessionId });
    } else {
      console.error('Sign-in not completed:', result);
      throw new Error('Sign-in failed');
    }
  };

  const signOut = async () => {
    if (!clerkSignOut) throw new Error('Auth not ready');
    await clerkSignOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!isSignedIn,
        loading: !isLoaded,
        signInEmailPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

// For backward compatibility
export function useAuth() {
  return useAuthContext();
}
