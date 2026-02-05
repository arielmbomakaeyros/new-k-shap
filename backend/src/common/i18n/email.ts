import { DEFAULT_LANGUAGE, Language, normalizeLanguage } from './language';

export function getEmailSubject(template: string, language?: string): string {
  const lang = normalizeLanguage(language) || DEFAULT_LANGUAGE;

  const subjects: Record<Language, Record<string, string>> = {
    fr: {
      welcome: 'Bienvenue sur K-shap - Activez votre compte',
      'password-reset': 'Reinitialisation du mot de passe',
      'user-activation': 'K-shap - Activez votre compte',
      'disbursement-pending': 'Decaissement en attente de votre action',
      'disbursement-approved': 'Decaissement approuve',
      'disbursement-rejected': 'Decaissement rejete',
      'disbursement-completed': 'Decaissement termine',
      'kaeyros-intervention': 'Notification intervention Kaeyros',
      'account-deactivated': 'Compte desactive',
      'account-reactivated': 'Compte reactive',
      'company-deactivated': 'Compte entreprise desactive',
      'company-reactivated': 'Compte entreprise reactive',
      reminder: 'Rappel: Decaissement en attente',
      default: 'Notification K-shap',
    },
    en: {
      welcome: 'Welcome to K-shap - Activate Your Account',
      'password-reset': 'Password Reset Request',
      'user-activation': 'K-shap - Activate Your Account',
      'disbursement-pending': 'Disbursement Pending Your Action',
      'disbursement-approved': 'Disbursement Approved',
      'disbursement-rejected': 'Disbursement Rejected',
      'disbursement-completed': 'Disbursement Completed',
      'kaeyros-intervention': 'Kaeyros Support Intervention Notice',
      'account-deactivated': 'Account Deactivated',
      'account-reactivated': 'Account Reactivated',
      'company-deactivated': 'Company Account Deactivated',
      'company-reactivated': 'Company Account Reactivated',
      reminder: 'Reminder: Disbursement Awaiting Your Action',
      default: 'K-shap Notification',
    },
  };

  return subjects[lang][template] || subjects[lang].default;
}
