'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/src/components/disbursement/StatusBadge';
import { WorkflowTimeline } from '@/src/components/disbursement/WorkflowTimeline';
import { ApprovalDialog } from '@/src/components/disbursement/ApprovalDialog';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { useDisbursement } from '@/src/hooks/queries/useDisbursements';
import { formatPrice } from '@/src/lib/format';
import QRCode from 'qrcode';

function DisbursementDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const id = params.id as string;
  const { data: disbursement, isLoading, error } = useDisbursement(id);



  const canApprove = ['pending_dept_head', 'pending_validator', 'pending_cashier'].includes(
    disbursement?.status || ''
  );
  const stage =
    disbursement?.status === 'pending_validator'
      ? 'validator'
      : disbursement?.status === 'pending_cashier'
        ? 'cashier'
        : 'department_head';

  const attachments = disbursement?.attachments || [];
  const invoices = disbursement?.invoices || [];

  useEffect(() => {
    if (!canApprove) return;
    const approveParam = searchParams.get('approve');
    const shouldOpen = approveParam === '1' || approveParam === 'true';
    if (shouldOpen) {
      setShowApprovalDialog(true);
    }
  }, [canApprove, searchParams]);

  const handleGenerateQr = async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/disbursements/${id}?approve=1&stage=${stage}`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 2, width: 220 });
    setQrUrl(dataUrl);
  };

    if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">{t('common.loading', { defaultValue: 'Loading...' })}</span>
      </div>
    );
  }

  if (error || !disbursement) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <p className="text-destructive">{t('disbursements.loadFailed', { defaultValue: 'Failed to load disbursement.' })}</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {disbursement.description}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('disbursements.requestNumber', { id: disbursement.referenceNumber || disbursement._id })}
          </p>
        </div>
        <div className="flex gap-3">
          {canApprove && (
            <Button onClick={() => setShowApprovalDialog(true)}>{t('disbursements.approveReview')}</Button>
          )}
          {canApprove && (
            <Button variant="outline" onClick={handleGenerateQr}>
              {t('disbursements.approvalQr', { defaultValue: 'Generate Approval QR' })}
            </Button>
          )}
          <Button variant="outline">{t('disbursements.downloadPdf', { defaultValue: 'Download PDF' })}</Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('disbursements.currentStatus')}</p>
                <div className="mt-2">
                  <StatusBadge status={disbursement.status as any} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('disbursements.totalAmount')}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {formatPrice(disbursement.amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('disbursements.requestDetails')}</h2>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t('disbursements.beneficiary', { defaultValue: 'Beneficiary' })}</p>
                  <p className="mt-1 font-medium text-foreground">
                    {disbursement.beneficiary?.name || disbursement.beneficiary?.email || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('disbursements.type', { defaultValue: 'Type' })}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.disbursementType?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('users.department')}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.department?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('users.office')}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.office?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('disbursements.paymentMethod', { defaultValue: 'Payment Method' })}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.paymentMethod || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('disbursements.priorityLabel', { defaultValue: 'Priority' })}</p>
                  <p className="mt-1 font-medium text-foreground">{disbursement.priority || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{t('common.description')}</p>
                <p className="mt-1 text-foreground">{disbursement.description}</p>
              </div>

              {disbursement.purpose && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('disbursements.purpose', { defaultValue: 'Purpose' })}</p>
                  <p className="mt-1 text-foreground">{disbursement.purpose}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('disbursements.createdOn')}</p>
                  <p className="mt-1 font-medium text-foreground">
                    {new Date(disbursement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <WorkflowTimeline disbursement={disbursement as any} />
          </div>
        </div>

        <div className="space-y-6">
          {canApprove && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">{t('common.actions')}</h3>
              <Button className="w-full" onClick={() => setShowApprovalDialog(true)}>
                {t('disbursements.reviewApprove')}
              </Button>
            </div>
          )}

          {qrUrl && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">{t('disbursements.approvalQrTitle', { defaultValue: 'Approval QR Code' })}</h3>
              <div className="flex flex-col items-center gap-3">
                <img src={qrUrl} alt="Approval QR code" className="h-40 w-40 rounded-md border border-border bg-white p-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {t('disbursements.approvalQrHelp', { defaultValue: 'Scan to open this disbursement with approval ready.' })}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">{t('disbursements.attachments')}</h3>
            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('disbursements.noAttachments')}</p>
            ) : (
              <div className="space-y-2">
                {attachments.map((url: string, idx: number) => (
                  <a key={idx} href={url} className="block text-sm text-primary underline" target="_blank" rel="noreferrer">
                    {t('common.attachment', { defaultValue: 'Attachment' })} {idx + 1}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">{t('disbursements.invoices', { defaultValue: 'Invoices' })}</h3>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('disbursements.noInvoices', { defaultValue: 'No invoices yet.' })}</p>
            ) : (
              <div className="space-y-2">
                {invoices.map((url: string, idx: number) => (
                  <a key={idx} href={url} className="block text-sm text-primary underline" target="_blank" rel="noreferrer">
                    {t('disbursements.invoice', { defaultValue: 'Invoice' })} {idx + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showApprovalDialog && (
        <ApprovalDialog
          disbursementId={disbursement._id as string}
          stage={stage as any}
          onClose={() => setShowApprovalDialog(false)}
          onSuccess={() => {
            setShowApprovalDialog(false);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}

export default function DisbursementDetailPage() {
  const { t } = useTranslation();
  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('disbursements.view')}>
        <DisbursementDetailContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
