'use client';

import { CollectionStatus } from '@/types';

interface CollectionStatusBadgeProps {
  status: CollectionStatus;
}

const statusConfig: Record<CollectionStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  received: { label: 'Received', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  deposited: { label: 'Deposited', color: 'text-green-700', bgColor: 'bg-green-100' },
  reconciled: { label: 'Reconciled', color: 'text-green-800', bgColor: 'bg-green-200' },
  disputed: { label: 'Disputed', color: 'text-red-700', bgColor: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export function CollectionStatusBadge({ status }: CollectionStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.color} ${config.bgColor}`}
    >
      {config.label}
    </span>
  );
}
