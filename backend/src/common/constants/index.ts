export const GRACE_PERIOD_DAYS = 30;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const PASSWORD_MIN_LENGTH = 8;

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  ACTIVATION_TOKEN: '24h',
  PASSWORD_RESET_TOKEN: '1h',
};

export const RATE_LIMIT = {
  DEFAULT_TTL: 60,
  DEFAULT_LIMIT: 100,
  AUTH_TTL: 60,
  AUTH_LIMIT: 10,
};

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

export const CACHE_KEYS = {
  USER_PERMISSIONS: (userId: string) => `user:${userId}:permissions`,
  COMPANY_SETTINGS: (companyId: string) => `company:${companyId}:settings`,
  COMPANY_FEATURES: (companyId: string) => `company:${companyId}:features`,
  ROLE_PERMISSIONS: (roleId: string) => `role:${roleId}:permissions`,
};

export const DEFAULT_FEATURES = {
  disbursements: true,
  collections: true,
  chat: true,
  notifications: true,
  emailNotifications: true,
  reports: true,
  multiCurrency: false,
  apiAccess: false,
};

export const NOTIFICATION_TYPES = {
  DISBURSEMENT_CREATED: 'disbursement_created',
  DISBURSEMENT_PENDING_VALIDATION: 'disbursement_pending_validation',
  DISBURSEMENT_PENDING_APPROVAL: 'disbursement_pending_approval',
  DISBURSEMENT_PENDING_EXECUTION: 'disbursement_pending_execution',
  DISBURSEMENT_COMPLETED: 'disbursement_completed',
  DISBURSEMENT_REJECTED: 'disbursement_rejected',
  CHAT_MESSAGE: 'chat_message',
  SYSTEM_ALERT: 'system_alert',
  REMINDER: 'reminder',
  KAEYROS_INTERVENTION: 'kaeyros_intervention',
};

export const SOCKET_EVENTS = {
  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // Disbursements
  DISBURSEMENT_CREATED: 'disbursement:created',
  DISBURSEMENT_UPDATED: 'disbursement:updated',
  DISBURSEMENT_STATUS_CHANGED: 'disbursement:status_changed',

  // Chat
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  CHAT_READ: 'chat:read',

  // User
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_INACTIVE: 'Account is inactive',
  COMPANY_SUSPENDED: 'Company account is suspended',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  COMPANY_ACCESS_DENIED: 'You do not have access to this company data',
};
