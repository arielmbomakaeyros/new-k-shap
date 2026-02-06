'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, token, setUser, setToken } = useAuthStore();

  useEffect(() => {
    // Try a quick localStorage restore before redirecting
    if ((!token || !user) && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) {
          const parsed = JSON.parse(raw);
          const stored = parsed?.state;
          if (stored?.token && stored?.user) {
            setToken(stored.token);
            setUser(stored.user);
            return;
          }
        }
      } catch {
        // ignore storage parse errors
      }
    }

    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    // Check if user has any of the required roles
    if (requiredRoles && !user.systemRoles?.some((r) => requiredRoles.includes(r))) {
      router.push('/dashboard');
      return;
    }
  }, [token, user, router, requiredRoles, setUser, setToken]);

  // Show nothing while redirecting
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-lg border border-border/60 bg-card px-6 py-4 text-sm text-muted-foreground shadow-sm">
          Restoring session...
        </div>
      </div>
    );
  }

  // Check role permission
  if (requiredRoles && !user.systemRoles?.some((r) => requiredRoles.includes(r))) {
    return null;
  }

  return <>{children}</>;
}
