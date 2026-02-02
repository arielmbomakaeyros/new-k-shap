'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">K-shap</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/auth/login">
              <Button variant="outline">{t('auth.login')}</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {t('common.welcome')}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Manage your enterprise disbursements and cash inflows with ease. K-shap provides a comprehensive platform for
          financial tracking and approval workflows.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/auth/signup">
            <Button size="lg">{t('auth.signup')}</Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">
              {t('auth.login')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Preview */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-8">
            <h3 className="text-xl font-semibold text-foreground">{t('navigation.disbursements')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Track and manage disbursements with multi-step approval workflows and role-based access control.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-8">
            <h3 className="text-xl font-semibold text-foreground">{t('navigation.collections')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Monitor cash inflows from various sources with detailed tracking and documentation.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-8">
            <h3 className="text-xl font-semibold text-foreground">{t('navigation.reports')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate comprehensive reports and export data for financial analysis and auditing.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>K-shap © 2024. {t('common.welcome')}</p>
        </div>
      </footer>
    </main>
  );
}
