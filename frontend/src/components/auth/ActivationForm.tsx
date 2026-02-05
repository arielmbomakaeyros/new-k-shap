'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/src/components/ui/PasswordInput';

const activationSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ActivationFormData = z.infer<typeof activationSchema>;

interface ActivationFormProps {
  token: string;
  onSuccess?: () => void;
}

export function ActivationForm({ token, onSuccess }: ActivationFormProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivationFormData>({
    resolver: zodResolver(activationSchema),
  });

  const onSubmit = async (data: ActivationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.message || 'Account activation failed');
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account activation failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
        Your account has been activated successfully. You can now log in.
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
          label={t('auth.newPassword', { defaultValue: 'New Password' })}
          error={errors.password?.message?.toString()}
          {...register('password')}
        />
      </div>

      <div>
        <PasswordInput
          id="confirmPassword"
          placeholder="••••••••"
          className="mt-1"
          label={t('auth.confirmPassword', { defaultValue: 'Confirm Password' })}
          error={errors.confirmPassword?.message?.toString()}
          {...register('confirmPassword')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('common.loading', { defaultValue: 'Loading...' }) : 'Activate Account'}
      </Button>
    </form>
  );
}
