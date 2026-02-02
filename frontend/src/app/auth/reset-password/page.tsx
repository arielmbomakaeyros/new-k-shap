'use client';

import { useTranslation } from '@/node_modules/react-i18next';
// import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { useSearchParams, useRouter } from 'next/navigation';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { Suspense } from 'react';
import Loading from './loading';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { PasswordResetForm } from '@/src/components/auth/PasswordResetForm';

function ResetPasswordContent({ router }: { router: ReturnType<typeof useRouter> }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div>
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Invalid reset link. Please request a new password reset.
        </div>
        <Link href="/auth/forgot-password" className="mt-4 block text-center text-primary hover:underline">
          Back to Password Reset
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter your new password below.</p>

      <div className="mt-8">
        <PasswordResetForm token={token} onSuccess={() => router.push('/auth/login')} />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();

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
          <Suspense fallback={<Loading />}>
            <ResetPasswordContent router={router} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
