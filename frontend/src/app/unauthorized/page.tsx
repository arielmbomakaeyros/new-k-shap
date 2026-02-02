'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🚫</div>
        <h1 className="text-4xl font-bold text-foreground">Access Denied</h1>
        <p className="text-lg text-muted-foreground">
          You don't have permission to access this resource. If you believe this is an error, please
          contact your administrator.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
