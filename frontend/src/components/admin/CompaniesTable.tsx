'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/types';

interface Company {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndDate?: Date;
  usersCount: number;
  createdAt: Date;
}

interface CompaniesTableProps {
  companies: Company[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleSubscription?: (id: string, status: SubscriptionStatus) => void;
}

export function CompaniesTable({
  companies,
  onEdit,
  onDelete,
  onToggleSubscription,
}: CompaniesTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedIds.length === companies.length}
                onChange={() => {
                  if (selectedIds.length === companies.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(companies.map((c) => c.id));
                  }
                }}
                className="rounded border-input"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Users</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-muted/50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(company.id)}
                  onChange={() => toggleSelect(company.id)}
                  className="rounded border-input"
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium">{company.name}</td>
              <td className="px-4 py-3 text-sm">{company.email}</td>
              <td className="px-4 py-3">
                <select
                  value={company.subscriptionStatus}
                  onChange={(e) =>
                    onToggleSubscription?.(company.id, e.target.value as SubscriptionStatus)
                  }
                  className={`rounded px-2 py-1 text-xs font-semibold ${getStatusColor(
                    company.subscriptionStatus
                  )}`}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </td>
              <td className="px-4 py-3 text-sm">{company.usersCount}</td>
              <td className="px-4 py-3 text-sm">
                {new Date(company.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit?.(company.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete?.(company.id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
