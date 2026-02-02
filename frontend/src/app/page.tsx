'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PublicLayout } from '@/src/components/layout/PublicLayout';

export default function Home() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <motion.h2
          className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl leading-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t('common.welcome')}
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-3xl text-xl text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {t('common.homeDescription', { defaultValue: 'Manage your enterprise disbursements and cash inflows with ease. K-shap provides a comprehensive platform for financial tracking and approval workflows.' })}
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col gap-6 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link href="/auth/signup" className="cursor-pointer">
            <Button size="lg">{t('auth.signup')}</Button>
          </Link>
          <Link href="/auth/login" className="cursor-pointer">
            <Button size="lg" variant="outline">
              {t('auth.login')}
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Preview */}
      <motion.section
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 bg-card/50 backdrop-blur-lg rounded-xl shadow-lg border border-card/20 my-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-8 md:grid-cols-3">
          <motion.div className="rounded-lg border border-border bg-card p-8" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-foreground">{t('navigation.disbursements')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('common.disbursementsDescription', { defaultValue: 'Track and manage disbursements with multi-step approval workflows and role-based access control.' })}
            </p>
          </motion.div>

          <motion.div className="rounded-lg border border-border bg-card p-8" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-foreground">{t('navigation.collections')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('common.collectionsDescription', { defaultValue: 'Monitor cash inflows from various sources with detailed tracking and documentation.' })}
            </p>
          </motion.div>

          <motion.div className="rounded-lg border border-border bg-card p-8" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-foreground">{t('navigation.reports')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('common.reportsDescription', { defaultValue: 'Generate comprehensive reports and export data for financial analysis and auditing.' })}
            </p>
          </motion.div>
        </div>
      </motion.section>
    </PublicLayout>
  );
}
