'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/src/lib/rbac';
import { Permission } from '@/src/lib/permissions';

interface CanAccessProps {
  permission?: Permission | Permission[];
  fallback?: ReactNode;
  requireAll?: boolean;
  children: ReactNode;
}

/**
 * Component-level access control wrapper
 * Shows children only if user has required permission(s)
 */
export function CanAccess({
  permission,
  fallback,
  requireAll = false,
  children,
}: CanAccessProps) {
  const user = useAuthStore((state) => state.user);

  if (!permission) {
    return <>{children}</>;
  }

  let hasAccess = false;

  if (Array.isArray(permission)) {
    if (requireAll) {
      hasAccess = hasAllPermissions(user, permission);
    } else {
      hasAccess = hasAnyPermission(user, permission);
    }
  } else {
    hasAccess = hasPermission(user, permission);
  }

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface ConditionalRenderProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Alternative name for CanAccess
 */
export function IfCanAccess(props: ConditionalRenderProps) {
  return <CanAccess {...props} />;
}
