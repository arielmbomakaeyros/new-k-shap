'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
import { CreateCollectionForm } from '@/src/components/collection/CreateCollectionForm';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';

function NewCollectionContent() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('collections.newTitle')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('collections.newSubtitle')}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <CreateCollectionForm
          onSuccess={() => {
            router.push('/collections');
          }}
        />
      </div>
    </section>
  );
}

export default function NewCollectionPage() {
  const { t } = useTranslation();
  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('collections.newCollection')}>
        <NewCollectionContent />
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
