'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { useApi } from '@/src/hooks/useApi';
// import { useApi } from '@/hooks/useApi';

const collectionSchema = z.object({
  referenceNumber: z.string().min(3, 'Reference number is required'),
  payer: z.string().min(2, 'Payer name is required'),
  payerType: z.enum(['customer', 'client', 'partner', 'other']),
  payerEmail: z.string().email().optional(),
  payerPhone: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  paymentMethod: z.enum(['bank_transfer', 'check', 'cash', 'credit_card', 'other']),
  invoiceNumber: z.string().optional(),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  officeId: z.string().min(1, 'Office is required'),
  notes: z.string().optional(),
  bankAccountId: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

interface CreateCollectionFormProps {
  onSuccess?: () => void;
}

export function CreateCollectionForm({ onSuccess }: CreateCollectionFormProps) {
  const { t } = useTranslation();
  const { fetchAPI } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
  });

  const onSubmit = async (data: CollectionFormData) => {
    setIsSubmitting(true);
    try {
      await fetchAPI('/api/collections', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      reset();
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Reference Number
          </label>
          <input
            {...register('referenceNumber')}
            type="text"
            placeholder="e.g., COL-2024-001"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          {errors.referenceNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.referenceNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Invoice Number (Optional)
          </label>
          <input
            {...register('invoiceNumber')}
            type="text"
            placeholder="INV-2024-001"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Payer Name
          </label>
          <input
            {...register('payer')}
            type="text"
            placeholder="Customer or client name"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          {errors.payer && <p className="mt-1 text-xs text-red-500">{errors.payer.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Payer Type
          </label>
          <select
            {...register('payerType')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="customer">Customer</option>
            <option value="client">Client</option>
            <option value="partner">Partner</option>
            <option value="other">Other</option>
          </select>
          {errors.payerType && (
            <p className="mt-1 text-xs text-red-500">{errors.payerType.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Payer Email
          </label>
          <input
            {...register('payerEmail')}
            type="email"
            placeholder="email@example.com"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Payer Phone
          </label>
          <input
            {...register('payerPhone')}
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Amount
          </label>
          <div className="flex gap-2 mt-1">
            <input
              {...register('amount')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
            />
            <select
              {...register('currency')}
              className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Payment Method
          </label>
          <select
            {...register('paymentMethod')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="check">Check</option>
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="other">Other</option>
          </select>
          {errors.paymentMethod && (
            <p className="mt-1 text-xs text-red-500">{errors.paymentMethod.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Department
          </label>
          <select
            {...register('departmentId')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">Select Department</option>
            <option value="dept-1">Sales</option>
            <option value="dept-2">Finance</option>
            <option value="dept-3">Operations</option>
          </select>
          {errors.departmentId && (
            <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Office Location
          </label>
          <select
            {...register('officeId')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">Select Office</option>
            <option value="office-1">New York</option>
            <option value="office-2">Los Angeles</option>
            <option value="office-3">Chicago</option>
          </select>
          {errors.officeId && (
            <p className="mt-1 text-xs text-red-500">{errors.officeId.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          {...register('description')}
          placeholder="Payment description or service details"
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          Additional Notes
        </label>
        <textarea
          {...register('notes')}
          placeholder="Any additional notes or comments"
          rows={2}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Recording...' : 'Record Collection'}
        </Button>
        <Button type="reset" variant="outline" className="flex-1 bg-transparent">
          Clear
        </Button>
      </div>
    </form>
  );
}
