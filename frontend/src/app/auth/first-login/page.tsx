'use client';

import { useTranslation } from '@/node_modules/react-i18next';
// import { FirstLoginPasswordChange } from '@/components/auth/FirstLoginPasswordChange';
import { useSearchParams } from 'next/navigation';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Suspense } from 'react';
import Loading from './loading';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { FirstLoginPasswordChange } from '@/src/components/auth/FirstLoginPasswordChange';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { motion } from 'framer-motion';

const token = useSearchParams().get('token');

export default function FirstLoginPage() {
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
          <Suspense fallback={<Loading />}>
            <div>
              <h1 className="text-3xl font-bold text-foreground text-center">{t('common.welcomeSimple')}</h1>
              <p className="mt-2 text-md text-muted-foreground text-center">
                {t('auth.completeAccountSetup', { defaultValue: 'Complete your account setup by choosing a password.' })}
              </p>

              <div className="mt-8">
                <FirstLoginPasswordChange token={token || undefined} />
              </div>
            </div>
          </Suspense>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
