K-SHAP Project - Comprehensive Analysis Report
                                                                                                                                                                              
  Executive Summary                      
                                                                                                                                                                              
  The project has a solid multi-tenancy architecture built on AsyncLocalStorage-based tenant context, a Mongoose schema plugin for automatic query filtering, and global      
  guards for auth/access control. However, the exploration uncovered several critical gaps — mostly from the Codex changes not being fully integrated — plus a number of
  medium/low improvements.

  ---
  CRITICAL ISSUES (Fix Before Testing)

  1. Schemas NOT Registered in DatabaseModule = No Tenant Filtering

  This is the most dangerous finding. The database.module.ts applies a applyTenantPlugin() to each schema, which auto-filters queries by company. Several schemas are defined
  but never registered, meaning they have zero automatic tenant isolation.
  ┌──────────────────┬──────────────────────────────────────┬────────────────────┬────────────────────────┐
  │      Schema      │                 File                 │ Has company Field? │ Tenant Plugin Applied? │
  ├──────────────────┼──────────────────────────────────────┼────────────────────┼────────────────────────┤
  │ FileUpload       │ schemas/file-upload.schema.ts        │ YES                │ NO                     │
  ├──────────────────┼──────────────────────────────────────┼────────────────────┼────────────────────────┤
  │ PaymentMethod    │ schemas/payment-method.schema.ts     │ YES                │ NO                     │
  ├──────────────────┼──────────────────────────────────────┼────────────────────┼────────────────────────┤
  │ Export           │ schemas/export.schema.ts             │ YES                │ NO                     │
  ├──────────────────┼──────────────────────────────────────┼────────────────────┼────────────────────────┤
  │ WorkflowTemplate │ schemas/workflow-template.schema.ts  │ YES (optional)     │ NO                     │
  ├──────────────────┼──────────────────────────────────────┼────────────────────┼────────────────────────┤
  │ EmailSettings    │ schemas/email-settings.schema.ts*    │ YES                │ NO                     │
  ├──────────────────┼──────────────────────────────────────┼────────────────────┼────────────────────────┤
  │ ReminderSettings │ schemas/reminder-settings.schema.ts* │ YES                │ NO                     │
  └──────────────────┴──────────────────────────────────────┴────────────────────┴────────────────────────┘
  Impact: Queries on these models bypass multi-tenant filtering entirely. A company user could potentially see another company's exports, payment methods, or uploaded files.
  The service layer may add manual filtering, but the safety net of the plugin is completely absent.

  2. Departments & Offices create() Missing Company Assignment

  Files: modules/departments/departments.service.ts, modules/offices/offices.service.ts

  The create() methods don't set the company field on newly created records. If a department or office is created without explicit company assignment, it would exist with
  company: null — visible to nobody through the tenant plugin, but orphaned in the database.

  3. Aggregation $lookup Stages Missing Company Filters

  File: modules/reports/reports.service.ts (~lines 204-210, 437-443)

  $lookup: {
    from: 'departments',
    localField: '_id',
    foreignField: '_id',
    as: 'dept',
  }

  These lookups join against the departments collection without a company filter. While mitigated by the fact that the initial $match already scopes to the right company, if
  any cross-company department IDs exist in the data, names/details from other tenants could leak into reports.

  4. Chat Gateway findById Without Company Validation

  File: modules/chat/chat.gateway.ts (~line 125)

  const targetUser = await this.userModel
    .findById(targetUserId)
    .select('company isDeleted')
    .lean();

  This queries by _id alone without company scoping. The subsequent validateSameCompany() check mitigates this, but it means user existence and company affiliation are
  revealed to the caller before the company check happens.

  ---
  HIGH PRIORITY ISSUES

  5. Access Token Stored in localStorage

  File: frontend/src/store/authStore.ts (lines 118-122)

  The Zustand persistence config stores the JWT access token in localStorage:
  partialize: (state) => ({ user: state.user, token: state.token })

  This is vulnerable to XSS attacks. Any injected script can read localStorage.getItem('auth-storage') and extract the token. Since refresh tokens are already in httpOnly
  cookies (good!), the access token should ideally be memory-only, with a refresh-on-reload pattern.

  6. CompanyAccessGuard Only Validates URL Params

  File: common/guards/company-access.guard.ts (lines 42-48)

  if (params.companyId && user.company) {
    if (params.companyId !== (user.company._id || user.company).toString()) {
      throw new ForbiddenException(...)
    }
  }

  This guard only triggers when companyId is in the URL params. For endpoints that receive company data in the request body (or don't include it at all), the guard does
  nothing. The service layer handles it, but this guard gives a false sense of security.

  7. Reference Number Race Condition

  File: modules/disbursements/disbursements.service.ts (lines 46-55)

  The generateReferenceNumber() method checks if a reference exists, then creates the disbursement separately. Between check and insert, another concurrent request could
  claim the same reference. The unique compound index will catch it, but the error won't be handled gracefully — it'll throw a raw MongoDB duplicate key error.

  8. Tenant Filter Plugin Override Bypass

  File: common/tenancy/tenant-filter.plugin.ts (lines 27-29)

  if (filter && Object.prototype.hasOwnProperty.call(filter, companyField)) {
    return; // EXITS - allows explicit override
  }

  If any service explicitly passes { company: someOtherId } in a query, the plugin steps aside. This is intentional for admin scenarios but has no audit trail. A bug in any
  service could accidentally scope to the wrong company with zero detection.

  ---
  MEDIUM PRIORITY ISSUES

  9. Soft Delete Not Consistently Checked

  Several services rely on the tenant plugin but don't explicitly add isDeleted: false to queries:
  - ChatMessage queries
  - Notification queries
  - FileUpload queries

  While some schemas may have it baked into the plugin, this is inconsistent and error-prone.

  10. Missing Error Handlers in Frontend Mutations

  Files: hooks/queries/useDisbursements.ts and other hook files

  Several mutation hooks lack onError handlers:
  - useDeleteDisbursement() — no error callback
  - useRejectDisbursement() — no error callback
  - Various settings mutations

  Users get no feedback when these operations fail silently.

  11. Type Safety Issues Across Frontend

  File: services/types.ts and multiple service files

  Heavy use of any types:
  - User.company?: any
  - User.roles: any[]
  - api.get<any>() in payment-methods.service
  - (response as any).data ?? response pattern used everywhere

  This defeats TypeScript's purpose and makes refactoring dangerous.

  12. Inconsistent Response Data Extraction

  Files: useAuth.ts (line 44), useDisbursements.ts, and others

  const data = (response as any).data ?? response;

  This defensive pattern appears everywhere because the response shape isn't predictable (sometimes wrapped in { success, data } by the TransformInterceptor, sometimes not).
  This should be normalized at the axios/service layer.

  13. No CSRF Protection

  File: frontend/src/app/api/_lib/proxy.ts

  The proxy layer forwards Authorization and Cookie headers but has no CSRF token mechanism. Since cookies are used for refresh tokens with SameSite=Lax, this is partially
  mitigated, but POST requests from other sites could still hit the proxy.

  14. Missing Translations

  The en.json and fr.json locale files likely have gaps. Payment method labels in CreateDisbursementForm use defaultLabel fallbacks, suggesting missing translation keys.

  ---
  LOW PRIORITY / IMPROVEMENTS

  15. No Compound Indexes for Multi-Tenant Queries

  Most schemas lack compound indexes like { company: 1, createdAt: -1 } or { company: 1, status: 1, isDeleted: 1 }. As data grows, every tenant-scoped query will become
  slower.

  16. No Transaction Support for Workflow Operations

  Disbursement approval/rejection/cancellation updates multiple sub-documents in a single .save() call. While this is atomic for a single document, any side effects
  (notifications, audit logs) that fail don't roll back the main update.

  17. Jobs May Lack Tenant Context

  File: common/tenancy/tenant-context.ts

  Background jobs (cron) run outside of HTTP request context, so getTenantContext() returns undefined. Jobs that query the database need to manually set up tenant context or
  pass company filters explicitly. The disbursement reminder job does this correctly, but it's a pattern that's easy to forget for new jobs.

  18. Inconsistent Query Stale Times

  React Query stale times are inconsistent:
  - Most queries: 5 minutes
  - Pending items: 2 minutes
  - Settings/Notifications: defaults (no explicit config)

  19. No Content Security Policy

  No CSP headers are configured at the Next.js level, missing an easy defense-in-depth layer against XSS.

  ---
  Architecture Strengths (What's Working Well)

  1. WebSocket tenant isolation — Chat and notifications gateways properly validate company from JWT, scope rooms with company prefixes, and validate same-company for DMs.
  This is excellent.
  2. Guard chain order — ThrottlerGuard -> JwtAuthGuard -> CompanyAccessGuard -> PermissionsGuard is correct and well-thought-out.
  3. Kaeyros admin bypass — Consistently implemented across all controllers and services with companyId = null -> see all data.
  4. AsyncLocalStorage tenant context — Proper per-request isolation, doesn't leak between concurrent requests.
  5. Audit log interceptor — Captures all write operations with company context.
  6. Cookie-based refresh tokens — httpOnly, SameSite=Lax, not exposed to JavaScript.
  7. Frontend proxy architecture — Clean separation between browser and backend, properly forwards cookies and headers both directions.

  ---
  Recommended Fix Priority
  ┌──────────┬───────────────────────────────────────────────────────────────┬────────┐
  │ Priority │                             Issue                             │ Effort │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P0       │ Register missing schemas in DatabaseModule with tenant plugin │ Small  │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P0       │ Add company to departments/offices create()                   │ Small  │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P1       │ Fix aggregation $lookup with company filters                  │ Small  │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P1       │ Add company check to chat findById                            │ Small  │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P1       │ Handle reference number race condition gracefully             │ Small  │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P2       │ Move access token to memory-only storage                      │ Medium │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P2       │ Add isDeleted: false to all tenant-scoped queries             │ Medium │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P2       │ Normalize response data extraction in frontend                │ Medium │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P3       │ Add compound indexes for common queries                       │ Small  │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P3       │ Add error handlers to all mutation hooks                      │ Small  │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P3       │ Replace any types with proper generics                        │ Large  │
  ├──────────┼───────────────────────────────────────────────────────────────┼────────┤
  │ P3       │ Add CSP headers                                               │ Small  │
  └──────────┴───────────────────────────────────────────────────────────────┴────────┘
  Want me to start fixing the P0 and P1 issues?