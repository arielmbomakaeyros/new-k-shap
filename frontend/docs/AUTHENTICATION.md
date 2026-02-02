# Authentication System Documentation

## Overview

K-shap implements a complete JWT-based authentication system with token refresh, password recovery, and first-login password change flows.

## Features

- ✅ Email/Password authentication
- ✅ JWT access and refresh tokens
- ✅ Automatic token refresh on expiration
- ✅ Password recovery via email
- ✅ First-time password change requirement
- ✅ Protected routes
- ✅ Role-based access control

## Authentication Flow

### 1. Registration (Signup)

**Route**: `POST /auth/signup`

Creates a new company and user account. The user becomes the company owner (super admin).

```typescript
// Request
{
  email: string
  password: string
  firstName: string
  lastName: string
  companyName: string
}

// Response
{
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    name: string
    role: string        // "company_owner"
    companyId: string
  }
}
```

**Frontend**: `/src/app/auth/signup`

### 2. Login

**Route**: `POST /auth/login`

Authenticates a user with email and password.

```typescript
// Request
{
  email: string
  password: string
}

// Response
{
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    name: string
    role: string
    companyId: string
  }
}
```

**Frontend**: `/src/app/auth/login`

### 3. Token Storage

After successful login:
- **Access Token** → Zustand store (`useAuthStore`)
- **Refresh Token** → localStorage (`refreshToken` key)
- **User Data** → Zustand store with localStorage persistence

### 4. Token Refresh

**Route**: `POST /auth/refresh`

Automatically called when access token expires (401 response).

```typescript
// Request
{
  refreshToken: string
}

// Response
{
  access_token: string
  refresh_token?: string  // Optional, may rotate
}
```

**Implementation**: `src/lib/auth.ts` → `refreshAccessToken()`

### 5. Password Recovery

**Route (Step 1)**: `POST /auth/forgot-password`

Sends password reset link via email.

```typescript
// Request
{
  email: string
}

// Response
{
  message: "Reset link sent to email"
}
```

**Route (Step 2)**: `POST /auth/reset-password`

Validates reset token and sets new password.

```typescript
// Request
{
  token: string
  password: string
}

// Response
{
  message: "Password reset successfully"
}
```

**Frontend**: 
- Forgot password form: `/src/app/auth/forgot-password`
- Reset page (with token): `/src/app/auth/reset-password?token=...`

### 6. First Login Password Change

**Route**: `POST /auth/change-password-first-login`

When a super admin creates a new user, they receive a temporary password. On first login, they must change it.

```typescript
// Request
{
  userId: string
  token: string
  password: string
}

// Response
{
  message: "Password changed successfully"
  canLogin: true
}
```

**Frontend**: `/src/app/auth/first-login?token=...`

### 7. Logout

**Route**: `POST /auth/logout` (Optional)

Invalidates tokens on the backend (for added security).

**Frontend Implementation**:
```typescript
const { logout } = useAuthStore();
logout(); // Clears local state
router.push('/auth/login');
```

## Component Structure

### Auth Forms

```
src/components/auth/
├── LoginForm.tsx                    # Login form with validation
├── SignupForm.tsx                   # Signup form with validation
├── ForgotPasswordForm.tsx           # Request password reset
├── PasswordResetForm.tsx            # Set new password with token
└── FirstLoginPasswordChange.tsx     # First login password change
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute requiredRoles={['validator']}>
      <MyContent />
    </ProtectedRoute>
  );
}
```

## State Management

### useAuthStore (Zustand)

```typescript
import { useAuthStore } from '@/store/authStore';

const {
  user,              // Current user object
  token,             // Access token
  isLoading,         // Loading state
  error,             // Error message
  setUser,           // Set user
  setToken,          // Set token
  setIsLoading,      // Set loading state
  setError,          // Set error
  logout             // Logout user
} = useAuthStore();
```

**Storage Key**: `auth-storage` (persisted with Zustand middleware)

## API Integration

### useApi Hook

All API calls should use the `useApi` hook, which automatically includes the auth token:

```typescript
import { useApi } from '@/hooks/useApi';

const { fetchAPI } = useApi();

// Automatically adds Authorization header
const data = await fetchAPI('/endpoint', {
  method: 'POST',
  body: JSON.stringify({ ... })
});
```

### Token Refresh Interceptor

The `setupTokenRefresh()` function in `src/lib/auth.ts` creates a global fetch interceptor that:
1. Detects 401 responses
2. Attempts to refresh the token
3. Retries the original request
4. Redirects to login if refresh fails

**Initialization**: Called in `AuthInitializer` component

## Validation

All forms use:
- **React Hook Form** for form state management
- **Zod** for schema validation
- **Custom error messages** via i18n

Example validation schema:

```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
```

## Error Handling

Errors are caught and displayed to users:

```typescript
try {
  await fetchAPI('/endpoint');
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
}
```

Backend should return errors as:

```typescript
{
  statusCode: 401,
  message: "Invalid credentials",
  error: "Unauthorized"
}
```

## Security Considerations

1. **Token Storage**
   - Access token: Zustand store (memory)
   - Refresh token: localStorage (persisted, but can be cleared)
   
2. **HTTPS Only** (Production)
   - All API requests must use HTTPS
   - Refresh token should be HTTP-only cookie (backend configuration)

3. **CORS Configuration**
   - Backend must allow requests from frontend domain
   - Credentials must be included in requests

4. **Token Expiration**
   - Access token: Short-lived (15 minutes recommended)
   - Refresh token: Long-lived (7 days recommended)

5. **Password Requirements**
   - Minimum 8 characters
   - Should include uppercase, lowercase, numbers (backend validation)
   - Never store plaintext (backend must hash with bcrypt)

## Backend Requirements

The backend API must implement:

### Endpoints

```
POST   /auth/signup                          ✅ Create company and user
POST   /auth/login                           ✅ Login user
POST   /auth/refresh                         ✅ Refresh token
POST   /auth/logout                          ✅ Logout user
POST   /auth/forgot-password                 ✅ Request password reset
POST   /auth/reset-password                  ✅ Reset password with token
POST   /auth/change-password-first-login     ✅ Change password first time
```

### User Schema (MongoDB)

```typescript
{
  _id: ObjectId
  email: string (unique, lowercase)
  passwordHash: string (bcrypt)
  firstName: string
  lastName: string
  name: string (firstName + lastName)
  role: enum (from UserRole)
  companyId: ObjectId (ref: Company)
  departmentId?: ObjectId
  permissions: string[]
  canLogin: boolean (false until first password change)
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Company Schema (MongoDB)

```typescript
{
  _id: ObjectId
  name: string
  email: string
  owner: ObjectId (ref: User)
  subscriptionStatus: enum
  subscriptionEndDate?: Date
  features: string[]
  createdAt: Date
  updatedAt: Date
}
```

## Testing

### Test Email/Password
```
Email: test@example.com
Password: TestPassword123
Company: Test Company
```

### Test Flows
1. ✅ Signup with new company
2. ✅ Login with credentials
3. ✅ Logout and redirect to login
4. ✅ Token refresh on 401
5. ✅ Forgot password email
6. ✅ Reset password with token
7. ✅ Protected routes redirect to login

## Troubleshooting

### "No access_token in response"
- Check backend login endpoint returns correct response format
- Verify token is being sent in response body

### "Token refresh loop"
- Check refresh token validity
- Verify refresh endpoint returns new tokens
- Check token expiration times

### "Stuck on login page"
- Check localStorage for `refreshToken`
- Verify `auth-storage` in localStorage
- Check network tab for failed API calls
- Verify CORS configuration on backend

### "Protected routes not working"
- Ensure token is in Zustand store
- Check `ProtectedRoute` component wrapping
- Verify `useAuthStore` is persisted

## Next Steps

1. Implement backend endpoints (NestJS)
2. Configure email service for password reset
3. Add email verification flow
4. Implement rate limiting on login attempts
5. Add two-factor authentication
6. Create password reset email template

## Related Files

- `/src/store/authStore.ts` - Auth state management
- `/src/lib/auth.ts` - Token refresh and utilities
- `/src/hooks/useApi.ts` - API request wrapper
- `/src/components/ProtectedRoute.tsx` - Route protection
- `/src/app/auth/*` - Auth pages
