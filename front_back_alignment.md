Plan: Align Frontend Auth to Backend                                                                                                                                 
                                                                                                                                                                      
 Summary                                                                                                                                                              
                                                                                                                                                                      
 Fix all misalignments between the frontend and backend authentication, roles, user shape, and routing so that login works correctly for all user types (Kaeyros      
 platform users + tenant company users).                                                                                                                              
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 1: Update Frontend User Interface to Match Backend Shape                                                                                                        
                                                                                                                                                                      
 File: k-shap-platform/src/store/authStore.ts (lines 4-20)                                                                                                            
 Also: k-shap-platform/src/services/types.ts (lines 50-64)                                                                                                            
                                                                                                                                                                      
 Replace the current User interface with one that mirrors the backend sanitizeUser() output:                                                                          
                                                                                                                                                                      
 export interface User {                                                                                                                                              
   id: string;              // mapped from _id                                                                                                                        
   firstName: string;                                                                                                                                                 
   lastName: string;                                                                                                                                                  
   email: string;                                                                                                                                                     
   phone?: string;                                                                                                                                                    
   company?: any;           // populated company object (null for Kaeyros users)                                                                                      
   isKaeyrosUser: boolean;                                                                                                                                            
   roles: any[];            // populated Role objects                                                                                                                 
   systemRoles: string[];   // e.g. ['kaeyros_super_admin'] or ['company_super_admin']                                                                                
   departments: any[];                                                                                                                                                
   offices: any[];                                                                                                                                                    
   canLogin: boolean;                                                                                                                                                 
   mustChangePassword: boolean;                                                                                                                                       
   avatar?: string;                                                                                                                                                   
   preferredLanguage: string;                                                                                                                                         
   maxApprovalAmount?: number;                                                                                                                                        
   isActive: boolean;                                                                                                                                                 
   lastLogin?: string;                                                                                                                                                
   createdAt?: string;                                                                                                                                                
   updatedAt?: string;                                                                                                                                                
 }                                                                                                                                                                    
                                                                                                                                                                      
 Remove name, role (single string), companyId, departmentId, officeId, permissions.                                                                                   
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 2: Update LoginResponse Interface & Token Field Names                                                                                                           
                                                                                                                                                                      
 File: k-shap-platform/src/services/auth.service.ts (lines 10-14)                                                                                                     
                                                                                                                                                                      
 Backend returns accessToken/refreshToken (camelCase). Update:                                                                                                        
                                                                                                                                                                      
 export interface LoginResponse {                                                                                                                                     
   user: any;              // raw backend user object                                                                                                                 
   accessToken: string;    // was access_token                                                                                                                        
   refreshToken: string;   // was refresh_token                                                                                                                       
   tokenType: string;                                                                                                                                                 
   expiresIn: string;                                                                                                                                                 
 }                                                                                                                                                                    
                                                                                                                                                                      
 Also update RefreshResponse (lines 39-42) to use accessToken/refreshToken.                                                                                           
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 3: Update useLogin Hook — Map User & Fix Token Destructuring                                                                                                    
                                                                                                                                                                      
 File: k-shap-platform/src/hooks/queries/useAuth.ts (lines 43-51)                                                                                                     
                                                                                                                                                                      
 In onSuccess:                                                                                                                                                        
 1. Destructure accessToken/refreshToken (not access_token/refresh_token)                                                                                             
 2. Map _id → id from the raw backend user                                                                                                                            
 3. Add role-based redirect:                                                                                                                                          
   - If user.isKaeyrosUser → router.push('/admin')                                                                                                                    
   - Else → router.push('/dashboard')                                                                                                                                 
                                                                                                                                                                      
 onSuccess: (response) => {                                                                                                                                           
   const data = response.data ?? response;                                                                                                                            
   const { user: rawUser, accessToken, refreshToken } = data;                                                                                                         
                                                                                                                                                                      
   const user: User = {                                                                                                                                               
     ...rawUser,                                                                                                                                                      
     id: rawUser._id || rawUser.id,                                                                                                                                   
   };                                                                                                                                                                 
                                                                                                                                                                      
   login(user, accessToken, refreshToken);                                                                                                                            
   queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });                                                                                             
                                                                                                                                                                      
   if (user.isKaeyrosUser) {                                                                                                                                          
     router.push('/admin');                                                                                                                                           
   } else {                                                                                                                                                           
     router.push('/dashboard');                                                                                                                                       
   }                                                                                                                                                                  
 },                                                                                                                                                                   
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 4: Update Frontend Role Names in permissions.ts                                                                                                                 
                                                                                                                                                                      
 File: k-shap-platform/src/lib/permissions.ts (lines 67-308)                                                                                                          
                                                                                                                                                                      
 Rename role keys to match backend UserRole enum values:                                                                                                              
 ┌──────────────────┬─────────────────────────────┐                                                                                                                   
 │ Old Frontend Key │  New Key (matches backend)  │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ super_admin      │ kaeyros_super_admin         │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ (add new)        │ kaeyros_admin               │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ (add new)        │ kaeyros_support             │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ company_owner    │ company_super_admin         │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ company_admin    │ (remove — not in backend)   │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ department_head  │ department_head (unchanged) │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ validator        │ validator (unchanged)       │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ cashier          │ cashier (unchanged)         │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ finance_manager  │ accountant                  │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ employee         │ agent                       │                                                                                                                   
 ├──────────────────┼─────────────────────────────┤                                                                                                                   
 │ guest            │ (remove — not in backend)   │                                                                                                                   
 └──────────────────┴─────────────────────────────┘                                                                                                                   
 Update ROLE_PERMISSIONS, ROLE_HIERARCHY, and ROLE_METADATA accordingly.                                                                                              
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 5: Update rbac.ts to Use systemRoles Array                                                                                                                      
                                                                                                                                                                      
 File: k-shap-platform/src/lib/rbac.ts                                                                                                                                
                                                                                                                                                                      
 All functions currently use user.role (single string). Update them to use user.systemRoles (array):                                                                  
                                                                                                                                                                      
 - hasPermission() — look up permissions for each role in systemRoles, union them                                                                                     
 - isAdmin() — check if systemRoles includes any Kaeyros or company_super_admin role                                                                                  
 - isFinanceRole() — check against systemRoles array                                                                                                                  
 - isApprover() — check against systemRoles array                                                                                                                     
 - filterAccessibleItems() — use user.isKaeyrosUser instead of user.role === 'super_admin'                                                                            
 - isResourceOwner() — use user.isKaeyrosUser and user.company?._id                                                                                                   
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 6: Update ProtectedRoute to Check systemRoles Array                                                                                                             
                                                                                                                                                                      
 File: k-shap-platform/src/components/ProtectedRoute.tsx (line 25)                                                                                                    
                                                                                                                                                                      
 Change from:                                                                                                                                                         
 if (requiredRoles && !requiredRoles.includes(user.role))                                                                                                             
 To:                                                                                                                                                                  
 if (requiredRoles && !user.systemRoles?.some(r => requiredRoles.includes(r)))                                                                                        
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 7: Update useAuthorization Hook                                                                                                                                 
                                                                                                                                                                      
 File: k-shap-platform/src/hooks/useAuthorization.ts                                                                                                                  
                                                                                                                                                                      
 - hasRole — check user.systemRoles.includes(role) instead of user.role === role                                                                                      
 - hasCompanyId — check user.company?._id === companyId                                                                                                               
 - isAdmin / isFinanceRole / isApprover — pass systemRoles array                                                                                                      
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 8: Update CanAccess Component                                                                                                                                   
                                                                                                                                                                      
 File: k-shap-platform/src/components/access/CanAccess.tsx                                                                                                            
                                                                                                                                                                      
 No interface change needed — it delegates to rbac.ts functions which will be updated in Step 5.                                                                      
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 9: Update Admin Page requiredRoles                                                                                                                              
                                                                                                                                                                      
 File: k-shap-platform/src/app/admin/page.tsx (line 129)                                                                                                              
                                                                                                                                                                      
 Change:                                                                                                                                                              
 <ProtectedRoute requiredRoles={['super_admin']}>                                                                                                                     
 To:                                                                                                                                                                  
 <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>                                                                         
                                                                                                                                                                      
 Update all other pages that use requiredRoles similarly.                                                                                                             
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 10: Update Axios Token Refresh to Use Backend Field Names                                                                                                       
                                                                                                                                                                      
 File: k-shap-platform/src/lib/axios.ts (line 104)                                                                                                                    
                                                                                                                                                                      
 Change:                                                                                                                                                              
 const { access_token, refresh_token } = response.data.data || response.data;                                                                                         
 To:                                                                                                                                                                  
 const { accessToken, refreshToken } = response.data.data || response.data;                                                                                           
 And update subsequent references (access_token → accessToken, refresh_token → refreshToken).                                                                         
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 11: Update services/types.ts User Type                                                                                                                          
                                                                                                                                                                      
 File: k-shap-platform/src/services/types.ts (lines 50-64)                                                                                                            
                                                                                                                                                                      
 Align the User interface here with the one in authStore.ts (Step 1). This file is imported by rbac.ts and other services.                                            
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 12: Add Next.js Middleware for Server-Side Route Protection                                                                                                     
                                                                                                                                                                      
 File: k-shap-platform/src/middleware.ts (NEW)                                                                                                                        
                                                                                                                                                                      
 Add a middleware.ts at the src/ root to:                                                                                                                             
 - Check for auth token in the cookie/localStorage (via a cookie-based approach)                                                                                      
 - Redirect unauthenticated users hitting protected routes to /auth/login                                                                                             
 - Redirect authenticated users hitting /auth/login to /dashboard or /admin                                                                                           
                                                                                                                                                                      
 Note: Since tokens are in localStorage (not cookies), the middleware can only do basic redirect checks. Full auth verification remains client-side via               
 ProtectedRoute.                                                                                                                                                      
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Step 13: Update Dashboard Page                                                                                                                                       
                                                                                                                                                                      
 File: k-shap-platform/src/app/dashboard/page.tsx (line 30, 44)                                                                                                       
                                                                                                                                                                      
 Replace user?.name with user?.firstName (or ${user?.firstName} ${user?.lastName}).                                                                                   
 Replace user?.role display with user?.systemRoles?.[0] or a formatted display.                                                                                       
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Files Modified (Summary)                                                                                                                                             
 ┌─────┬───────────────────────────────────┬────────────────────────────────────────────────────────┐                                                                 
 │  #  │               File                │                         Change                         │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 1   │ src/store/authStore.ts            │ Update User interface                                  │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 2   │ src/services/auth.service.ts      │ Fix token field names in LoginResponse                 │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 3   │ src/services/types.ts             │ Align User type to backend                             │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 4   │ src/hooks/queries/useAuth.ts      │ Fix token destructuring, map user, role-based redirect │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 5   │ src/lib/permissions.ts            │ Rename roles to match backend enums                    │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 6   │ src/lib/rbac.ts                   │ Use systemRoles array instead of single role           │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 7   │ src/lib/axios.ts                  │ Fix token field names in refresh logic                 │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 8   │ src/components/ProtectedRoute.tsx │ Check systemRoles array                                │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 9   │ src/hooks/useAuthorization.ts     │ Use systemRoles array                                  │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 10  │ src/app/admin/page.tsx            │ Fix requiredRoles values                               │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 11  │ src/app/dashboard/page.tsx        │ Use firstName/lastName                                 │                                                                 
 ├─────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤                                                                 
 │ 12  │ src/middleware.ts                 │ New — basic server-side route protection               │                                                                 
 └─────┴───────────────────────────────────┴────────────────────────────────────────────────────────┘                                                                 
 ---                                                                                                                                                                  
 Verification                                                                                                                                                         
                                                                                                                                                                      
 1. Seed the backend — run the seeder to create admin@kaeyros.com                                                                                                     
 2. Login as Kaeyros Super Admin (admin@kaeyros.com / Kaeyros@2024!) — should redirect to /admin                                                                      
 3. Login as Company Super Admin (admin@techsolutions.com / Admin@2024!) — should redirect to /dashboard                                                              
 4. Check that /admin is protected — company users should be redirected away                                                                                          
 5. Check that /company is protected — Kaeyros-only users without company shouldn't see errors                                                                        
 6. Verify token refresh — wait for token expiry or manually trigger, confirm it works with new field names                                                           
 7. Check CanAccess components — verify permission-based UI rendering matches the user's actual roles