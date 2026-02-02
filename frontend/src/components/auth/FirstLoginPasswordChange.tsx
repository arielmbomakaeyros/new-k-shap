'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/src/components/ui/PasswordInput';
// import { useApi } from '@/hooks/useApi';
// import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useApi } from '@/src/hooks/useApi';
import { useAuthStore } from '@/src/store/authStore';

const passwordChangeSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

interface FirstLoginPasswordChangeProps {
  token?: string;
}

export function FirstLoginPasswordChange({ token }: FirstLoginPasswordChangeProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { fetchAPI } = useApi();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = async (data: PasswordChangeData) => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchAPI('/auth/change-password-first-login', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          token,
          password: data.password,
        }),
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
        Welcome! This is your first login. Please set a new password to continue.
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          className="mt-1"
          label={t('auth.newPassword')}
          error={errors.password?.message?.toString()}
          {...register('password')}
        />
      </div>

      <div>
        <PasswordInput
          id="confirmPassword"
          placeholder="••••••••"
          className="mt-1"
          label={t('auth.confirmPassword')}
          error={errors.confirmPassword?.message?.toString()}
          {...register('confirmPassword')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('common.loading') : 'Set Password & Continue'}
      </Button>
    </form>
  );
}
