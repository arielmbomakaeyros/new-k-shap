'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function ReconciliationContent() {
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [showReconcile, setShowReconcile] = useState(false);

  const reconciliationData = {
    period: 'January 2024',
    bankStatement: {
      openingBalance: 10000,
      deposits: 15000,
      withdrawals: 8000,
      closingBalance: 17000,
      statementDate: '2024-01-31',
    },
    systemRecords: {
      openingBalance: 10000,
      deposits: 15000,
      withdrawals: 8000,
      systemBalance: 17000,
    },
    differences: {
      inBankNotSystem: [
        { date: '2024-01-20', amount: 500, description: 'Fee' },
      ],
      inSystemNotBank: [],
      variance: 0,
    },
  };

  const reconciliationItems = [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Collection COL-2024-001',
      amount: 5000,
      status: 'matched',
    },
    {
      id: 2,
      date: '2024-01-16',
      description: 'Collection COL-2024-002',
      amount: 2500,
      status: 'matched',
    },
    {
      id: 3,
      date: '2024-01-17',
      description: 'Collection COL-2024-003',
      amount: 7500,
      status: 'matched',
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bank Reconciliation
          </h1>
          <p className="mt-2 text-muted-foreground">
            Reconcile system records with bank statements
          </p>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Period Selection */}
        <div className="mb-6 flex gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-md border border-input bg-background px-4 py-2 text-foreground"
          >
            <option value="current_month">Current Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="year_to_date">Year to Date</option>
          </select>
          <Button onClick={() => setShowReconcile(!showReconcile)}>
            {showReconcile ? 'Hide' : 'Start'} Reconciliation
          </Button>
        </div>

        {/* Reconciliation Summary */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Bank Statement */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Bank Statement</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opening Balance</span>
                <span className="font-medium text-foreground">
                  USD {reconciliationData.bankStatement.openingBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposits</span>
                <span className="font-medium text-green-600">
                  +USD {reconciliationData.bankStatement.deposits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Withdrawals</span>
                <span className="font-medium text-red-600">
                  -USD {reconciliationData.bankStatement.withdrawals.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="text-muted-foreground">Closing Balance</span>
                <span className="font-semibold text-foreground">
                  USD {reconciliationData.bankStatement.closingBalance.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                As of {reconciliationData.bankStatement.statementDate}
              </p>
            </div>
          </div>

          {/* System Records */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">System Records</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opening Balance</span>
                <span className="font-medium text-foreground">
                  USD {reconciliationData.systemRecords.openingBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposits</span>
                <span className="font-medium text-green-600">
                  +USD {reconciliationData.systemRecords.deposits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Withdrawals</span>
                <span className="font-medium text-red-600">
                  -USD {reconciliationData.systemRecords.withdrawals.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="text-muted-foreground">System Balance</span>
                <span className="font-semibold text-foreground">
                  USD {reconciliationData.systemRecords.systemBalance.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 rounded-md bg-green-50 p-3 flex items-center gap-2">
                <span className="text-green-700 text-sm font-semibold">✓ Balanced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reconciliation Items */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Reconciled Items</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reconciliationItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm text-foreground">{item.date}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{item.description}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      USD {item.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                        {item.status === 'matched' ? '✓ Matched' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ReconciliationPage() {
  return (
    <ProtectedRoute>
      <ReconciliationContent />
    </ProtectedRoute>
  );
}
