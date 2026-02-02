'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { fetchAPI } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchAPI('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: data.email }),
      });

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
        Check your email for password reset instructions. If you don't see the email within a few minutes, check your
        spam folder.
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
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          {t('auth.email')}
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="you@example.com"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('common.loading') : 'Send Reset Link'}
      </Button>
    </form>
  );
}
