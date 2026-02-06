'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
import { Button } from '@/components/ui/button';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useProfile, useUpdateProfile, useUpdateProfileAvatar } from '@/src/hooks/queries';

type NotificationPrefs = {
  email?: boolean;
  inApp?: boolean;
  disbursementCreated?: boolean;
  disbursementValidated?: boolean;
  disbursementRejected?: boolean;
  disbursementCompleted?: boolean;
  chatMessages?: boolean;
  systemAlerts?: boolean;
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateProfileAvatar();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredLanguage: 'fr',
    notificationPreferences: {
      email: true,
      inApp: true,
      disbursementCreated: true,
      disbursementValidated: true,
      disbursementRejected: true,
      disbursementCompleted: true,
      chatMessages: true,
      systemAlerts: true,
    } as NotificationPrefs,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      preferredLanguage: profile.preferredLanguage || 'fr',
      notificationPreferences: {
        email: profile.notificationPreferences?.email ?? true,
        inApp: profile.notificationPreferences?.inApp ?? true,
        disbursementCreated: profile.notificationPreferences?.disbursementCreated ?? true,
        disbursementValidated: profile.notificationPreferences?.disbursementValidated ?? true,
        disbursementRejected: profile.notificationPreferences?.disbursementRejected ?? true,
        disbursementCompleted: profile.notificationPreferences?.disbursementCompleted ?? true,
        chatMessages: profile.notificationPreferences?.chatMessages ?? true,
        systemAlerts: profile.notificationPreferences?.systemAlerts ?? true,
      },
    });
  }, [profile]);

  const supportedLanguages =
    (profile as any)?.company?.supportedLanguages?.length
      ? (profile as any).company.supportedLanguages
      : ['fr', 'en'];

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || undefined,
      preferredLanguage: form.preferredLanguage,
      notificationPreferences: form.notificationPreferences,
    });
  };

  const handleAvatarChange = async (file?: File) => {
    if (!file) return;
    await updateAvatar.mutateAsync(file);
  };

  if (isLoading) {
    return (
      <ProtectedLayout title={t('profile.title', { defaultValue: 'Profile' })}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">{t('common.loading', { defaultValue: 'Loading...' })}</span>
        </div>
      </ProtectedLayout>
    );
  }

  if (error || !profile) {
    return (
      <ProtectedLayout title={t('profile.title', { defaultValue: 'Profile' })}>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{t('profile.loadFailed', { defaultValue: 'Failed to load profile. Please try again.' })}</p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('profile.title', { defaultValue: 'Profile' })}>
        <div className="mx-auto max-w-3xl space-y-8 p-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">{t('profile.basic', { defaultValue: 'Basic Information' })}</h2>
            <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-full border border-border bg-muted">
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updateAvatar.isPending}
                  >
                    {updateAvatar.isPending
                      ? t('profile.uploading', { defaultValue: 'Uploading...' })
                      : t('profile.changeAvatar', { defaultValue: 'Change Avatar' })}
                  </Button>
                </div>
              </div>
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('users.firstName', { defaultValue: 'First Name' })}
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('users.lastName', { defaultValue: 'Last Name' })}
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('users.email', { defaultValue: 'Email' })}
                  value={form.email}
                  disabled
                />
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('users.phone', { defaultValue: 'Phone' })}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">{t('profile.preferences', { defaultValue: 'Preferences' })}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">{t('profile.language', { defaultValue: 'Preferred Language (emails & backend messages)' })}</label>
                <select
                  value={form.preferredLanguage}
                  onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  {supportedLanguages.map((lang: string) => (
                    <option key={lang} value={lang}>
                      {lang === 'fr' ? 'Français' : 'English'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">{t('profile.notifications', { defaultValue: 'Notifications' })}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { key: 'email', label: t('settings.channels.email', { defaultValue: 'Email' }) },
                { key: 'inApp', label: t('settings.channels.inApp', { defaultValue: 'In-App' }) },
                { key: 'disbursementCreated', label: t('disbursements.created', { defaultValue: 'Disbursement Created' }) },
                { key: 'disbursementValidated', label: t('disbursements.validated', { defaultValue: 'Disbursement Validated' }) },
                { key: 'disbursementRejected', label: t('disbursements.rejected', { defaultValue: 'Disbursement Rejected' }) },
                { key: 'disbursementCompleted', label: t('disbursements.completed', { defaultValue: 'Disbursement Completed' }) },
                { key: 'chatMessages', label: t('profile.chatMessages', { defaultValue: 'Chat Messages' }) },
                { key: 'systemAlerts', label: t('profile.systemAlerts', { defaultValue: 'System Alerts' }) },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!(form.notificationPreferences as any)[item.key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notificationPreferences: {
                          ...form.notificationPreferences,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-input"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button className='gradient-bg-primary text-white' onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? t('common.saving', { defaultValue: 'Saving...' }) : t('common.save', { defaultValue: 'Save' })}
            </Button>
          </div>
        </div>
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
