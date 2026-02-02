'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
// import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated
    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    // Check if user has any of the required roles
    if (requiredRoles && !user.systemRoles?.some((r) => requiredRoles.includes(r))) {
      router.push('/dashboard');
      return;
    }
  }, [token, user, router, requiredRoles]);

  // Show nothing while redirecting
  if (!token || !user) {
    return null;
  }

  // Check role permission
  if (requiredRoles && !user.systemRoles?.some((r) => requiredRoles.includes(r))) {
    return null;
  }

  return <>{children}</>;
}
