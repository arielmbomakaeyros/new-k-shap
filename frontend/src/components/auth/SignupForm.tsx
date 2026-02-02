'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/src/components/ui/PasswordInput';
// import { useAuthStore } from '@/store/authStore';
// import { useApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { useApi } from '@/src/hooks/useApi';

const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    companyName: z.string().min(2, 'Company name is required'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

export function SignupForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const { fetchAPI } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAPI<SignupResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
        }),
      });

      // Map backend user to frontend shape
      const user = {
        ...response.user,
        id: response.user._id || response.user.id,
      };

      // Store auth data using the login action (handles token + cookie)
      const { login } = useAuthStore.getState();
      login(user, response.accessToken, response.refreshToken);

      // Redirect based on user type
      if (user.isKaeyrosUser) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
            First Name
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            placeholder="John"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
            Last Name
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            placeholder="Doe"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-foreground">
          Company Name
        </label>
        <input
          {...register('companyName')}
          type="text"
          id="companyName"
          placeholder="Your Company"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-destructive">{errors.companyName.message}</p>
        )}
      </div>

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
        {isLoading ? t('common.loading') : t('auth.signup')}
      </Button>
    </form>
  );
}
