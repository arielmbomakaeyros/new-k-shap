# K-shap: Enterprise Financial Management System
## Project Summary & Architecture

### Project Overview

K-shap is a comprehensive, multi-tenant SaaS platform for managing enterprise financial workflows. It provides tools for disbursement management with approval workflows, cash inflow tracking, collections reconciliation, and role-based access control.

**Technology Stack:**
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State Management**: Zustand (auth & app state)
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: i18next with English & French support
- **Authentication**: JWT-based with refresh token rotation
- **Authorization**: Granular role-based access control (RBAC)

---

## Core Features

### 1. Authentication & User Management
- Email/password authentication with JWT tokens
- Automatic token refresh with 401 response handling
- Password reset via email with secure tokens
- First-login password change enforcement
- Multi-language authentication pages
- Secure session management with Zustand persistence

**Pages**: `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/first-login`

### 2. Multi-Tenant Company Management
- Company-level data isolation
- Department and office management
- User invitation and role assignment
- Custom role creation with permission assignment
- Company-specific settings and preferences

**Pages**: `/company/*` (dashboard, users, departments, offices, roles, settings)

### 3. Disbursement Module
Complete disbursement request lifecycle with 3-stage approval workflow:
- **Stage 1**: Department Head approval
- **Stage 2**: Financial Validator approval  
- **Stage 3**: Cashier disbursement execution

Features:
- Create requests with detailed payee information
- Multi-currency support
- Department and office allocation
- Approval with conditions or rejection
- Workflow timeline visualization
- Status tracking and audit trail

**Pages**: `/disbursements/*` (list, new, detail, approvals)

### 4. Collections & Cash Inflow Module
Track incoming payments and cash collections:
- Record payment collections by type (customer, vendor, partner)
- Multiple payment methods (bank transfer, check, cash, credit card)
- Status lifecycle (pending → received → deposited → reconciled)
- Bank reconciliation tool with variance detection
- Collection analytics and trends
- Top payer identification

**Pages**: `/collections/*` (list, new, detail, reconciliation, analytics)

### 5. Admin Dashboard (Super Admin)
Platform-wide administration:
- Company management and control
- User management across all companies
- Subscription and billing management
- System logs and audit trails
- Platform analytics and metrics
- Configuration settings

**Pages**: `/admin/*` (overview, companies, subscriptions, users, analytics, logs, settings)

### 6. Role-Based Access Control (RBAC)
Comprehensive permission system with 9 predefined roles:
- **super_admin**: Full platform access
- **company_owner**: Full company access
- **company_admin**: Company administration
- **department_head**: Department oversight & approval
- **validator**: Financial validation
- **cashier**: Payment processing
- **finance_manager**: Financial oversight
- **employee**: Standard user access
- **guest**: Read-only access

Features:
- Granular permission definitions (40+ permissions)
- Component-level access control with `<CanAccess>`
- Route protection with `ProtectedRoute`
- Permission checking hooks (`useAuthorization`)
- Custom role creation at company level
- Permission inheritance hierarchy

---

## Project Structure

```
/src
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                  # Authentication routes
│   ├── admin/                   # Admin dashboard
│   ├── company/                 # Company management
│   ├── dashboard/               # User dashboard
│   ├── disbursements/           # Disbursement module
│   ├── collections/             # Collections module
│   ├── settings/                # Settings
│   ├── unauthorized/            # Access denied page
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles & design tokens
│
├── components/
│   ├── admin/                   # Admin-specific components
│   ├── collection/              # Collection module components
│   ├── company/                 # Company management components
│   ├── disbursement/            # Disbursement module components
│   ├── access/                  # Access control components
│   ├── providers/               # Providers (I18n, Query, Auth, Root)
│   ├── ui/                      # shadcn/ui components
│   ├── LanguageSwitcher.tsx     # Language selector
│   ├── ProtectedRoute.tsx       # Route protection wrapper
│   └── AuthInitializer.tsx      # Auth state initialization
│
├── hooks/
│   ├── useApi.ts                # API calls with auth
│   ├── useAuthorization.ts      # Permission checking hook
│   └── useI18n.ts               # Translation hook
│
├── lib/
│   ├── auth.ts                  # Auth utilities & JWT handling
│   ├── permissions.ts           # Permission & role definitions
│   ├── rbac.ts                  # RBAC utility functions
│   ├── utils.ts                 # General utilities
│   └── cn()                     # Classname merger (from shadcn)
│
├── store/
│   ├── authStore.ts             # Auth state management (Zustand)
│   └── appStore.ts              # App-wide state
│
├── i18n/
│   ├── config.ts                # i18next configuration
│   └── locales/
│       ├── en.json              # English translations
│       └── fr.json              # French translations
│
├── types/
│   └── index.ts                 # TypeScript type definitions
│
├── middleware.ts → proxy.ts      # Request middleware
└── .env.example                 # Environment variables template
```

---

## Key Technologies & Patterns

### State Management
**Zustand for Auth**:
- User info, tokens, and company context
- Persistent storage with localStorage
- Automatic logout on token expiration

**React Query for Data**:
- Server state management
- Automatic caching and refetching
- Request deduplication
- Background synchronization

### Forms & Validation
**React Hook Form + Zod**:
- Type-safe form validation
- Real-time error feedback
- Nested object support
- File upload integration

### Internationalization
**i18next**:
- Client-side language detection
- Language persistence
- English and French support
- Easy to add more languages

### Styling
**Tailwind CSS v4 + shadcn/ui**:
- Design tokens in globals.css
- Responsive design system
- Pre-built accessible components
- Dark mode support (via theme tokens)

### Authentication Flow
1. User logs in → JWT tokens issued
2. Access token stored in Zustand
3. API calls include token in Authorization header
4. 401 response triggers automatic token refresh
5. Failed refresh triggers logout

### Permission Checking
1. Backend validates user has permission
2. Frontend hides/disables features via `<CanAccess>`
3. Routes protected with `<ProtectedRoute>`
4. Hook-based checks in components: `useAuthorization()`

---

## Database Schema (PostgreSQL Required)

### Core Tables
- **users**: User accounts with roles and auth info
- **companies**: Multi-tenant data isolation
- **departments**: Company departments
- **offices**: Office locations
- **company_users**: User-company relationships
- **roles**: User roles with permissions
- **user_roles**: User role assignments

### Financial Tables
- **disbursements**: Disbursement requests
- **approvals**: Approval history and workflow
- **collections**: Incoming payments
- **bank_reconciliations**: Bank statement matching
- **bank_accounts**: Company bank accounts

### Supporting Tables
- **audit_logs**: All system activity
- **notifications**: In-app and email notifications
- **settings**: Company and system settings

---

## API Endpoints (Backend Required)

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Disbursements
- `GET /api/disbursements`
- `POST /api/disbursements`
- `GET /api/disbursements/:id`
- `PATCH /api/disbursements/:id`
- `POST /api/disbursements/:id/approve`
- `GET /api/disbursements/approvals/pending`

### Collections
- `GET /api/collections`
- `POST /api/collections`
- `GET /api/collections/:id`
- `PATCH /api/collections/:id/status`
- `POST /api/collections/:id/reconcile`
- `GET /api/collections/analytics`

### Company Management
- `GET /api/companies/:id`
- `PATCH /api/companies/:id`
- `GET /api/companies/:id/users`
- `POST /api/companies/:id/users/invite`
- `PATCH /api/companies/:id/roles`

### Admin
- `GET /api/admin/companies`
- `GET /api/admin/users`
- `GET /api/admin/subscriptions`
- `GET /api/admin/logs`

---

## Security Features

1. **Authentication**: JWT with refresh token rotation
2. **Authorization**: RBAC with 40+ granular permissions
3. **Data Isolation**: Multi-tenant with SQL-level isolation
4. **Input Validation**: Zod schema validation on client & backend
5. **CORS**: Configured for secure cross-origin requests
6. **SQL Injection Prevention**: Parameterized queries
7. **Rate Limiting**: Recommended for API endpoints
8. **Audit Logging**: All actions logged with user & timestamp
9. **HTTPS**: Required in production
10. **Password Security**: bcrypt hashing required in backend

---

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# i18n
NEXT_PUBLIC_DEFAULT_LANGUAGE=en

# Auth URLs
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Optional: Analytics, Sentry, etc.
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Deployment

### Recommended Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Self-hosted (Docker)**

### Pre-Deployment Checklist
- [ ] Backend API deployed and tested
- [ ] Database migrated and seeded
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Monitoring/logging setup
- [ ] Backup strategy configured
- [ ] CDN configured (optional)

### Build & Deploy
```bash
npm run build
npm run start
```

---

## Documentation Files

- **README.md**: Project overview and quick start
- **SETUP.md**: Development setup guide
- **AUTHENTICATION.md**: Auth system documentation
- **ADMIN_DASHBOARD.md**: Admin panel features
- **COMPANY_MANAGEMENT.md**: Multi-tenant system
- **DISBURSEMENT_WORKFLOW.md**: Disbursement module
- **COLLECTIONS_INFLOW.md**: Collections module
- **RBAC_PERMISSIONS.md**: Access control system

---

## Development Workflow

1. **Setup**: Clone repo, install dependencies, configure env vars
2. **Backend**: Deploy API server (not included in this repo)
3. **Database**: Run migrations to create schema
4. **Development**: `npm run dev` for local development
5. **Testing**: Test all user roles and permissions
6. **Deployment**: Follow deployment checklist
7. **Monitoring**: Set up error tracking and analytics

---

## Future Enhancements

- [ ] Real-time notifications via WebSocket
- [ ] Advanced analytics and forecasting
- [ ] Automated workflow triggers
- [ ] Integration with accounting software
- [ ] Mobile app (React Native)
- [ ] Document management system
- [ ] Approval templates
- [ ] Bulk operations
- [ ] Custom reports builder
- [ ] API webhook system

---

## Support & Maintenance

- Code is well-documented with inline comments
- Type-safe throughout with TypeScript
- Modular component structure for easy maintenance
- Comprehensive error handling
- Internationalization support for global usage

---

## License

[Add appropriate license here]

---

## Project Statistics

- **Lines of Code**: ~3,500+
- **Components**: 30+
- **Pages**: 15+
- **Translations**: 2 languages
- **Permissions**: 40+
- **Roles**: 9 predefined + custom support
- **Database Tables**: 15+

---

Generated with v0 - Next.js AI Builder
