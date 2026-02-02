'use client';

import { useTranslation } from '@/node_modules/react-i18next';
// import { SignupForm } from '@/components/auth/SignupForm';
import Link from 'next/link';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { SignupForm } from '@/src/components/auth/SignupForm';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function SignupPage() {
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
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
          <h1 className="text-2xl font-bold text-foreground">{t('auth.signup')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.haveAccount')}{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              {t('auth.login')}
            </Link>
          </p>

          <div className="mt-8">
            <SignupForm />
          </div>
        </div>
      </div>
    </main>
  );
}
