'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/src/components/auth/ForgotPasswordForm';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="flex flex-grow items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md rounded-xl border border-border bg-card/50 backdrop-blur-lg p-8 shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-foreground text-center">{t('auth.resetPassword')}</h1>
          <p className="mt-2 text-md text-muted-foreground text-center">
            {t('auth.rememberPassword')}{' '}
            <Link href="/auth/login" className="text-primary hover:underline cursor-pointer">
              {t('auth.login')}
            </Link>
          </p>

          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
