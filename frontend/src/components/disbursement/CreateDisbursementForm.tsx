'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { useApi } from '@/src/hooks/useApi';
// import { useApi } from '@/hooks/useApi';

const disbursementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  payeeType: z.enum(['internal_staff', 'vendor', 'contractor', 'other']),
  payeeName: z.string().min(2, 'Payee name is required'),
  payeeEmail: z.string().email().optional(),
  payeePhone: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  officeId: z.string().min(1, 'Office is required'),
  budget: z.string().optional(),
  justification: z.string().min(10, 'Please provide detailed justification'),
  documents: z.array(z.any()).optional(),
});

type DisbursementFormData = z.infer<typeof disbursementSchema>;

interface CreateDisbursementFormProps {
  onSuccess?: () => void;
}

export function CreateDisbursementForm({ onSuccess }: CreateDisbursementFormProps) {
  const { t } = useTranslation();
  const { fetchAPI } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DisbursementFormData>({
    resolver: zodResolver(disbursementSchema),
  });

  const onSubmit = async (data: DisbursementFormData) => {
    setIsSubmitting(true);
    try {
      await fetchAPI('/api/disbursements', {
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
            {t('disbursement.title')}
          </label>
          <input
            {...register('title')}
            type="text"
            placeholder="e.g., Office Supplies Purchase"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursement.amount')}
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
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {t('disbursement.description')}
        </label>
        <textarea
          {...register('description')}
          placeholder="Optional description"
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursement.payeeType')}
          </label>
          <select
            {...register('payeeType')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="internal_staff">Internal Staff</option>
            <option value="vendor">Vendor</option>
            <option value="contractor">Contractor</option>
            <option value="other">Other</option>
          </select>
          {errors.payeeType && <p className="mt-1 text-xs text-red-500">{errors.payeeType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursement.payeeName')}
          </label>
          <input
            {...register('payeeName')}
            type="text"
            placeholder="Name or company"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          {errors.payeeName && <p className="mt-1 text-xs text-red-500">{errors.payeeName.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursement.payeeEmail')}
          </label>
          <input
            {...register('payeeEmail')}
            type="email"
            placeholder="email@example.com"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursement.payeePhone')}
          </label>
          <input
            {...register('payeePhone')}
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursement.department')}
          </label>
          <select
            {...register('departmentId')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">Select Department</option>
            <option value="dept-1">Finance</option>
            <option value="dept-2">Operations</option>
            <option value="dept-3">HR</option>
          </select>
          {errors.departmentId && <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursement.office')}
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
          {errors.officeId && <p className="mt-1 text-xs text-red-500">{errors.officeId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursement.budget')}
          </label>
          <input
            {...register('budget')}
            type="text"
            placeholder="Budget code (optional)"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {t('disbursement.justification')}
        </label>
        <textarea
          {...register('justification')}
          placeholder="Provide detailed justification for this disbursement"
          rows={4}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
        {errors.justification && (
          <p className="mt-1 text-xs text-red-500">{errors.justification.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
        <Button type="reset" variant="outline" className="flex-1 bg-transparent">
          Clear
        </Button>
      </div>
    </form>
  );
}
