'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/src/components/ui/PasswordInput';
import { useApi } from '@/src/hooks/useApi';
// import { useApi } from '@/hooks/useApi';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

interface PasswordResetFormProps {
  token: string;
  onSuccess?: () => void;
}

export function PasswordResetForm({ token, onSuccess }: PasswordResetFormProps) {
  const { t } = useTranslation();
  const { fetchAPI } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchAPI('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
        Password has been reset successfully. You can now log in with your new password.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          label={t('auth.password')}
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
        {isLoading ? t('common.loading') : 'Reset Password'}
      </Button>
    </form>
  );
}
