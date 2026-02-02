'use client';

import { useTranslation } from '@/node_modules/react-i18next';
// import { FirstLoginPasswordChange } from '@/components/auth/FirstLoginPasswordChange';
import { useSearchParams } from 'next/navigation';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Suspense } from 'react';
import Loading from './loading';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { FirstLoginPasswordChange } from '@/src/components/auth/FirstLoginPasswordChange';

export default function FirstLoginPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-primary">K-shap</h1>
          <LanguageSwitcher />
        </nav>
      </header>

      <div className="flex min-h-screen items-center justify-center px-4">
        <Suspense fallback={<Loading />}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete your account setup by choosing a password.
            </p>

            <div className="mt-8">
              <FirstLoginPasswordChange token={token || undefined} />
            </div>
          </div>
        </Suspense>
      </div>
    </main>
  );
}

const token = useSearchParams().get('token');
