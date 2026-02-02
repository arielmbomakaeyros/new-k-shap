import { API_BASE_URL } from './utils';

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
}

/**
 * Refresh the access token using the refresh token
 * This should be called when the access token expires
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
}

/**
 * Logout user by clearing all auth data
 */
export function logout() {
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage'); // Zustand store key
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
