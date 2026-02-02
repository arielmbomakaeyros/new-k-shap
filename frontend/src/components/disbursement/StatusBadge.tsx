'use client';

import { DisbursementStatus } from '@/types';

interface StatusBadgeProps {
  status: DisbursementStatus;
  stage?: 'draft' | 'department_head' | 'validator' | 'cashier' | 'completed' | 'rejected';
}

const statusConfig: Record<DisbursementStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  pending_department_head: {
    label: 'Awaiting Department Head',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  pending_validator: {
    label: 'Awaiting Validator',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  pending_cashier: {
    label: 'Awaiting Disbursement',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
  disbursed: { label: 'Disbursed', color: 'text-green-800', bgColor: 'bg-green-200' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
  changes_requested: {
    label: 'Changes Requested',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.color} ${config.bgColor}`}>
      {config.label}
    </span>
  );
}
