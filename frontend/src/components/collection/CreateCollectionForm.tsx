'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { fileUploadService, collectionsService } from '@/src/services';
import { useDepartments, useOffices, useCompanySettings } from '@/src/hooks/queries';

const paymentMethods = [
  { value: 'cash', labelKey: 'collections.paymentMethods.cash', defaultLabel: 'Cash' },
  { value: 'bank_transfer', labelKey: 'collections.paymentMethods.bank_transfer', defaultLabel: 'Bank Transfer' },
  { value: 'mobile_money', labelKey: 'collections.paymentMethods.mobile_money', defaultLabel: 'Mobile Money' },
  { value: 'check', labelKey: 'collections.paymentMethods.check', defaultLabel: 'Check' },
  { value: 'card', labelKey: 'collections.paymentMethods.card', defaultLabel: 'Card' },
];

const collectionSchema = (t: (key: string, options?: { [key: string]: string | number }) => string) =>
  z.object({
    buyerName: z.string().min(2, t('validation.collections.buyerRequired', { min: 2 })),
    buyerCompanyName: z.string().optional(),
    buyerEmail: z.string().email().optional(),
    buyerPhone: z.string().optional(),
    sellerName: z.string().optional(),
    amount: z.coerce.number().positive(t('validation.collections.amountPositive')),
    currency: z.string().default('XAF'),
    paymentType: z.string().min(1, t('validation.collections.paymentRequired')),
    collectionDate: z.string().min(1, t('validation.collections.dateRequired')),
    department: z.string().optional(),
    office: z.string().optional(),
    productType: z.string().optional(),
    serviceCategory: z.string().optional(),
    revenueCategory: z.string().optional(),
    activityType: z.string().optional(),
    comment: z.string().optional(),
    internalNotes: z.string().optional(),
  });

type CollectionFormData = z.input<ReturnType<typeof collectionSchema>>;

interface CreateCollectionFormProps {
  onSuccess?: () => void;
}

export function CreateCollectionForm({ onSuccess }: CreateCollectionFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const { data: departmentsData } = useDepartments();
  const { data: officesData } = useOffices();
  const { data: companySettings } = useCompanySettings();

  const departments = departmentsData?.data ?? [];
  const offices = officesData?.data ?? [];
  const availablePaymentMethods = companySettings?.paymentMethods?.length
    ? companySettings.paymentMethods
    : paymentMethods.map((m) => m.value);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema(t)),
    defaultValues: {
      currency: companySettings?.defaultCurrency || 'XAF',
      paymentType: 'cash',
    },
  });

  useEffect(() => {
    if (companySettings?.defaultCurrency) {
      reset((prev) => ({ ...prev, currency: companySettings.defaultCurrency }));
    }
  }, [companySettings?.defaultCurrency, reset]);

  const onSubmit = async (data: CollectionFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        amount: data.amount,
        currency: data.currency || companySettings?.defaultCurrency || 'XAF',
        buyerName: data.buyerName,
        buyerCompanyName: data.buyerCompanyName || undefined,
        buyerEmail: data.buyerEmail || undefined,
        buyerPhone: data.buyerPhone || undefined,
        sellerName: data.sellerName || undefined,
        paymentType: data.paymentType,
        productType: data.productType || undefined,
        serviceCategory: data.serviceCategory || undefined,
        totalAmount: data.amount,
        advancePayment: data.amount,
        collectionDate: new Date(data.collectionDate),
        department: data.department || undefined,
        office: data.office || undefined,
        revenueCategory: data.revenueCategory || undefined,
        activityType: data.activityType || undefined,
        comment: data.comment || undefined,
        internalNotes: data.internalNotes || undefined,
      };

      const created = await collectionsService.create(payload as any);
      const createdData: any = (created as any).data || (created as any).data?.data;
      const collectionId = createdData?._id || createdData?.id;

      if (attachments.length > 0 && collectionId) {
        const uploadResult = await fileUploadService.uploadMultiple(attachments, {
          category: 'attachment',
          entityType: 'collection',
          entityId: collectionId,
        });
        const files = (uploadResult as any).data?.data || (uploadResult as any).data || [];
        const urls = Array.isArray(files) ? files.map((f: any) => f.url).filter(Boolean) : [];
        if (urls.length > 0) {
          await collectionsService.update(collectionId, { attachments: urls } as any);
        }
      }

      reset();
      setAttachments([]);
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
            {t('collections.buyerName', { defaultValue: 'Buyer Name' })}
          </label>
          <input
            {...register('buyerName')}
            type="text"
            placeholder={t('collections.placeholders.buyerName', { defaultValue: 'Customer name' })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          {errors.buyerName && (
            <p className="mt-1 text-xs text-red-500">{errors.buyerName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.buyerCompany', { defaultValue: 'Buyer Company' })}
          </label>
          <input
            {...register('buyerCompanyName')}
            type="text"
            placeholder={t('collections.placeholders.buyerCompany', { defaultValue: 'Company (optional)' })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.buyerEmail', { defaultValue: 'Buyer Email' })}
          </label>
          <input
            {...register('buyerEmail')}
            type="email"
            placeholder="email@example.com"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.buyerPhone', { defaultValue: 'Buyer Phone' })}
          </label>
          <input
            {...register('buyerPhone')}
            type="tel"
            placeholder="+237 6xx xxx xxx"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.sellerName', { defaultValue: 'Seller Name' })}
          </label>
          <input
            {...register('sellerName')}
            type="text"
            placeholder={t('collections.placeholders.sellerName', { defaultValue: 'Handled by' })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.collectionDate', { defaultValue: 'Collection Date' })}
          </label>
          <input
            {...register('collectionDate')}
            type="date"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          />
          {errors.collectionDate && (
            <p className="mt-1 text-xs text-red-500">{errors.collectionDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.amount', { defaultValue: 'Amount' })}
          </label>
          <div className="flex gap-2 mt-1">
            <input
              {...register('amount')}
              type="number"
              step="1"
              placeholder="0"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
            />
            <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground">
              {companySettings?.defaultCurrency || 'XAF'}
            </div>
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.paymentMethod', { defaultValue: 'Payment Method' })}
          </label>
          <select
            {...register('paymentType')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            {availablePaymentMethods.map((value) => {
              const method = paymentMethods.find((m) => m.value === value);
              return (
                <option key={value} value={value}>
                  {method ? t(method.labelKey, { defaultValue: method.defaultLabel }) : value}
                </option>
              );
            })}
          </select>
          {errors.paymentType && (
            <p className="mt-1 text-xs text-red-500">{errors.paymentType.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.department', { defaultValue: 'Department' })}
          </label>
          <select
            {...register('department')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">{t('collections.departmentSelect', { defaultValue: 'Select department' })}</option>
            {departments.map((department: any) => (
              <option key={department.id || department._id} value={department.id || department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.office', { defaultValue: 'Office' })}
          </label>
          <select
            {...register('office')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">{t('collections.officeSelect', { defaultValue: 'Select office' })}</option>
            {offices.map((office: any) => (
              <option key={office.id || office._id} value={office.id || office._id}>
                {office.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.revenueCategory', { defaultValue: 'Revenue Category' })}
          </label>
          <input
            {...register('revenueCategory')}
            type="text"
            placeholder={t('collections.placeholders.revenueCategory', { defaultValue: 'Sales Revenue' })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('collections.activityType', { defaultValue: 'Activity Type' })}
          </label>
          <input
            {...register('activityType')}
            type="text"
            placeholder={t('collections.placeholders.activityType', { defaultValue: 'Product Sale' })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {t('collections.comment', { defaultValue: 'Comment' })}
        </label>
        <textarea
          {...register('comment')}
          rows={3}
          placeholder={t('collections.placeholders.comment', { defaultValue: 'Short notes about the collection' })}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {t('collections.internalNotes', { defaultValue: 'Internal Notes' })}
        </label>
        <textarea
          {...register('internalNotes')}
          rows={2}
          placeholder={t('collections.placeholders.internalNotes', { defaultValue: 'Visible to finance team only' })}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {t('collections.attachments', { defaultValue: 'Attachments' })}
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => setAttachments(Array.from(e.target.files || []))}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('collections.buttons.submitting', { defaultValue: 'Saving...' }) : t('collections.buttons.submit', { defaultValue: 'Record Collection' })}
        </Button>
        <Button type="button" variant="outline" onClick={() => reset()}>
          {t('collections.buttons.clear', { defaultValue: 'Clear' })}
        </Button>
      </div>
    </form>
  );
}
