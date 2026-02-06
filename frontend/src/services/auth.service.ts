// import { api } from '@/lib/axios';
import axiosClient, { api } from '../lib/axios';
import type { ApiResponse, User } from './types';
import { uploadMultipart } from './upload.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface SetPasswordDto {
  token: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferredLanguage?: string;
  notificationPreferences?: {
    email?: boolean;
    inApp?: boolean;
    disbursementCreated?: boolean;
    disbursementValidated?: boolean;
    disbursementRejected?: boolean;
    disbursementCompleted?: boolean;
    chatMessages?: boolean;
    systemAlerts?: boolean;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: string;
}

class AuthService {
  private basePath = '/auth';

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return api.post<ApiResponse<LoginResponse>>(`${this.basePath}/login`, credentials);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`${this.basePath}/logout`);
  }

  /**
   * Refresh access token
   */
  async refresh(data: RefreshTokenDto): Promise<ApiResponse<RefreshResponse>> {
    return api.post<ApiResponse<RefreshResponse>>(`${this.basePath}/refresh`, data);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return api.get<ApiResponse<User>>(`${this.basePath}/profile`);
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileDto): Promise<ApiResponse<User>> {
    return api.patch<ApiResponse<User>>(`${this.basePath}/profile`, data);
  }

  /**
   * Update current user avatar
   */
  async updateProfileAvatar(file: File): Promise<ApiResponse<User>> {
    return uploadMultipart<ApiResponse<User>>(`${this.basePath}/profile/avatar`, file);
  }

  /**
   * Set password for first-time login
   */
  async setPassword(data: SetPasswordDto): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`${this.basePath}/set-password`, data);
  }

  /**
   * Change password for logged-in user
   */
  async changePassword(data: ChangePasswordDto): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`${this.basePath}/change-password`, data);
  }

  /**
   * Request password reset email
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`${this.basePath}/forgot-password`, data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordDto): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`${this.basePath}/reset-password`, data);
  }
}

export const authService = new AuthService();
