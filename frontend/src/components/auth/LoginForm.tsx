'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { useLogin } from '@/src/hooks/queries';
// import { useLogin } from '@/hooks/queries/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { t } = useTranslation();
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    login({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error.message || 'Login failed'}
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
          disabled={isPending}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          {t('auth.password')}
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          placeholder="••••••••"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          disabled={isPending}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t('common.loading') : t('auth.login')}
      </Button>
    </form>
  );
}
