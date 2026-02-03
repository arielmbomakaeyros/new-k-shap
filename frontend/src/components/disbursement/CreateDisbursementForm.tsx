'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { useApi } from '@/src/hooks/useApi';
// import { useApi } from '@/hooks/useApi';

const disbursementSchema = (t: (key: string, options?: { [key: string]: string | number }) => string) =>
  z.object({
    title: z.string().min(5, t('validation.disbursement.titleMin', { min: 5 })),
    description: z.string().optional(),
    amount: z.coerce.number().positive(t('validation.disbursement.amountPositive')),
    currency: z.string().default('USD'),
    payeeType: z.enum(['internal_staff', 'vendor', 'contractor', 'other']),
    payeeName: z.string().min(2, t('validation.disbursement.payeeNameRequired')),
    payeeEmail: z.string().email().optional(),
    payeePhone: z.string().optional(),
    departmentId: z.string().min(1, t('validation.disbursement.departmentRequired')),
    officeId: z.string().min(1, t('validation.disbursement.officeRequired')),
    budget: z.string().optional(),
    justification: z.string().min(10, t('validation.disbursement.justificationMin', { min: 10 })),
    documents: z.array(z.any()).optional(),
  });

type DisbursementFormData = z.infer<ReturnType<typeof disbursementSchema>>;

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
    resolver: zodResolver(disbursementSchema(t)),
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
            {t('disbursements.title')}
          </label>
          <input
            {...register('title')}
            type="text"
            placeholder={t('disbursements.placeholders.title')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.amount')}
          </label>
          <div className="flex gap-2 mt-1">
            <input
              {...register('amount')}
              type="number"
              step="0.01"
              placeholder={t('disbursements.placeholders.amount')}
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
          {t('disbursements.description')}
        </label>
        <textarea
          {...register('description')}
          placeholder={t('disbursements.placeholders.description')}
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.payeeType')}
          </label>
          <select
            {...register('payeeType')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="internal_staff">{t('disbursements.payeeTypes.internal_staff')}</option>
            <option value="vendor">{t('disbursements.payeeTypes.vendor')}</option>
            <option value="contractor">{t('disbursements.payeeTypes.contractor')}</option>
            <option value="other">{t('disbursements.payeeTypes.other')}</option>
          </select>
          {errors.payeeType && <p className="mt-1 text-xs text-red-500">{errors.payeeType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.payeeName')}
          </label>
          <input
            {...register('payeeName')}
            type="text"
            placeholder={t('disbursements.placeholders.payeeName')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          {errors.payeeName && <p className="mt-1 text-xs text-red-500">{errors.payeeName.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.payeeEmail')}
          </label>
          <input
            {...register('payeeEmail')}
            type="email"
            placeholder={t('disbursements.placeholders.payeeEmail')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.payeePhone')}
          </label>
          <input
            {...register('payeePhone')}
            type="tel"
            placeholder={t('disbursements.placeholders.payeePhone')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.department')}
          </label>
          <select
            {...register('departmentId')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">{t('disbursements.departments.select')}</option>
            <option value="dept-1">{t('disbursements.departments.finance')}</option>
            <option value="dept-2">{t('disbursements.departments.operations')}</option>
            <option value="dept-3">{t('disbursements.departments.hr')}</option>
          </select>
          {errors.departmentId && <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.office')}
          </label>
          <select
            {...register('officeId')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">{t('disbursements.offices.select')}</option>
            <option value="office-1">{t('disbursements.offices.new_york')}</option>
            <option value="office-2">{t('disbursements.offices.los_angeles')}</option>
            <option value="office-3">{t('disbursements.offices.chicago')}</option>
          </select>
          {errors.officeId && <p className="mt-1 text-xs text-red-500">{errors.officeId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.budget')}
          </label>
          <input
            {...register('budget')}
            type="text"
            placeholder={t('disbursements.placeholders.budget')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {t('disbursements.justification')}
        </label>
        <textarea
          {...register('justification')}
          placeholder={t('disbursements.placeholders.justification')}
          rows={4}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
        {errors.justification && (
          <p className="mt-1 text-xs text-red-500">{errors.justification.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? t('disbursements.buttons.submitting') : t('disbursements.buttons.submit')}
        </Button>
        <Button type="reset" variant="outline" className="flex-1 bg-transparent">
          {t('disbursements.buttons.clear')}
        </Button>
      </div>
    </form>
  );
}
