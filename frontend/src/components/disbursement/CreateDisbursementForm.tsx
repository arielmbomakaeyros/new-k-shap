'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QRCode from 'qrcode';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { fileUploadService, disbursementsService } from '@/src/services';
import { useBeneficiaries, useDepartments, useDisbursementTemplates, useDisbursementTypes, useOffices, useCreateDisbursementTemplate, useCompanySettings } from '@/src/hooks/queries';

const paymentMethods = [
  { value: 'cash', labelKey: 'disbursements.paymentMethods.cash', defaultLabel: 'Cash' },
  { value: 'bank_transfer', labelKey: 'disbursements.paymentMethods.bank_transfer', defaultLabel: 'Bank Transfer' },
  { value: 'mobile_money', labelKey: 'disbursements.paymentMethods.mobile_money', defaultLabel: 'Mobile Money' },
  { value: 'check', labelKey: 'disbursements.paymentMethods.check', defaultLabel: 'Check' },
  { value: 'card', labelKey: 'disbursements.paymentMethods.card', defaultLabel: 'Card' },
];

const priorities = [
  { value: 'low', labelKey: 'disbursements.priority.low', defaultLabel: 'Low' },
  { value: 'medium', labelKey: 'disbursements.priority.medium', defaultLabel: 'Medium' },
  { value: 'high', labelKey: 'disbursements.priority.high', defaultLabel: 'High' },
  { value: 'urgent', labelKey: 'disbursements.priority.urgent', defaultLabel: 'Urgent' },
];

const disbursementSchema = (t: (key: string, options?: { [key: string]: string | number }) => string) =>
  z.object({
    description: z.string().min(5, t('validation.disbursement.descriptionMin', { min: 5 })),
    amount: z.coerce.number().positive(t('validation.disbursement.amountPositive')),
    currency: z.string().default('XAF'),
    disbursementType: z.string().min(1, t('validation.disbursement.typeRequired')),
    beneficiary: z.string().min(1, t('validation.disbursement.beneficiaryRequired')),
    department: z.string().min(1, t('validation.disbursement.departmentRequired')),
    office: z.string().optional(),
    paymentMethod: z.string().optional(),
    purpose: z.string().optional(),
    expectedPaymentDate: z.string().optional(),
    priority: z.string().optional(),
    isUrgent: z.boolean().optional(),
    tags: z.string().optional(),
    internalNotes: z.string().optional(),
  });

type DisbursementFormData = z.input<ReturnType<typeof disbursementSchema>>;

interface CreateDisbursementFormProps {
  onSuccess?: () => void;
  initialTemplateId?: string | null;
}

export function CreateDisbursementForm({ onSuccess, initialTemplateId }: CreateDisbursementFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialTemplateId || null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const { data: departmentsData } = useDepartments();
  const { data: officesData } = useOffices();
  const { data: disbursementTypesData } = useDisbursementTypes();
  const { data: templatesData } = useDisbursementTemplates();
  const { data: companySettings } = useCompanySettings();
  const createTemplateMutation = useCreateDisbursementTemplate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm<DisbursementFormData>({
    resolver: zodResolver(disbursementSchema(t)),
    defaultValues: {
      currency: companySettings?.defaultCurrency || 'XAF',
      paymentMethod: 'cash',
      priority: 'medium',
    },
  });

  const departments = departmentsData?.data ?? [];
  const offices = officesData?.data ?? [];
  const disbursementTypes = disbursementTypesData?.data ?? [];
  const selectedDisbursementType = watch('disbursementType');
  const { data: beneficiariesData } = useBeneficiaries(
    selectedDisbursementType ? { disbursementType: selectedDisbursementType } : undefined
  );
  const beneficiaries = selectedDisbursementType ? beneficiariesData?.data ?? [] : [];
  const templates = templatesData?.data ?? [];
  const availablePaymentMethods = companySettings?.paymentMethods?.length
    ? companySettings.paymentMethods
    : paymentMethods.map((m) => m.value);


  const selectedTemplate = useMemo(() => templates.find((t) => t.id === selectedTemplateId || t._id === selectedTemplateId), [templates, selectedTemplateId]);
  const selectedCurrency = watch('currency') || companySettings?.defaultCurrency || 'XAF';

  useEffect(() => {
    if (!selectedTemplate) return;
    setValue('description', selectedTemplate.description || '');
    setValue('amount', selectedTemplate.amount || 0);
    setValue('currency', selectedTemplate.currency || companySettings?.defaultCurrency || 'XAF');
    setValue('disbursementType', selectedTemplate.disbursementType?._id || selectedTemplate.disbursementType);
    setValue('beneficiary', selectedTemplate.beneficiary?._id || selectedTemplate.beneficiary);
    setValue('department', selectedTemplate.department?._id || selectedTemplate.department);
    setValue('office', selectedTemplate.office?._id || selectedTemplate.office || '');
    setValue('paymentMethod', selectedTemplate.paymentMethod || 'cash');
    setValue('purpose', selectedTemplate.purpose || '');
    setValue('priority', selectedTemplate.priority || 'medium');
    setValue('isUrgent', !!selectedTemplate.isUrgent);
    setValue('tags', selectedTemplate.tags?.join(', ') || '');
    setValue('internalNotes', '');
  }, [selectedTemplate, companySettings?.defaultCurrency, setValue]);

  useEffect(() => {
    if (companySettings?.defaultCurrency) {
      setValue('currency', companySettings.defaultCurrency);
    }
  }, [companySettings?.defaultCurrency, setValue]);

  useEffect(() => {
    const buildQr = async () => {
      if (!selectedTemplateId) {
        setQrUrl(null);
        return;
      }
      if (typeof window === 'undefined') return;
      const url = `${window.location.origin}/disbursements/new?template=${selectedTemplateId}`;
      const dataUrl = await QRCode.toDataURL(url, { margin: 2, width: 220 });
      setQrUrl(dataUrl);
    };
    buildQr().catch(() => setQrUrl(null));
  }, [selectedTemplateId]);

  const handleSaveTemplate = async () => {
    const values = getValues();
    if (!templateName || !values.amount || !values.disbursementType || !values.beneficiary || !values.department) {
      return;
    }

      await createTemplateMutation.mutateAsync({
      name: templateName,
      description: values.description,
      amount: values.amount,
      currency: values.currency || companySettings?.defaultCurrency || 'XAF',
      disbursementType: values.disbursementType,
      beneficiary: values.beneficiary,
      department: values.department,
      office: values.office || undefined,
      paymentMethod: values.paymentMethod,
      purpose: values.purpose,
      priority: values.priority,
      isUrgent: values.isUrgent,
      tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });

    setTemplateName('');
  };

  const onSubmit = async (data: DisbursementFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        amount: data.amount,
        currency: data.currency || companySettings?.defaultCurrency || 'XAF',
        disbursementType: data.disbursementType,
        beneficiary: data.beneficiary,
        description: data.description,
        purpose: data.purpose || undefined,
        department: data.department,
        office: data.office || undefined,
        paymentMethod: data.paymentMethod || undefined,
        expectedPaymentDate: data.expectedPaymentDate ? new Date(data.expectedPaymentDate) : undefined,
        priority: data.priority || undefined,
        isUrgent: data.isUrgent || false,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        internalNotes: data.internalNotes || undefined,
      };

      const created = await disbursementsService.create(payload as any);
      const createdData: any = (created as any).data || (created as any).data?.data;
      const disbursementId = createdData?._id || createdData?.id;

      if (attachments.length > 0 && disbursementId) {
        const uploadResult = await fileUploadService.uploadMultiple(attachments, {
          category: 'attachment',
          entityType: 'disbursement',
          entityId: disbursementId,
        });
        const files = (uploadResult as any).data?.data || (uploadResult as any).data || [];
        const urls = Array.isArray(files) ? files.map((f: any) => f.url).filter(Boolean) : [];
        if (urls.length > 0) {
          await disbursementsService.update(disbursementId, { attachments: urls } as any);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Templates */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground">
              {t('disbursements.templates.select', { defaultValue: 'Quick Templates' })}
            </label>
            <select
              value={selectedTemplateId || ''}
              onChange={(e) => setSelectedTemplateId(e.target.value || null)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
            >
              <option value="">{t('disbursements.templates.none', { defaultValue: 'No template' })}</option>
              {templates.map((template: any) => (
                <option key={template.id || template._id} value={template.id || template._id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground">
              {t('disbursements.templates.name', { defaultValue: 'Template Name' })}
            </label>
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              type="text"
              placeholder={t('disbursements.templates.placeholder', { defaultValue: 'e.g. Monthly Rent' })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>
          <Button type="button" variant="outline" onClick={handleSaveTemplate} disabled={!templateName}>
            {t('disbursements.templates.save', { defaultValue: 'Save Template' })}
          </Button>
        </div>
        {qrUrl && (
          <div className="mt-4 flex items-center gap-4">
            <img src={qrUrl} alt="QR code" className="h-28 w-28 rounded-md border border-border bg-white p-1" />
            <div className="text-sm text-muted-foreground">
              {t('disbursements.templates.qrHelp', { defaultValue: 'Scan to open this template quickly on mobile.' })}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.amount')}
          </label>
          <div className="flex gap-2 mt-1">
            <input
              {...register('amount')}
              type="number"
              step="1"
              placeholder={t('disbursements.placeholders.amount')}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
            />
            <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground">
              {selectedCurrency}
            </div>
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.type', { defaultValue: 'Disbursement Type' })}
          </label>
          <select
            {...register('disbursementType')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">{t('disbursements.typeSelect', { defaultValue: 'Select type' })}</option>
            {disbursementTypes.map((type: any) => (
              <option key={type.id || type._id} value={type.id || type._id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.disbursementType && <p className="mt-1 text-xs text-red-500">{errors.disbursementType.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.beneficiary', { defaultValue: 'Beneficiary' })}
          </label>
          <select
            {...register('beneficiary')}
            disabled={!selectedDisbursementType}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">
              {selectedDisbursementType
                ? t('disbursements.beneficiarySelect', { defaultValue: 'Select beneficiary' })
                : t('disbursements.typeSelect', { defaultValue: 'Select type first' })}
            </option>
            {beneficiaries.map((beneficiary: any) => (
              <option key={beneficiary.id || beneficiary._id} value={beneficiary.id || beneficiary._id}>
                {beneficiary.name || beneficiary.email}
              </option>
            ))}
          </select>
          {errors.beneficiary && <p className="mt-1 text-xs text-red-500">{errors.beneficiary.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.paymentMethod', { defaultValue: 'Payment Method' })}
          </label>
          <select
            {...register('paymentMethod')}
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
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {t('common.description')}
        </label>
        <textarea
          {...register('description')}
          placeholder={t('disbursements.placeholders.description')}
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.department')}
          </label>
          <select
            {...register('department')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">{t('disbursements.departments.select')}</option>
            {departments.map((department: any) => (
              <option key={department.id || department._id} value={department.id || department._id}>
                {department.name}
              </option>
            ))}
          </select>
          {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.office')}
          </label>
          <select
            {...register('office')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="">{t('disbursements.offices.select')}</option>
            {offices.map((office: any) => (
              <option key={office.id || office._id} value={office.id || office._id}>
                {office.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.priorityLabel', { defaultValue: 'Priority' })}
          </label>
          <select
            {...register('priority')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {t(priority.labelKey, { defaultValue: priority.defaultLabel })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.purpose', { defaultValue: 'Purpose' })}
          </label>
          <input
            {...register('purpose')}
            type="text"
            placeholder={t('disbursements.placeholders.purpose', { defaultValue: 'Operational expense' })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.expectedPaymentDate', { defaultValue: 'Expected Payment Date' })}
          </label>
          <input
            {...register('expectedPaymentDate')}
            type="date"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('disbursements.tags', { defaultValue: 'Tags' })}
          </label>
          <input
            {...register('tags')}
            type="text"
            placeholder={t('disbursements.placeholders.tags', { defaultValue: 'supplies, rent, travel' })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            {...register('isUrgent')}
            type="checkbox"
            className="h-4 w-4 rounded border-input"
          />
          <label className="text-sm text-foreground">
            {t('disbursements.isUrgent', { defaultValue: 'Mark as urgent' })}
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {t('disbursements.internalNotes', { defaultValue: 'Internal Notes' })}
        </label>
        <textarea
          {...register('internalNotes')}
          rows={2}
          placeholder={t('disbursements.placeholders.internalNotes', { defaultValue: 'Visible to finance team only' })}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {t('disbursements.attachments', { defaultValue: 'Attachments' })}
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
          {isSubmitting ? t('disbursements.buttons.submitting') : t('disbursements.buttons.submit')}
        </Button>
        <Button type="button" variant="outline" onClick={() => reset()}>
          {t('disbursements.buttons.clear')}
        </Button>
      </div>
    </form>
  );
}
