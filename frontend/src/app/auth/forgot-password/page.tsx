'use client';

import { useTranslation } from '@/node_modules/react-i18next';
// import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { ForgotPasswordForm } from '@/src/components/auth/ForgotPasswordForm';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ForgotPasswordPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              {t('auth.login')}
            </Link>
          </p>

          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </main>
  );
}
