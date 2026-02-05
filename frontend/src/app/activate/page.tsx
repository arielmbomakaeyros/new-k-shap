'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import Loading from './loading';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import { ActivationForm } from '@/src/components/auth/ActivationForm';
import { motion } from 'framer-motion';

function ActivateContent({ router }: { router: ReturnType<typeof useRouter> }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div>
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {t('auth.invalidActivationLink', { defaultValue: 'Invalid activation link. Please request a new activation email.' })}
        </div>
        <Link href="/auth/login" className="mt-4 block text-center text-primary hover:underline cursor-pointer">
          {t('auth.backToLogin', { defaultValue: 'Back to Login' })}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t('auth.activateAccount', { defaultValue: 'Activate Your Account' })}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('auth.setPasswordToActivate', { defaultValue: 'Set your password to activate your account.' })}
      </p>

      <div className="mt-8">
        <ActivationForm token={token} onSuccess={() => router.push('/auth/login')} />
      </div>
    </div>
  );
}

export default function ActivatePage() {
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
            <ActivateContent router={router} />
          </Suspense>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
