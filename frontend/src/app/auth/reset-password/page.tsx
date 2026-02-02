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
import { ThemeSwitcher } from '@/components/theme-switcher';
import { motion } from 'framer-motion';

function ResetPasswordContent({ router }: { router: ReturnType<typeof useRouter> }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div>
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {t('auth.invalidResetLink', { defaultValue: 'Invalid reset link. Please request a new password reset.' })}
        </div>
        <Link href="/auth/forgot-password" className="mt-4 block text-center text-primary hover:underline cursor-pointer">
          {t('auth.backToPasswordReset', { defaultValue: 'Back to Password Reset' })}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t('auth.resetPassword')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('auth.enterNewPassword', { defaultValue: 'Enter your new password below.' })}</p>

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
    <PublicLayout>
      <div className="flex flex-grow items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md rounded-xl border border-border bg-card/50 backdrop-blur-lg p-8 shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Suspense fallback={<Loading />}>
            <ResetPasswordContent router={router} />
          </Suspense>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
