'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import Link from 'next/link';
import { LoginForm } from '@/src/components/auth/LoginForm';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="flex flex-grow items-center justify-center px-4 py-12">
        <motion.div
          className="glass-card w-full max-w-md rounded-xl p-8 glow-primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold gradient-text text-center">{t('auth.login')}</h1>
          <p className="mt-2 text-md text-muted-foreground text-center">
            {t('auth.noAccount')}{' '}
            <Link href="/auth/signup" className="text-primary hover:underline cursor-pointer">
              {t('auth.signup')}
            </Link>
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/auth/forgot-password" className="text-primary hover:underline cursor-pointer">
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
