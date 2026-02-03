'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
import { CreateDisbursementForm } from '@/src/components/disbursement/CreateDisbursementForm';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';

function NewDisbursementContent() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('disbursements.newTitle')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('disbursements.newSubtitle')}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <CreateDisbursementForm
          onSuccess={() => {
            router.push('/disbursements');
          }}
        />
      </div>
    </section>
  );
}

export default function NewDisbursementPage() {
  const { t } = useTranslation();
  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('disbursements.newRequest')}>
        <NewDisbursementContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
