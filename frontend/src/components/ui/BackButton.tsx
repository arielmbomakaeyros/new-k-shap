'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallbackUrl = '/dashboard',
  label = 'Retour',
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Try to go back in history, or fallback to provided URL
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`gap-1 text-muted-foreground hover:text-foreground ${className}`}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
