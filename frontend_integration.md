The plan is now updated with:                                                                                                                                
  - Phase 7: Internationalization - Enhanced i18n with EN/FR (extensible to more languages)                                                                    
  - Phase 8: Theme System - Dark/Light/System modes with next-themes and persistence                                                                           
                                                                                                                                                               
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Ready to code?                                                                                                                                                
                                                                                                                                                               
 Here is Claude's plan:                                                                                                                                        
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 K-Shap Platform Integration Plan                                                                                                                              
                                                                                                                                                               
 Overview                                                                                                                                                      
                                                                                                                                                               
 Complete integration of NestJS backend with Next.js 15 frontend following world-class architecture patterns.                                                  
                                                                                                                                                               
 Backend Location: /home/arielkayeros/Documents/new-k-shap/k-shap-backend                                                                                      
 Frontend Location: /home/arielkayeros/Documents/new-k-shap/k-shap-platform                                                                                    
                                                                                                                                                               
 ---                                                                                                                                                           
 Architecture Summary                                                                                                                                          
                                                                                                                                                               
 ┌─────────────────────────────────────────────────────────────────────────────┐                                                                               
 │                              FRONTEND (Next.js 15)                          │                                                                               
 ├─────────────────────────────────────────────────────────────────────────────┤                                                                               
 │  Pages/Components                                                           │                                                                               
 │       ↓                                                                     │                                                                               
 │  React Query Hooks (useUsers, useDisbursements, etc.)                       │                                                                               
 │       ↓                                                                     │                                                                               
 │  Services Layer (usersService, disbursementsService, etc.)                  │                                                                               
 │       ↓                                                                     │                                                                               
 │  Axios Client (with interceptors, token refresh, request queue)             │                                                                               
 │       ↓                                                                     │                                                                               
 │  Next.js API Routes (/api/users, /api/disbursements, etc.)                  │                                                                               
 │       ↓                                                                     │                                                                               
 │  Server Axios (proxy to backend)                                            │                                                                               
 ├─────────────────────────────────────────────────────────────────────────────┤                                                                               
 │                              BACKEND (NestJS)                               │                                                                               
 └─────────────────────────────────────────────────────────────────────────────┘                                                                               
                                                                                                                                                               
 ---                                                                                                                                                           
 Phase 1: Axios Configuration & Core Infrastructure                                                                                                            
                                                                                                                                                               
 1.1 Install Dependencies                                                                                                                                      
                                                                                                                                                               
 npm install axios                                                                                                                                             
                                                                                                                                                               
 1.2 Create Global Axios Client                                                                                                                                
                                                                                                                                                               
 File: src/lib/axios.ts                                                                                                                                        
                                                                                                                                                               
 - Base axios instance for client-side                                                                                                                         
 - Request interceptor: Add Authorization header from Zustand store                                                                                            
 - Response interceptor: Handle 401 with token refresh                                                                                                         
 - Request queue during token refresh (prevent race conditions)                                                                                                
 - Error transformation for consistent handling                                                                                                                
                                                                                                                                                               
 1.3 Create Server Axios Client                                                                                                                                
                                                                                                                                                               
 File: src/lib/axios-server.ts                                                                                                                                 
                                                                                                                                                               
 - Server-side axios for Next.js API routes                                                                                                                    
 - Token forwarding to backend                                                                                                                                 
 - No interceptors needed (routes handle auth)                                                                                                                 
                                                                                                                                                               
 ---                                                                                                                                                           
 Phase 2: Next.js API Routes (Proxy Layer)                                                                                                                     
                                                                                                                                                               
 2.1 Core Proxy Utilities                                                                                                                                      
                                                                                                                                                               
 Files:                                                                                                                                                        
 - src/app/api/_lib/proxy.ts - Shared proxy function                                                                                                           
 - src/app/api/_lib/error-handler.ts - Centralized error handling                                                                                              
                                                                                                                                                               
 2.2 API Route Structure                                                                                                                                       
                                                                                                                                                               
 src/app/api/                                                                                                                                                  
 ├── auth/                                                                                                                                                     
 │   ├── login/route.ts          # POST                                                                                                                        
 │   ├── logout/route.ts         # POST                                                                                                                        
 │   ├── refresh/route.ts        # POST                                                                                                                        
 │   ├── profile/route.ts        # GET                                                                                                                         
 │   ├── set-password/route.ts   # POST                                                                                                                        
 │   ├── change-password/route.ts # POST                                                                                                                       
 │   ├── forgot-password/route.ts # POST                                                                                                                       
 │   └── reset-password/route.ts  # POST                                                                                                                       
 ├── users/                                                                                                                                                    
 │   ├── route.ts                # GET (list), POST (create)                                                                                                   
 │   └── [id]/                                                                                                                                                 
 │       ├── route.ts            # GET, PUT, DELETE                                                                                                            
 │       ├── restore/route.ts    # POST                                                                                                                        
 │       └── resend-activation/route.ts # POST                                                                                                                 
 ├── companies/                                                                                                                                                
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/route.ts                                                                                                                                         
 ├── departments/                                                                                                                                              
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/route.ts                                                                                                                                         
 ├── offices/                                                                                                                                                  
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/route.ts                                                                                                                                         
 ├── roles/                                                                                                                                                    
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/route.ts                                                                                                                                         
 ├── permissions/                                                                                                                                              
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/route.ts                                                                                                                                         
 ├── disbursements/                                                                                                                                            
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/                                                                                                                                                 
 │       ├── route.ts                                                                                                                                          
 │       └── approve/route.ts                                                                                                                                  
 ├── disbursement-types/                                                                                                                                       
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/route.ts                                                                                                                                         
 ├── collections/                                                                                                                                              
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/route.ts                                                                                                                                         
 ├── beneficiaries/                                                                                                                                            
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/route.ts                                                                                                                                         
 ├── notifications/                                                                                                                                            
 │   ├── route.ts                                                                                                                                              
 │   ├── [id]/route.ts                                                                                                                                         
 │   └── mark-read/route.ts                                                                                                                                    
 ├── audit-logs/                                                                                                                                               
 │   └── route.ts                                                                                                                                              
 ├── settings/                                                                                                                                                 
 │   ├── route.ts                                                                                                                                              
 │   ├── email/route.ts                                                                                                                                        
 │   ├── reminders/route.ts                                                                                                                                    
 │   └── [key]/route.ts                                                                                                                                        
 ├── exports/                                                                                                                                                  
 │   ├── route.ts                                                                                                                                              
 │   └── [id]/                                                                                                                                                 
 │       ├── route.ts                                                                                                                                          
 │       └── download/route.ts                                                                                                                                 
 ├── reports/                                                                                                                                                  
 │   ├── dashboard/route.ts                                                                                                                                    
 │   ├── disbursements/summary/route.ts                                                                                                                        
 │   └── collections/summary/route.ts                                                                                                                          
 └── file-upload/                                                                                                                                              
     ├── route.ts                                                                                                                                              
     └── [id]/                                                                                                                                                 
         ├── route.ts                                                                                                                                          
         └── download/route.ts                                                                                                                                 
                                                                                                                                                               
 ---                                                                                                                                                           
 Phase 3: Service Layer                                                                                                                                        
                                                                                                                                                               
 3.1 Base Service                                                                                                                                              
                                                                                                                                                               
 File: src/services/base.service.ts                                                                                                                            
                                                                                                                                                               
 abstract class BaseService<T, CreateDto, UpdateDto> {                                                                                                         
   protected abstract basePath: string;                                                                                                                        
                                                                                                                                                               
   findAll(params?: QueryParams): Promise<PaginatedResponse<T>>                                                                                                
   findById(id: string): Promise<T>                                                                                                                            
   create(data: CreateDto): Promise<T>                                                                                                                         
   update(id: string, data: UpdateDto): Promise<T>                                                                                                             
   delete(id: string): Promise<void>                                                                                                                           
 }                                                                                                                                                             
                                                                                                                                                               
 3.2 Module Services                                                                                                                                           
                                                                                                                                                               
 Directory: src/services/                                                                                                                                      
 ┌────────────────────┬───────────────────────────────┐                                                                                                        
 │      Service       │             File              │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Auth               │ auth.service.ts               │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Users              │ users.service.ts              │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Companies          │ companies.service.ts          │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Departments        │ departments.service.ts        │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Offices            │ offices.service.ts            │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Roles              │ roles.service.ts              │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Permissions        │ permissions.service.ts        │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Disbursements      │ disbursements.service.ts      │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Disbursement Types │ disbursement-types.service.ts │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Collections        │ collections.service.ts        │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Beneficiaries      │ beneficiaries.service.ts      │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Notifications      │ notifications.service.ts      │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Audit Logs         │ audit-logs.service.ts         │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Settings           │ settings.service.ts           │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Exports            │ exports.service.ts            │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ Reports            │ reports.service.ts            │                                                                                                        
 ├────────────────────┼───────────────────────────────┤                                                                                                        
 │ File Upload        │ file-upload.service.ts        │                                                                                                        
 └────────────────────┴───────────────────────────────┘                                                                                                        
 ---                                                                                                                                                           
 Phase 4: React Query Integration                                                                                                                              
                                                                                                                                                               
 4.1 Query Keys Factory                                                                                                                                        
                                                                                                                                                               
 File: src/hooks/queries/keys.ts                                                                                                                               
                                                                                                                                                               
 Centralized query key management for cache invalidation.                                                                                                      
                                                                                                                                                               
 4.2 Query Hooks                                                                                                                                               
                                                                                                                                                               
 Directory: src/hooks/queries/                                                                                                                                 
                                                                                                                                                               
 Each module gets:                                                                                                                                             
 - useList() - Paginated list query with filters                                                                                                               
 - useDetail(id) - Single item query                                                                                                                           
 - useCreate() - Create mutation with cache invalidation                                                                                                       
 - useUpdate() - Update mutation with optimistic updates                                                                                                       
 - useDelete() - Delete mutation                                                                                                                               
 - usePrefetch() - Prefetch utility for navigation                                                                                                             
                                                                                                                                                               
 4.3 Features Implemented                                                                                                                                      
                                                                                                                                                               
 - Stale time: 5 minutes                                                                                                                                       
 - Garbage collection: 10 minutes                                                                                                                              
 - Retry: 1 attempt                                                                                                                                            
 - Optimistic updates for mutations                                                                                                                            
 - Automatic cache invalidation                                                                                                                                
 - Prefetching on hover                                                                                                                                        
 - Background refetch on focus                                                                                                                                 
                                                                                                                                                               
 ---                                                                                                                                                           
 Phase 5: Custom UI Components                                                                                                                                 
                                                                                                                                                               
 5.1 Modal System (No shadcn)                                                                                                                                  
                                                                                                                                                               
 Directory: src/components/ui/modal/                                                                                                                           
 ┌──────────────────┬──────────────────────────────────────────────┐                                                                                           
 │    Component     │                   Purpose                    │                                                                                           
 ├──────────────────┼──────────────────────────────────────────────┤                                                                                           
 │ Modal.tsx        │ Main modal with portal, backdrop, animations │                                                                                           
 ├──────────────────┼──────────────────────────────────────────────┤                                                                                           
 │ ModalHeader.tsx  │ Title with close button                      │                                                                                           
 ├──────────────────┼──────────────────────────────────────────────┤                                                                                           
 │ ModalBody.tsx    │ Scrollable content area                      │                                                                                           
 ├──────────────────┼──────────────────────────────────────────────┤                                                                                           
 │ ModalFooter.tsx  │ Action buttons                               │                                                                                           
 ├──────────────────┼──────────────────────────────────────────────┤                                                                                           
 │ ConfirmModal.tsx │ Pre-built confirmation dialog                │                                                                                           
 ├──────────────────┼──────────────────────────────────────────────┤                                                                                           
 │ useFocusTrap.ts  │ Accessibility hook                           │                                                                                           
 ├──────────────────┼──────────────────────────────────────────────┤                                                                                           
 │ useModal.ts      │ Open/close state management                  │                                                                                           
 └──────────────────┴──────────────────────────────────────────────┘                                                                                           
 Accessibility Features:                                                                                                                                       
 - Focus trap within modal                                                                                                                                     
 - Escape key to close                                                                                                                                         
 - Body scroll lock                                                                                                                                            
 - ARIA attributes (role="dialog", aria-modal, aria-labelledby)                                                                                                
 - Return focus on close                                                                                                                                       
                                                                                                                                                               
 5.2 Sheet System (No shadcn)                                                                                                                                  
                                                                                                                                                               
 Directory: src/components/ui/sheet/                                                                                                                           
 ┌─────────────────┬────────────────────────────────────┐                                                                                                      
 │    Component    │              Purpose               │                                                                                                      
 ├─────────────────┼────────────────────────────────────┤                                                                                                      
 │ Sheet.tsx       │ Side panel (left/right/top/bottom) │                                                                                                      
 ├─────────────────┼────────────────────────────────────┤                                                                                                      
 │ SheetHeader.tsx │ Title with close button            │                                                                                                      
 ├─────────────────┼────────────────────────────────────┤                                                                                                      
 │ SheetBody.tsx   │ Scrollable content                 │                                                                                                      
 ├─────────────────┼────────────────────────────────────┤                                                                                                      
 │ SheetFooter.tsx │ Action buttons                     │                                                                                                      
 └─────────────────┴────────────────────────────────────┘                                                                                                      
 Features:                                                                                                                                                     
 - 4 positions (left, right, top, bottom)                                                                                                                      
 - Mobile-friendly bottom sheet with drag handle                                                                                                               
 - Same accessibility as Modal                                                                                                                                 
                                                                                                                                                               
 5.3 Form Components (Native HTML + React Hook Form)                                                                                                           
                                                                                                                                                               
 Directory: src/components/ui/form/                                                                                                                            
 ┌────────────────┬──────────────────────────────┐                                                                                                             
 │   Component    │           Purpose            │                                                                                                             
 ├────────────────┼──────────────────────────────┤                                                                                                             
 │ FormField.tsx  │ Wrapper with label and error │                                                                                                             
 ├────────────────┼──────────────────────────────┤                                                                                                             
 │ Input.tsx      │ Styled native input          │                                                                                                             
 ├────────────────┼──────────────────────────────┤                                                                                                             
 │ Select.tsx     │ Styled native select         │                                                                                                             
 ├────────────────┼──────────────────────────────┤                                                                                                             
 │ Textarea.tsx   │ Styled native textarea       │                                                                                                             
 ├────────────────┼──────────────────────────────┤                                                                                                             
 │ Checkbox.tsx   │ Styled native checkbox       │                                                                                                             
 ├────────────────┼──────────────────────────────┤                                                                                                             
 │ RadioGroup.tsx │ Styled native radio buttons  │                                                                                                             
 └────────────────┴──────────────────────────────┘                                                                                                             
 Pattern:                                                                                                                                                      
 <FormField label="Email" error={errors.email?.message}>                                                                                                       
   <Input {...register('email')} type="email" />                                                                                                               
 </FormField>                                                                                                                                                  
                                                                                                                                                               
 ---                                                                                                                                                           
 Phase 6: Zustand Stores                                                                                                                                       
                                                                                                                                                               
 6.1 Auth Store (Updated)                                                                                                                                      
                                                                                                                                                               
 File: src/store/authStore.ts                                                                                                                                  
                                                                                                                                                               
 interface AuthState {                                                                                                                                         
   user: User | null                                                                                                                                           
   token: string | null                                                                                                                                        
   isLoading: boolean                                                                                                                                          
   error: string | null                                                                                                                                        
   isAuthenticated: boolean                                                                                                                                    
                                                                                                                                                               
   login(user, token): void                                                                                                                                    
   logout(): void                                                                                                                                              
   updateUser(updates): void                                                                                                                                   
 }                                                                                                                                                             
 - Persisted to localStorage                                                                                                                                   
 - Clears refresh token on logout                                                                                                                              
                                                                                                                                                               
 6.2 App Store (Updated with Persistence)                                                                                                                      
                                                                                                                                                               
 File: src/store/appStore.ts                                                                                                                                   
                                                                                                                                                               
 interface AppState {                                                                                                                                          
   theme: 'light' | 'dark' | 'system'                                                                                                                          
   sidebarOpen: boolean                                                                                                                                        
   sidebarCollapsed: boolean                                                                                                                                   
   currentCompanyId: string | null                                                                                                                             
   locale: 'en' | 'fr'                                                                                                                                         
 }                                                                                                                                                             
 - Persisted: theme, sidebarCollapsed, locale                                                                                                                  
                                                                                                                                                               
 6.3 UI Store (New)                                                                                                                                            
                                                                                                                                                               
 File: src/store/uiStore.ts                                                                                                                                    
                                                                                                                                                               
 interface UIState {                                                                                                                                           
   activeModals: ModalState[]                                                                                                                                  
   toasts: Toast[]                                                                                                                                             
   globalLoading: boolean                                                                                                                                      
                                                                                                                                                               
   openModal(id, props): void                                                                                                                                  
   closeModal(id): void                                                                                                                                        
   addToast(toast): void                                                                                                                                       
   removeToast(id): void                                                                                                                                       
 }                                                                                                                                                             
                                                                                                                                                               
 ---                                                                                                                                                           
 Phase 7: Internationalization (i18n)                                                                                                                          
                                                                                                                                                               
 7.1 Current State                                                                                                                                             
                                                                                                                                                               
 - i18next already configured in src/i18n/config.ts                                                                                                            
 - EN/FR locales exist in src/i18n/locales/                                                                                                                    
 - LanguageSwitcher component exists                                                                                                                           
                                                                                                                                                               
 7.2 Enhancements Needed                                                                                                                                       
                                                                                                                                                               
 - Extend translations for all new components                                                                                                                  
 - Add language persistence to Zustand                                                                                                                         
 - Create comprehensive translation structure                                                                                                                  
 - Support for adding new languages easily                                                                                                                     
                                                                                                                                                               
 7.3 Translation Structure                                                                                                                                     
                                                                                                                                                               
 src/i18n/locales/                                                                                                                                             
 ├── en.json                                                                                                                                                   
 ├── fr.json                                                                                                                                                   
 └── (future: es.json, de.json, etc.)                                                                                                                          
                                                                                                                                                               
 Namespace Organization:                                                                                                                                       
 {                                                                                                                                                             
   "common": { "save", "cancel", "delete", "loading", "error" },                                                                                               
   "auth": { "login", "logout", "password", "email" },                                                                                                         
   "disbursements": { "title", "create", "approve", "reject" },                                                                                                
   "collections": { "title", "create", "reconcile" },                                                                                                          
   "users": { "title", "roles", "permissions" },                                                                                                               
   "validation": { "required", "minLength", "email" },                                                                                                         
   "notifications": { "success", "error", "warning" }                                                                                                          
 }                                                                                                                                                             
                                                                                                                                                               
 ---                                                                                                                                                           
 Phase 8: Theme System (Dark/Light)                                                                                                                            
                                                                                                                                                               
 8.1 Current State                                                                                                                                             
                                                                                                                                                               
 - next-themes is installed                                                                                                                                    
 - appStore has theme but no persistence                                                                                                                       
                                                                                                                                                               
 8.2 Implementation                                                                                                                                            
                                                                                                                                                               
 File: src/components/providers/ThemeProvider.tsx                                                                                                              
                                                                                                                                                               
 - Use next-themes ThemeProvider                                                                                                                               
 - Integrate with Zustand for persistence                                                                                                                      
 - Support 'light', 'dark', 'system' modes                                                                                                                     
                                                                                                                                                               
 File: src/components/ui/ThemeSwitcher.tsx                                                                                                                     
                                                                                                                                                               
 - Toggle button or dropdown                                                                                                                                   
 - Icons for each theme mode                                                                                                                                   
 - Accessible keyboard navigation                                                                                                                              
                                                                                                                                                               
 8.3 CSS Variables Approach                                                                                                                                    
                                                                                                                                                               
 :root {                                                                                                                                                       
   --background: 0 0% 100%;                                                                                                                                    
   --foreground: 222.2 84% 4.9%;                                                                                                                               
   /* ... light theme vars */                                                                                                                                  
 }                                                                                                                                                             
                                                                                                                                                               
 .dark {                                                                                                                                                       
   --background: 222.2 84% 4.9%;                                                                                                                               
   --foreground: 210 40% 98%;                                                                                                                                  
   /* ... dark theme vars */                                                                                                                                   
 }                                                                                                                                                             
                                                                                                                                                               
 ---                                                                                                                                                           
 Phase 9: Responsive & Accessibility                                                                                                                           
                                                                                                                                                               
 9.1 Responsive Breakpoints                                                                                                                                    
                                                                                                                                                               
 - Mobile: < 640px                                                                                                                                             
 - Tablet: 640px - 1024px                                                                                                                                      
 - Desktop: > 1024px                                                                                                                                           
                                                                                                                                                               
 9.2 Accessibility Checklist                                                                                                                                   
                                                                                                                                                               
 - All interactive elements keyboard accessible                                                                                                                
 - Focus indicators visible                                                                                                                                    
 - Color contrast ratio >= 4.5:1                                                                                                                               
 - ARIA labels on icons/buttons                                                                                                                                
 - Form validation messages linked to inputs                                                                                                                   
 - Skip to content link                                                                                                                                        
 - Proper heading hierarchy                                                                                                                                    
 - Alt text on images                                                                                                                                          
                                                                                                                                                               
 ---                                                                                                                                                           
 Implementation Order                                                                                                                                          
                                                                                                                                                               
 Week 1: Foundation                                                                                                                                            
                                                                                                                                                               
 1. Install axios                                                                                                                                              
 2. Create src/lib/axios.ts (client)                                                                                                                           
 3. Create src/lib/axios-server.ts (server)                                                                                                                    
 4. Create src/app/api/_lib/proxy.ts                                                                                                                           
 5. Update src/store/authStore.ts                                                                                                                              
 6. Update src/store/appStore.ts (add persistence)                                                                                                             
 7. Create src/store/uiStore.ts                                                                                                                                
                                                                                                                                                               
 Week 2: API Routes & Services                                                                                                                                 
                                                                                                                                                               
 1. Create all API routes (auth first, then modules)                                                                                                           
 2. Create src/services/base.service.ts                                                                                                                        
 3. Create all module services                                                                                                                                 
 4. Test with existing components                                                                                                                              
                                                                                                                                                               
 Week 3: React Query                                                                                                                                           
                                                                                                                                                               
 1. Create src/hooks/queries/keys.ts                                                                                                                           
 2. Create all query hooks                                                                                                                                     
 3. Migrate existing components to use hooks                                                                                                                   
 4. Add optimistic updates                                                                                                                                     
                                                                                                                                                               
 Week 4: UI Components                                                                                                                                         
                                                                                                                                                               
 1. Create Modal system                                                                                                                                        
 2. Create Sheet system                                                                                                                                        
 3. Create Form components                                                                                                                                     
 4. Migrate existing modals/forms                                                                                                                              
                                                                                                                                                               
 Week 5: i18n & Theme                                                                                                                                          
                                                                                                                                                               
 1. Enhance i18n with comprehensive translations                                                                                                               
 2. Create ThemeProvider with next-themes                                                                                                                      
 3. Create ThemeSwitcher component                                                                                                                             
 4. Create LanguageSwitcher component (enhance existing)                                                                                                       
 5. Accessibility audit                                                                                                                                        
 6. Responsive testing                                                                                                                                         
                                                                                                                                                               
 ---                                                                                                                                                           
 Files to Modify                                                                                                                                               
 ┌────────────────────────────────────────────┬────────────────────────────────────────────┐                                                                   
 │                    File                    │                  Changes                   │                                                                   
 ├────────────────────────────────────────────┼────────────────────────────────────────────┤                                                                   
 │ src/store/authStore.ts                     │ Add isAuthenticated, login(), updateUser() │                                                                   
 ├────────────────────────────────────────────┼────────────────────────────────────────────┤                                                                   
 │ src/store/appStore.ts                      │ Add persistence middleware                 │                                                                   
 ├────────────────────────────────────────────┼────────────────────────────────────────────┤                                                                   
 │ src/components/providers/QueryProvider.tsx │ Already configured                         │                                                                   
 ├────────────────────────────────────────────┼────────────────────────────────────────────┤                                                                   
 │ src/hooks/useApi.ts                        │ Mark as deprecated, redirect to services   │                                                                   
 ├────────────────────────────────────────────┼────────────────────────────────────────────┤                                                                   
 │ src/lib/auth.ts                            │ Remove global fetch override               │                                                                   
 └────────────────────────────────────────────┴────────────────────────────────────────────┘                                                                   
 Files to Create                                                                                                                                               
 ┌───────────────┬──────────────────┐                                                                                                                          
 │   Category    │      Count       │                                                                                                                          
 ├───────────────┼──────────────────┤                                                                                                                          
 │ Lib files     │ 2                │                                                                                                                          
 ├───────────────┼──────────────────┤                                                                                                                          
 │ API routes    │ ~50              │                                                                                                                          
 ├───────────────┼──────────────────┤                                                                                                                          
 │ Services      │ 17               │                                                                                                                          
 ├───────────────┼──────────────────┤                                                                                                                          
 │ Query hooks   │ 17               │                                                                                                                          
 ├───────────────┼──────────────────┤                                                                                                                          
 │ UI Components │ ~20              │                                                                                                                          
 ├───────────────┼──────────────────┤                                                                                                                          
 │ Stores        │ 1 new, 2 updated │                                                                                                                          
 └───────────────┴──────────────────┘                                                                                                                          
 ---                                                                                                                                                           
 Verification Plan                                                                                                                                             
                                                                                                                                                               
 Unit Testing                                                                                                                                                  
                                                                                                                                                               
 - Test axios interceptor token refresh                                                                                                                        
 - Test service CRUD methods                                                                                                                                   
 - Test query hooks with mock data                                                                                                                             
                                                                                                                                                               
 Integration Testing                                                                                                                                           
                                                                                                                                                               
 - Full auth flow (login → refresh → logout)                                                                                                                   
 - CRUD operations for each module                                                                                                                             
 - Modal/Sheet accessibility testing                                                                                                                           
                                                                                                                                                               
 E2E Testing                                                                                                                                                   
                                                                                                                                                               
 - Login and navigate to dashboard                                                                                                                             
 - Create/edit/delete disbursement                                                                                                                             
 - Approval workflow                                                                                                                                           
 - File upload                                                                                                                                                 
                                                                                                                                                               
 Manual Testing Checklist                                                                                                                                      
                                                                                                                                                               
 - Login with valid credentials                                                                                                                                
 - Token refresh on expiry                                                                                                                                     
 - 401 redirect to login                                                                                                                                       
 - Create disbursement                                                                                                                                         
 - Approve disbursement workflow                                                                                                                               
 - Modal keyboard navigation (Tab, Escape)                                                                                                                     
 - Sheet swipe to close (mobile)                                                                                                                               
 - Form validation errors display                                                                                                                              
 - Responsive layout on mobile                                                                                                                                 
 - Theme switching (light/dark/system)                                                                                                                         
 - Theme persistence across sessions                                                                                                                           
 - Language switching (EN/FR)                                                                                                                                  
 - Language persistence across sessions                                                                                                                        
 - All UI text translated