# K-shap Frontend Authentication & Authorization Analysis                                                                                                          
                                                                                                                                                                      
   ## 1. AUTHENTICATION FLOW                                                                                                                                          
                                                                                                                                                                      
   ### Login Pages                                                                                                                                                    
   - **Main Login**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/auth/login/page.tsx` (Lines 1-46)                                               
     - Single login page for all users (no separate login for SaaS owner vs tenants)                                                                                  
     - Uses LoginForm component                                                                                                                                       
     - Language switcher included                                                                                                                                     
     - Links to signup and forgot password pages                                                                                                                      
                                                                                                                                                                      
   ### Login Components                                                                                                                                               
   - **LoginForm**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/components/auth/LoginForm.tsx` (Lines 1-84)                                          
     - Email and password validation (Zod schema)                                                                                                                     
     - Calls `useLogin()` hook                                                                                                                                        
     - Shows error messages                                                                                                                                           
     - Uses react-hook-form for form handling                                                                                                                         
                                                                                                                                                                      
   ### Auth Service Layer                                                                                                                                             
   - **AuthService**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/services/auth.service.ts` (Lines 1-105)                                            
     - `login(credentials)`: POST to `/auth/login` - expects to receive `{user, access_token, refresh_token}`                                                         
     - `logout()`: POST to `/auth/logout`                                                                                                                             
     - `getProfile()`: GET from `/auth/profile`                                                                                                                       
     - `setPassword()`: POST to `/auth/set-password` (first-time login)                                                                                               
     - `changePassword()`: POST to `/auth/change-password`                                                                                                            
     - `forgotPassword()`: POST to `/auth/forgot-password`                                                                                                            
     - `resetPassword()`: POST to `/auth/reset-password`                                                                                                              
                                                                                                                                                                      
   ### Auth API Proxy Routes                                                                                                                                          
   - **Login Route**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/api/auth/login/route.ts` (Lines 1-12)                                          
     - Proxies POST requests to backend's `/auth/login`                                                                                                               
   - **Refresh Route**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/api/auth/refresh/route.ts` (Lines 1-11)                                      
     - Proxies POST requests to backend's `/auth/refresh`                                                                                                             
   - **Profile Route**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/api/auth/profile/route.ts` (Lines 1-11)                                      
     - Proxies GET requests to backend's `/auth/profile`                                                                                                              
   - **Logout Route**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/api/auth/logout/route.ts` (Lines 1-11)                                        
     - Proxies POST requests to backend's `/auth/logout`                                                                                                              
                                                                                                                                                                      
   ### Token Handling                                                                                                                                                 
   - **Zustand Auth Store**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/store/authStore.ts` (Lines 1-117)                                           
     - Stores `user` (User object) and `token` (access token)                                                                                                         
     - Persists to localStorage via Zustand middleware (key: `auth-storage`)                                                                                          
     - `login()` action stores user, token, and refreshToken separately                                                                                               
     - `refreshToken` stored separately in localStorage (not in Zustand)                                                                                              
     - `logout()` clears both user and token, removes refreshToken from localStorage                                                                                  
     - Provides selector hooks: `useUser()`, `useToken()`, `useIsAuthenticated()`, `useAuthLoading()`, `useAuthError()`                                               
                                                                                                                                                                      
   - **Axios Interceptor**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/lib/axios.ts` (Lines 1-184)                                                  
     - Request interceptor adds `Authorization: Bearer {token}` header                                                                                                
     - Response interceptor handles 401 errors:                                                                                                                       
       - Attempts token refresh using `/api/auth/refresh` with stored refreshToken                                                                                    
       - Queues failed requests while refreshing                                                                                                                      
       - On refresh failure, clears auth state and redirects to `/auth/login`                                                                                         
       - Uses localStorage to store/retrieve refreshToken                                                                                                             
     - Handles general API errors and transforms responses                                                                                                            
                                                                                                                                                                      
   ### Auth Initialization                                                                                                                                            
   - **AuthInitializer Component**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/components/providers/AuthInitializer.tsx` (Lines 1-33)               
     - Runs on app initialization                                                                                                                                     
     - Restores auth state from localStorage to Zustand store                                                                                                         
     - Parses `auth-storage` localStorage key                                                                                                                         
                                                                                                                                                                      
   ### Login Hook                                                                                                                                                     
   - **useLogin Hook**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/hooks/queries/useAuth.ts` (Lines 32-59)                                          
     - Mutation hook for login                                                                                                                                        
     - On success:                                                                                                                                                    
       - Stores user, token, and refreshToken to auth store                                                                                                           
       - Invalidates profile query                                                                                                                                    
       - Redirects to `/dashboard`                                                                                                                                    
     - On error: Sets error message in auth store                                                                                                                     
     - Manages loading state                                                                                                                                          
                                                                                                                                                                      
   ## 2. ROUTING STRUCTURE                                                                                                                                            
                                                                                                                                                                      
   ### Main Routes                                                                                                                                                    
   ```                                                                                                                                                                
   /                           - Home page (public)                                                                                                                   
   /auth/login                 - Login page (public)                                                                                                                  
   /auth/signup                - Signup page (public)                                                                                                                 
   /auth/forgot-password       - Forgot password page (public)                                                                                                        
   /auth/reset-password?token= - Reset password with token (public)                                                                                                   
   /auth/first-login?token=    - First-time password setup (public)                                                                                                   
   /dashboard                  - Main dashboard (protected)                                                                                                           
   /admin                      - Admin panel (super_admin only)                                                                                                       
   /company                    - Company settings dashboard (protected)                                                                                               
   /collections                - Collections list (protected)                                                                                                         
   /disbursements              - Disbursements list (protected)                                                                                                       
   /unauthorized               - Access denied page (public)                                                                                                          
   ```                                                                                                                                                                
                                                                                                                                                                      
   ### Route Structure Details                                                                                                                                        
   - **RootLayout**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/layout.tsx` (Lines 1-48)                                                        
     - Wraps entire app with `RootProvider`                                                                                                                           
     - RootProvider includes: I18nProvider → QueryProvider → AuthInitializer → children                                                                               
                                                                                                                                                                      
   ### Admin Routes (all require `super_admin` role)                                                                                                                  
   - `/admin` - Overview                                                                                                                                              
   - `/admin/companies` - Manage companies                                                                                                                            
   - `/admin/users` - Manage platform users                                                                                                                           
   - `/admin/subscriptions` - Manage subscriptions                                                                                                                    
   - `/admin/analytics` - Platform analytics                                                                                                                          
   - `/admin/logs` - System logs                                                                                                                                      
   - `/admin/settings` - Platform settings                                                                                                                            
                                                                                                                                                                      
   ### Company Routes (protected with roles: `['company_owner', 'validator', 'department_head']`)                                                                     
   - `/company` - Company dashboard                                                                                                                                   
   - `/company/users` - Manage company users                                                                                                                          
   - `/company/departments` - Manage departments                                                                                                                      
   - `/company/offices` - Manage offices                                                                                                                              
   - `/company/roles` - Configure roles & permissions                                                                                                                 
   - `/company/settings` - Company settings                                                                                                                           
   - `/company/roles/[roleId]` - Edit specific role                                                                                                                   
                                                                                                                                                                      
   ### Protected Routes                                                                                                                                               
   - `/dashboard` - Uses `ProtectedRoute` (any authenticated user)                                                                                                    
   - `/disbursements` - Uses `ProtectedRoute` (any authenticated user)                                                                                                
   - `/disbursements/new` - Create disbursement                                                                                                                       
   - `/disbursements/[id]` - View disbursement                                                                                                                        
   - `/disbursements/approvals` - Approval queue                                                                                                                      
   - `/collections` - Uses `ProtectedRoute` (any authenticated user)                                                                                                  
   - `/collections/new` - Create collection                                                                                                                           
   - `/collections/[id]` - View collection                                                                                                                            
   - `/collections/analytics` - Collection analytics                                                                                                                  
   - `/collections/reconciliation` - Bank reconciliation                                                                                                              
                                                                                                                                                                      
   ## 3. ROUTE GUARDS & MIDDLEWARE                                                                                                                                    
                                                                                                                                                                      
   ### ProtectedRoute Component                                                                                                                                       
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/components/ProtectedRoute.tsx` (Lines 1-42)                                                     
                                                                                                                                                                      
   **Functionality:**                                                                                                                                                 
   - Client-side route guard component                                                                                                                                
   - Checks for both token and user presence                                                                                                                          
   - Optionally checks for required roles via `requiredRoles` prop                                                                                                    
   - Redirects to `/auth/login` if not authenticated                                                                                                                  
   - Redirects to `/dashboard` if user lacks required role                                                                                                            
   - Returns null while redirecting (doesn't render children)                                                                                                         
                                                                                                                                                                      
   **Usage Pattern:**                                                                                                                                                 
   ```tsx                                                                                                                                                             
   <ProtectedRoute>                                                                                                                                                   
     <Content />                                                                                                                                                      
   </ProtectedRoute>                                                                                                                                                  
                                                                                                                                                                      
   // With role requirement                                                                                                                                           
   <ProtectedRoute requiredRoles={['super_admin']}>                                                                                                                   
     <AdminContent />                                                                                                                                                 
   </ProtectedRoute>                                                                                                                                                  
   ```                                                                                                                                                                
                                                                                                                                                                      
   **Limitations:**                                                                                                                                                   
   - No server-side middleware (no middleware.ts in the codebase)                                                                                                     
   - Protection is client-side only via Zustand store check                                                                                                           
   - Page may briefly show before redirect occurs                                                                                                                     
                                                                                                                                                                      
   ### Access Control Component                                                                                                                                       
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/components/access/CanAccess.tsx` (Lines 1-62)                                                   
                                                                                                                                                                      
   - Conditional rendering wrapper                                                                                                                                    
   - Checks single or multiple permissions                                                                                                                            
   - Supports `requireAll` mode (AND) vs default (OR) mode                                                                                                            
   - Can show fallback content if access denied                                                                                                                       
   - Usage: `<CanAccess permission="disbursement:create">Create Button</CanAccess>`                                                                                   
                                                                                                                                                                      
   ## 4. USER ROLES & PERMISSIONS                                                                                                                                     
                                                                                                                                                                      
   ### Role Definitions                                                                                                                                               
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/lib/permissions.ts` (Lines 1-309)                                                               
                                                                                                                                                                      
   #### Platform-Level Roles:                                                                                                                                         
   1. **super_admin** - Full platform access                                                                                                                          
      - Can manage all companies, users, subscriptions                                                                                                                
      - Access to: dashboard, disbursements, collections, admin panel, settings                                                                                       
      - All permissions granted                                                                                                                                       
                                                                                                                                                                      
   2. **company_owner** - Full company access                                                                                                                         
      - Scope: company-level                                                                                                                                          
      - Can manage company users, departments, offices, roles                                                                                                         
      - Access to: dashboard, company, disbursements, collections, analytics                                                                                          
      - Cannot access admin panel                                                                                                                                     
                                                                                                                                                                      
   #### Company-Level Roles:                                                                                                                                          
   3. **company_admin** - Company administration                                                                                                                      
      - Can manage users, departments, offices                                                                                                                        
      - Cannot edit company settings directly                                                                                                                         
      - Has audit log access                                                                                                                                          
                                                                                                                                                                      
   4. **department_head** - Department management                                                                                                                     
      - Limited to department-level operations                                                                                                                        
      - Can approve disbursements at department stage                                                                                                                 
      - Can create and view disbursements                                                                                                                             
                                                                                                                                                                      
   5. **validator** - Financial validation                                                                                                                            
      - Validates and approves disbursements                                                                                                                          
      - Can reconcile collections                                                                                                                                     
      - Analytics view only                                                                                                                                           
                                                                                                                                                                      
   6. **cashier** - Payment processing                                                                                                                                
      - Approves at cashier stage                                                                                                                                     
      - Can edit collections                                                                                                                                          
      - Limited to operational tasks                                                                                                                                  
                                                                                                                                                                      
   7. **finance_manager** - Financial oversight                                                                                                                       
      - Full financial analytics access                                                                                                                               
      - Can create and reconcile collections                                                                                                                          
      - Advanced analytics access                                                                                                                                     
                                                                                                                                                                      
   8. **employee** - Standard employee                                                                                                                                
      - Can view dashboard, create disbursement requests                                                                                                              
      - Limited to own department                                                                                                                                     
                                                                                                                                                                      
   9. **guest** - Read-only                                                                                                                                           
      - Dashboard view only                                                                                                                                           
                                                                                                                                                                      
   ### Permission Structure                                                                                                                                           
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/lib/permissions.ts` (Lines 1-191)                                                               
                                                                                                                                                                      
   Permissions organized by category:                                                                                                                                 
   - `dashboard:*` - Dashboard access and export                                                                                                                      
   - `disbursement:*` - Disbursement operations and approvals                                                                                                         
   - `collection:*` - Collection operations and reconciliation                                                                                                        
   - `company:*` - Company management                                                                                                                                 
   - `user:*` - User management                                                                                                                                       
   - `analytics:*` - Analytics access                                                                                                                                 
   - `settings:*` - Settings management                                                                                                                               
   - `admin:*` - Platform administration                                                                                                                              
   - `audit:*` - Audit log access                                                                                                                                     
                                                                                                                                                                      
   ### Permission Checking Functions                                                                                                                                  
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/lib/rbac.ts` (Lines 1-192)                                                                      
                                                                                                                                                                      
   - `hasPermission(user, permission)` - Check single permission                                                                                                      
   - `hasAnyPermission(user, permissions)` - Check if user has any of permissions                                                                                     
   - `hasAllPermissions(user, permissions)` - Check if user has all permissions                                                                                       
   - `getUserPermissions(user)` - Get all user's permissions                                                                                                          
   - `isAdmin(role)` - Check if role is admin-level                                                                                                                   
   - `isFinanceRole(role)` - Check if role is finance-related                                                                                                         
   - `isApprover(role, stage)` - Check if can approve at specific stage                                                                                               
   - `filterAccessibleItems(items, user, permission)` - Filter by company/access                                                                                      
   - `isResourceOwner(user, resource)` - Check resource ownership                                                                                                     
                                                                                                                                                                      
   ### Authorization Hook                                                                                                                                             
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/hooks/useAuthorization.ts` (Lines 1-44)                                                         
                                                                                                                                                                      
   - `useAuthorization()` hook provides:                                                                                                                              
     - `can(permission)` - Check single permission                                                                                                                    
     - `canAny(permissions)` - Check any of permissions                                                                                                               
     - `canAll(permissions)` - Check all permissions                                                                                                                  
     - `isAdmin()` - Check admin status                                                                                                                               
     - `isFinanceRole()` - Check finance role                                                                                                                         
     - `isApprover(stage)` - Check approval authority                                                                                                                 
     - `getPermissions()` - Get all permissions                                                                                                                       
     - `isAuthenticated()` - Check auth status                                                                                                                        
     - `hasRole(role)` - Check specific role                                                                                                                          
     - `hasCompanyId(id)` - Check company match                                                                                                                       
                                                                                                                                                                      
   ## 5. REDIRECT AFTER LOGIN                                                                                                                                         
                                                                                                                                                                      
   ### Login Redirect Behavior                                                                                                                                        
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/hooks/queries/useAuth.ts` (Lines 43-51)                                                         
                                                                                                                                                                      
   **All users regardless of role are redirected to `/dashboard`**                                                                                                    
                                                                                                                                                                      
   The frontend does NOT differentiate redirects by role. All authenticated users go to the same dashboard.                                                           
                                                                                                                                                                      
   - **Logic**: After successful login, `onSuccess` callback redirects to `/dashboard`                                                                                
   - **No conditional routing** based on user.role in the login hook                                                                                                  
   - **Admin users** would need to manually navigate to `/admin` after reaching dashboard                                                                             
                                                                                                                                                                      
   ### Dashboard Pages                                                                                                                                                
   - **Main Dashboard**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/dashboard/page.tsx`                                                         
     - Shows user name, role, stats                                                                                                                                   
     - Navigation cards to disbursements, collections, settings                                                                                                       
     - Wrapped in `ProtectedRoute` (no role restriction)                                                                                                              
                                                                                                                                                                      
   - **Admin Dashboard**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/admin/page.tsx`                                                            
     - Wrapped in `ProtectedRoute requiredRoles={['super_admin']}`                                                                                                    
     - Shows platform overview, stats, companies, subscriptions                                                                                                       
                                                                                                                                                                      
   - **Company Dashboard**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/company/page.tsx`                                                        
     - Wrapped in `ProtectedRoute requiredRoles={['company_owner', 'validator', 'department_head']}`                                                                  
     - Shows company settings, users, departments, offices                                                                                                            
                                                                                                                                                                      
   ## 6. PASSWORD MANAGEMENT                                                                                                                                          
                                                                                                                                                                      
   ### First-Time Login / Password Setup                                                                                                                              
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/auth/first-login/page.tsx` (Lines 1-43)                                                     
                                                                                                                                                                      
   - URL: `/auth/first-login?token=<token>`                                                                                                                           
   - Component: `FirstLoginPasswordChange`                                                                                                                            
   - Requires token from query params                                                                                                                                 
   - User sets password and is redirected to `/auth/login`                                                                                                            
                                                                                                                                                                      
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/components/auth/FirstLoginPasswordChange.tsx` (Lines 1-117)                                     
                                                                                                                                                                      
   - Calls `/auth/change-password-first-login` API endpoint                                                                                                           
   - Passes userId, token, and password                                                                                                                               
   - On success: redirects to `/dashboard`                                                                                                                            
                                                                                                                                                                      
   ### Forgot Password                                                                                                                                                
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/auth/forgot-password/page.tsx` (Lines 1-40)                                                 
                                                                                                                                                                      
   - Uses `ForgotPasswordForm` component                                                                                                                              
   - Calls `useForgotPassword()` hook which posts to `/auth/forgot-password`                                                                                          
   - Expects email as parameter                                                                                                                                       
                                                                                                                                                                      
   ### Password Reset                                                                                                                                                 
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/auth/reset-password/page.tsx` (Lines 1-65)                                                  
                                                                                                                                                                      
   - URL: `/auth/reset-password?token=<token>`                                                                                                                        
   - Uses `PasswordResetForm` component                                                                                                                               
   - Validates token presence from query params                                                                                                                       
   - Calls `useResetPassword()` hook which posts to `/auth/reset-password`                                                                                            
   - On success: redirects to `/auth/login`                                                                                                                           
                                                                                                                                                                      
   ## 7. BACKEND API INTEGRATION                                                                                                                                      
                                                                                                                                                                      
   ### API Base URL Configuration                                                                                                                                     
   - **Frontend API Base**: `/api` (proxies through Next.js API routes)                                                                                               
   - **Backend URL**: Set via `NEXT_PUBLIC_BACKEND_URL` env var (default: `http://localhost:3001/api/v1`)                                                             
                                                                                                                                                                      
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/lib/axios.ts` (Line 22)                                                                         
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/api/_lib/proxy.ts` (Line 5)                                                                 
                                                                                                                                                                      
   ### Axios Configuration                                                                                                                                            
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/lib/axios.ts` (Lines 1-184)                                                                     
                                                                                                                                                                      
   - Creates global axios instance with:                                                                                                                              
     - Base URL: `/api` (Next.js routes)                                                                                                                              
     - Timeout: 30 seconds                                                                                                                                            
     - Auto-adds `Authorization` header with token                                                                                                                    
     - Token refresh on 401 error                                                                                                                                     
     - Centralized error handling                                                                                                                                     
                                                                                                                                                                      
   ### API Proxy Handler                                                                                                                                              
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/app/api/_lib/proxy.ts` (Lines 1-202)                                                            
                                                                                                                                                                      
   - `createProxyHandler()` - Factory for proxy route handlers                                                                                                        
   - `proxyRequest()` - Proxies requests to backend                                                                                                                   
   - `handleProxyError()` - Centralized error handling                                                                                                                
   - Features:                                                                                                                                                        
     - Forwards auth headers                                                                                                                                          
     - Handles query parameters                                                                                                                                       
     - Supports request/response transformation                                                                                                                       
     - Supports form data uploads                                                                                                                                     
     - Returns consistent API response format                                                                                                                         
                                                                                                                                                                      
   ### Expected Login Response Format                                                                                                                                 
   The backend should return on `/auth/login` POST:                                                                                                                   
   ```json                                                                                                                                                            
   {                                                                                                                                                                  
     "success": true,                                                                                                                                                 
     "data": {                                                                                                                                                        
       "user": {                                                                                                                                                      
         "id": "string",                                                                                                                                              
         "email": "string",                                                                                                                                           
         "name": "string",                                                                                                                                            
         "firstName": "string (optional)",                                                                                                                            
         "lastName": "string (optional)",                                                                                                                             
         "role": "string",                                                                                                                                            
         "companyId": "string",                                                                                                                                       
         "departmentId": "string (optional)",                                                                                                                         
         "officeId": "string (optional)",                                                                                                                             
         "permissions": ["string[]"],                                                                                                                                 
         "canLogin": boolean,                                                                                                                                         
         "avatar": "string (optional)",                                                                                                                               
         "phone": "string (optional)",                                                                                                                                
         "createdAt": "string (optional)",                                                                                                                            
         "updatedAt": "string (optional)"                                                                                                                             
       },                                                                                                                                                             
       "access_token": "string (JWT)",                                                                                                                                
       "refresh_token": "string (JWT)"                                                                                                                                
     }                                                                                                                                                                
   }                                                                                                                                                                  
   ```                                                                                                                                                                
                                                                                                                                                                      
   ### Expected Refresh Token Response                                                                                                                                
   The backend should return on `/auth/refresh` POST:                                                                                                                 
   ```json                                                                                                                                                            
   {                                                                                                                                                                  
     "success": true,                                                                                                                                                 
     "data": {                                                                                                                                                        
       "access_token": "string (JWT)",                                                                                                                                
       "refresh_token": "string (optional, JWT)"                                                                                                                      
     }                                                                                                                                                                
   }                                                                                                                                                                  
   ```                                                                                                                                                                
                                                                                                                                                                      
   ## 8. ROLE-BASED ROUTING SUMMARY                                                                                                                                   
                                                                                                                                                                      
   ### Super Admin Flow                                                                                                                                               
   1. Login with super_admin credentials → `/dashboard`                                                                                                               
   2. Can navigate to `/admin` (required role enforcement)                                                                                                            
   3. Full access to: Admin panel, companies, users, subscriptions, analytics, logs, settings                                                                         
                                                                                                                                                                      
   ### Company Owner Flow                                                                                                                                             
   1. Login with company_owner credentials → `/dashboard`                                                                                                             
   2. Can navigate to `/company` (has required role)                                                                                                                  
   3. Full company management access                                                                                                                                  
   4. Can see disbursements and collections for their company                                                                                                         
                                                                                                                                                                      
   ### Company Admin Flow                                                                                                                                             
   1. Login with company_admin credentials → `/dashboard`                                                                                                             
   2. Can navigate to `/company` (has required role)                                                                                                                  
   3. Limited company management (no direct settings edit)                                                                                                            
   4. User and department management only                                                                                                                             
                                                                                                                                                                      
   ### Staff Roles Flow (validator, cashier, finance_manager, department_head)                                                                                        
   1. Login → `/dashboard`                                                                                                                                            
   2. Access to `/disbursements` and `/collections` per role permissions                                                                                              
   3. Limited to company-level operations                                                                                                                             
   4. Cannot access `/admin` or `/company` (role check fails)                                                                                                         
                                                                                                                                                                      
   ### Employee/Guest Flow                                                                                                                                            
   1. Login → `/dashboard`                                                                                                                                            
   2. Limited to disbursement creation, viewing collections                                                                                                           
   3. Read-only dashboard access                                                                                                                                      
   4. No management functions available                                                                                                                               
                                                                                                                                                                      
   ## 9. AUTHENTICATION STATE MANAGEMENT                                                                                                                              
                                                                                                                                                                      
   ### Zustand Store                                                                                                                                                  
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/store/authStore.ts`                                                                             
                                                                                                                                                                      
   **State:**                                                                                                                                                         
   - `user: User | null` - Currently logged-in user                                                                                                                   
   - `token: string | null` - Access token                                                                                                                            
   - `isLoading: boolean` - Loading state                                                                                                                             
   - `error: string | null` - Error message                                                                                                                           
   - `isAuthenticated` (computed) - `!!token && !!user`                                                                                                               
                                                                                                                                                                      
   **Actions:**                                                                                                                                                       
   - `login(user, token, refreshToken?)` - Set authenticated state                                                                                                    
   - `logout()` - Clear all auth state                                                                                                                                
   - `setUser(user)` - Update user                                                                                                                                    
   - `updateUser(updates)` - Partially update user                                                                                                                    
   - `setToken(token)` - Update token                                                                                                                                 
   - `setIsLoading(bool)` - Update loading state                                                                                                                      
   - `setError(error)` - Set error                                                                                                                                    
   - `clearError()` - Clear error                                                                                                                                     
                                                                                                                                                                      
   **Persistence:**                                                                                                                                                   
   - Key: `auth-storage`                                                                                                                                              
   - Storage: localStorage                                                                                                                                            
   - Persists: `user` and `token` only (not refreshToken)                                                                                                             
                                                                                                                                                                      
   ### Token Refresh Flow                                                                                                                                             
   1. Request made with access token                                                                                                                                  
   2. Backend returns 401 Unauthorized                                                                                                                                
   3. Axios interceptor catches error                                                                                                                                 
   4. If not already refreshing, initiate refresh:                                                                                                                    
      - Get refreshToken from localStorage                                                                                                                            
      - POST to `/api/auth/refresh` with refreshToken                                                                                                                 
      - Update token in Zustand store                                                                                                                                 
      - Update refreshToken in localStorage                                                                                                                           
      - Retry original request with new token                                                                                                                         
   5. If refresh fails:                                                                                                                                               
      - Clear auth state                                                                                                                                              
      - Remove refreshToken from localStorage                                                                                                                         
      - Redirect to `/auth/login`                                                                                                                                     
                                                                                                                                                                      
   ## 10. NO SEPARATE LOGIN PAGES                                                                                                                                     
                                                                                                                                                                      
   **Key Finding:** There is only ONE login page at `/auth/login`                                                                                                     
                                                                                                                                                                      
   - No separate login for SaaS owner (super_admin)                                                                                                                   
   - No separate login for tenant admins                                                                                                                              
   - No separate login for staff                                                                                                                                      
   - All users use the same login form                                                                                                                                
   - Role-based access is enforced AFTER authentication via ProtectedRoute components and permissions checks                                                          
                                                                                                                                                                      
   The system uses:                                                                                                                                                   
   1. **Single unified login** → Credentials validated by backend                                                                                                     
   2. **Role information** returned in login response                                                                                                                 
   3. **Client-side role enforcement** on routes and components                                                                                                       
   4. **Manual navigation** for role-specific areas (admin/company)                                                                                                   
                                                                                                                                                                      
   ## 11. ENV CONFIGURATION                                                                                                                                           
                                                                                                                                                                      
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/.env`                                                                                               
                                                                                                                                                                      
   Key variables:                                                                                                                                                     
   - `NEXT_PUBLIC_API_URL` - Frontend API base URL (default: `http://localhost:3001/api`)                                                                             
   - `NEXT_PUBLIC_BACKEND_URL` - Backend service URL (default: `http://localhost:3001/api/v1`)                                                                        
                                                                                                                                                                      
   ## 12. ADDITIONAL COMPONENTS                                                                                                                                       
                                                                                                                                                                      
   ### Layouts                                                                                                                                                        
   - **AdminLayout**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/components/admin/AdminLayout.tsx`                                                  
     - Sidebar with admin navigation                                                                                                                                  
     - Header with user info and logout button                                                                                                                        
     - Routes: Overview, Companies, Users, Subscriptions, Analytics, Logs, Settings                                                                                   
                                                                                                                                                                      
   - **CompanyLayout**: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/components/company/CompanyLayout.tsx`                                            
     - Sidebar with company navigation                                                                                                                                
     - Header with company name                                                                                                                                       
     - Routes: Dashboard, Users, Departments, Offices, Roles, Settings                                                                                                
                                                                                                                                                                      
   ### Query Hooks                                                                                                                                                    
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/hooks/queries/useAuth.ts`                                                                       
                                                                                                                                                                      
   - `useProfile()` - Get current user profile (enabled only if token exists)                                                                                         
   - `useLogin()` - Login mutation                                                                                                                                    
   - `useLogout()` - Logout mutation                                                                                                                                  
   - `useChangePassword()` - Change password mutation                                                                                                                 
   - `useSetPassword()` - Set password first-time mutation                                                                                                            
   - `useForgotPassword()` - Request password reset                                                                                                                   
   - `useResetPassword()` - Reset password with token                                                                                                                 
                                                                                                                                                                      
   ### Providers                                                                                                                                                      
   File: `/home/arielkayeros/Documents/new-k-shap/k-shap-platform/src/components/providers/RootProvider.tsx`                                                          
                                                                                                                                                                      
   Wraps entire app with:                                                                                                                                             
   1. **I18nProvider** - Internationalization (i18next)                                                                                                               
   2. **QueryProvider** - React Query/TanStack Query                                                                                                                  
   3. **AuthInitializer** - Auth state restoration




   ## QUICK REFERENCE: KEY FILE LOCATIONS                                                                                                                             
                                                                                                                                                                      
   ### Authentication Core                                                                                                                                            
   - Auth Store (State): /src/store/authStore.ts                                                                                                                      
   - Auth Service (API layer): /src/services/auth.service.ts                                                                                                          
   - Axios Config (Request/Response): /src/lib/axios.ts                                                                                                               
   - Auth Hooks (Queries): /src/hooks/queries/useAuth.ts                                                                                                              
   - Auth Initializer: /src/components/providers/AuthInitializer.tsx                                                                                                  
                                                                                                                                                                      
   ### Login & Auth Pages                                                                                                                                             
   - Login Page: /src/app/auth/login/page.tsx                                                                                                                         
   - Login Form Component: /src/components/auth/LoginForm.tsx                                                                                                         
   - Signup Page: /src/app/auth/signup/page.tsx                                                                                                                       
   - First Login (Password Set): /src/app/auth/first-login/page.tsx                                                                                                   
   - Forgot Password: /src/app/auth/forgot-password/page.tsx                                                                                                          
   - Reset Password: /src/app/auth/reset-password/page.tsx                                                                                                            
                                                                                                                                                                      
   ### Route Protection                                                                                                                                               
   - ProtectedRoute Component: /src/components/ProtectedRoute.tsx                                                                                                     
   - CanAccess Component: /src/components/access/CanAccess.tsx                                                                                                        
   - Authorization Hook: /src/hooks/useAuthorization.ts                                                                                                               
                                                                                                                                                                      
   ### Roles & Permissions                                                                                                                                            
   - Permission Definitions: /src/lib/permissions.ts                                                                                                                  
   - RBAC Functions: /src/lib/rbac.ts                                                                                                                                 
                                                                                                                                                                      
   ### API Routes (Next.js Proxies)                                                                                                                                   
   - Login Route: /src/app/api/auth/login/route.ts                                                                                                                    
   - Refresh Route: /src/app/api/auth/refresh/route.ts                                                                                                                
   - Profile Route: /src/app/api/auth/profile/route.ts                                                                                                                
   - Logout Route: /src/app/api/auth/logout/route.ts                                                                                                                  
   - Proxy Handler: /src/app/api/_lib/proxy.ts                                                                                                                        
   - Error Handler: /src/app/api/_lib/error-handler.ts                                                                                                                
                                                                                                                                                                      
   ### Layouts                                                                                                                                                        
   - Admin Layout: /src/components/admin/AdminLayout.tsx                                                                                                              
   - Company Layout: /src/components/company/CompanyLayout.tsx                                                                                                        
                                                                                                                                                                      
   ### Root Layout & Providers                                                                                                                                        
   - Root Layout: /src/app/layout.tsx                                                                                                                                 
   - Root Provider: /src/components/providers/RootProvider.tsx                                                                                                        
                                                                                                                                                                      
                                                                                                                                                                      
   ## TOKEN LIFECYCLE                                                                                                                                                 
                                                                                                                                                                      
   1. LOGIN                                                                                                                                                           
      User submits credentials → POST /auth/login → Receive {user, access_token, refresh_token}                                                                       
      → Store in Zustand (user, token) + localStorage (refreshToken)                                                                                                  
                                                                                                                                                                      
   2. AUTHENTICATED REQUEST                                                                                                                                           
      Request made → Axios interceptor adds Authorization header                                                                                                      
      → Request succeeds → Response returned                                                                                                                          
                                                                                                                                                                      
   3. TOKEN EXPIRY                                                                                                                                                    
      Request made → 401 response → Axios interceptor catches                                                                                                         
      → Retrieve refreshToken from localStorage                                                                                                                       
      → POST /auth/refresh with refreshToken                                                                                                                          
      → Get new access_token → Update Zustand store                                                                                                                   
      → Retry original request with new token                                                                                                                         
      → Success                                                                                                                                                       
                                                                                                                                                                      
   4. REFRESH FAILURE                                                                                                                                                 
      POST /auth/refresh fails → Clear Zustand store                                                                                                                  
      → Remove refreshToken from localStorage                                                                                                                         
      → Redirect to /auth/login                                                                                                                                       
      → User sees login page                                                                                                                                          
                                                                                                                                                                      
   5. LOGOUT                                                                                                                                                          
      User clicks logout → POST /auth/logout                                                                                                                          
      → Clear Zustand store (user, token)                                                                                                                             
      → Remove refreshToken from localStorage                                                                                                                         
      → Redirect to /auth/login                                                                                                                                       
                                                                                                                                                                      
                                                                                                                                                                      
   ## ROLE HIERARCHY FOR APPROVAL                                                                                                                                     
                                                                                                                                                                      
   Disbursement Approval Stages:                                                                                                                                      
   1. Department Head Approval: ['department_head', 'company_admin', 'company_owner', 'super_admin']                                                                  
   2. Validator Approval: ['validator', 'finance_manager', 'company_admin', 'company_owner', 'super_admin']                                                           
   3. Cashier Approval: ['cashier', 'finance_manager', 'company_admin', 'company_owner', 'super_admin']                                                               
                                                                                                                                                                      
                                                                                                                                                                      
   ## API RESPONSE FORMAT EXPECTED FROM BACKEND                                                                                                                       
                                                                                                                                                                      
   Login Response:                                                                                                                                                    
   POST /auth/login                                                                                                                                                   
   {                                                                                                                                                                  
     "success": true,                                                                                                                                                 
     "data": {                                                                                                                                                        
       "user": { ...User object },                                                                                                                                    
       "access_token": "jwt_token_here",                                                                                                                              
       "refresh_token": "jwt_refresh_token_here"                                                                                                                      
     }                                                                                                                                                                
   }                                                                                                                                                                  
                                                                                                                                                                      
   Refresh Response:                                                                                                                                                  
   POST /auth/refresh                                                                                                                                                 
   {                                                                                                                                                                  
     "success": true,                                                                                                                                                 
     "data": {                                                                                                                                                        
       "access_token": "new_jwt_token_here",                                                                                                                          
       "refresh_token": "new_refresh_token_here" (optional)                                                                                                           
     }                                                                                                                                                                
   }                                                                                                                                                                  
                                                                                                                                                                      
   Profile Response:                                                                                                                                                  
   GET /auth/profile                                                                                                                                                  
   {                                                                                                                                                                  
     "success": true,                                                                                                                                                 
     "data": { ...User object }                                                                                                                                       
   }                                                                                                                                                                  
                                                                                                                                                                      
   Error Response:                                                                                                                                                    
   {                                                                                                                                                                  
     "success": false,                                                                                                                                                
     "message": "Error description",                                                                                                                                  
     "errors": {                                                                                                                                                      
       "field": ["error message"]                                                                                                                                     
     }                                                                                                                                                                
   }                                                                                                                                                                  
                                                                                                                                                                      
                                                                                                                                                                      
   ## ROLE-BASED ROUTE ACCESS                                                                                                                                         
                                                                                                                                                                      
   super_admin routes:                                                                                                                                                
   - /admin                                                                                                                                                           
   - /admin/companies                                                                                                                                                 
   - /admin/users                                                                                                                                                     
   - /admin/subscriptions                                                                                                                                             
   - /admin/analytics                                                                                                                                                 
   - /admin/logs                                                                                                                                                      
   - /admin/settings                                                                                                                                                  
                                                                                                                                                                      
   company_owner/company_admin/department_head routes:                                                                                                                
   - /company                                                                                                                                                         
   - /company/users                                                                                                                                                   
   - /company/departments                                                                                                                                             
   - /company/offices                                                                                                                                                 
   - /company/roles                                                                                                                                                   
   - /company/settings                                                                                                                                                
                                                                                                                                                                      
   All authenticated users:                                                                                                                                           
   - /dashboard                                                                                                                                                       
   - /disbursements                                                                                                                                                   
   - /disbursements/new                                                                                                                                               
   - /disbursements/[id]                                                                                                                                              
   - /disbursements/approvals                                                                                                                                         
   - /collections                                                                                                                                                     
   - /collections/new                                                                                                                                                 
   - /collections/[id]                                                                                                                                                
   - /collections/analytics                                                                                                                                           
   - /collections/reconciliation                                                                                                                                      
                                                                                                                                                                      
   (Actual access is further restricted by permission checks within components) 