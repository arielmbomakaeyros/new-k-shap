'use client';

import { useTranslation } from '@/node_modules/react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/src/store/authStore';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';
// import { ProtectedRoute } from '@/components/ProtectedRoute';
// import { useAuthStore } from '@/store/authStore';

function DashboardContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-primary">K-shap</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</span>
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {t('navigation.logout')}
            </Button>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{t('navigation.dashboard')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold">{user?.firstName} {user?.lastName}</span>! You're logged in as{' '}
            <span className="font-semibold">{user?.systemRoles?.[0]?.replace(/_/g, ' ')}</span>.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">{t('navigation.disbursements')}</div>
            <div className="mt-2 text-3xl font-bold text-foreground">0</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">{t('navigation.collections')}</div>
            <div className="mt-2 text-3xl font-bold text-foreground">$0</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Pending Approvals</div>
            <div className="mt-2 text-3xl font-bold text-foreground">0</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Users</div>
            <div className="mt-2 text-3xl font-bold text-foreground">0</div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <button
            onClick={() => router.push('/disbursements')}
            className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
          >
            <h3 className="text-lg font-semibold text-foreground">{t('navigation.disbursements')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage and track disbursements with approval workflows.
            </p>
            <Button className="mt-4 bg-transparent" variant="outline" size="sm">
              View
            </Button>
          </button>

          <button
            onClick={() => router.push('/collections')}
            className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
          >
            <h3 className="text-lg font-semibold text-foreground">{t('navigation.collections')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">Track incoming payments and cash inflows.</p>
            <Button className="mt-4 bg-transparent" variant="outline" size="sm">
              View
            </Button>
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
          >
            <h3 className="text-lg font-semibold text-foreground">{t('navigation.settings')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">Configure company settings and permissions.</p>
            <Button className="mt-4 bg-transparent" variant="outline" size="sm">
              View
            </Button>
          </button>
        </div>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
