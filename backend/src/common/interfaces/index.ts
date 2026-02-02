import { Request } from 'express';
import { User } from '../../database/schemas/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  company?: string;
  isKaeyrosUser: boolean;
  systemRoles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: User & {
    _id: string;
    permissions?: string[];
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface AuditLogData {
  user: string;
  company?: string;
  action: string;
  actionDescription: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface EmailData {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

export interface NotificationData {
  user: string;
  company: string;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface SocketUserData {
  userId: string;
  companyId: string;
  socketId: string;
  rooms: string[];
}

export interface FilterQuery {
  search?: string;
  status?: string;
  department?: string;
  office?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}
