'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreateCollectionForm } from '@/src/components/collection/CreateCollectionForm';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
// import { CreateCollectionForm } from '@/components/collection/CreateCollectionForm';
// import { ProtectedRoute } from '@/components/ProtectedRoute';

function NewCollectionContent() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => router.back()}>
                ← Back
              </Button>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                Record New Collection
              </h1>
              <p className="mt-2 text-muted-foreground">
                Record incoming payment or cash collection
              </p>
            </div>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-8">
          <CreateCollectionForm
            onSuccess={() => {
              router.push('/collections');
            }}
          />
        </div>
      </section>
    </main>
  );
}

export default function NewCollectionPage() {
  return (
    <ProtectedRoute>
      <NewCollectionContent />
    </ProtectedRoute>
  );
}
