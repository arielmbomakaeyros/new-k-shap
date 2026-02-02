'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { CreateDisbursementForm } from '@/src/components/disbursement/CreateDisbursementForm';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
// import { CreateDisbursementForm } from '@/components/disbursement/CreateDisbursementForm';
// import { ProtectedRoute } from '@/components/ProtectedRoute';

function NewDisbursementContent() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => router.back()}>
                ← Back
              </Button>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                New Disbursement Request
              </h1>
              <p className="mt-2 text-muted-foreground">
                Fill out the form below to create a new disbursement request
              </p>
            </div>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-8">
          <CreateDisbursementForm
            onSuccess={() => {
              router.push('/disbursements');
            }}
          />
        </div>
      </section>
    </main>
  );
}

export default function NewDisbursementPage() {
  return (
    <ProtectedRoute>
      <NewDisbursementContent />
    </ProtectedRoute>
  );
}
