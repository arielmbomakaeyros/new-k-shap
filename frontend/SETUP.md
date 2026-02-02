# K-shap Project Setup Guide

## Initial Setup Complete ✓

You now have a fully configured Next.js 15 project with:
- **src/ folder structure** - All code organized in src directory
- **i18next internationalization** - English and French translations ready
- **Zustand state management** - Auth and app stores configured
- **React Query** - Data fetching and caching setup
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Styling framework
- **shadcn/ui** - UI component library

## Project Structure Details

### `/src/app` - Next.js App Router
- `layout.tsx` - Root layout with providers
- `globals.css` - Global Tailwind styles
- `page.tsx` - Homepage
- `/auth` - Authentication routes (login, signup)
- `/dashboard` - Dashboard route (protected)

### `/src/components`
- `/ui` - shadcn/ui components (automatically imported)
- `/providers` - Context providers
  - `RootProvider.tsx` - Wraps all providers
  - `I18nProvider.tsx` - i18next setup
  - `QueryProvider.tsx` - React Query setup
- `LanguageSwitcher.tsx` - Language selection component

### `/src/hooks`
- `useApi.ts` - API calls with auth token
- `useI18n.ts` - i18next wrapper
- `use-mobile.tsx` - Mobile detection (from shadcn)
- `use-toast.ts` - Toast notifications (from shadcn)

### `/src/store`
- `authStore.ts` - User auth and token state
- `appStore.ts` - App settings and UI state

### `/src/lib`
- `utils.ts` - Helper functions (cn, API base URL, formatting)

### `/src/types`
- `index.ts` - All TypeScript interfaces and enums

### `/src/i18n`
- `config.ts` - i18next configuration
- `/locales`
  - `en.json` - English translations
  - `fr.json` - French translations

## Environment Setup

Create `.env.local` file in root (copy from `src/.env.example`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Development Workflow

### Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### File Path Aliases
All imports use `@/` which points to `src/`:
```typescript
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/useApi'
import { User } from '@/types'
```

### Adding Translations
Edit `/src/i18n/locales/en.json` and `/src/i18n/locales/fr.json`:
```json
{
  "section": {
    "key": "Your translation here"
  }
}
```

Use in components:
```tsx
const { t } = useTranslation();
<h1>{t('section.key')}</h1>
```

### State Management
Use Zustand hooks in client components:
```tsx
'use client';
import { useAuthStore } from '@/store/authStore';

export default function Component() {
  const { user, logout } = useAuthStore();
  // ...
}
```

### API Calls
Use the useApi hook:
```tsx
const { fetchAPI } = useApi();

const data = await fetchAPI('/endpoint', {
  method: 'POST',
  body: JSON.stringify({ ... })
});
```

## Next Steps - Architecture Overview

### Phase 1: Authentication System
- [ ] Login form with validation
- [ ] Signup with company creation
- [ ] Password recovery flow
- [ ] JWT token management
- [ ] Protected routes

### Phase 2: Core Modules
- [ ] Disbursement module (create, list, approve, execute)
- [ ] Collection/Cash inflow module
- [ ] Dashboard with analytics
- [ ] Reporting and exports

### Phase 3: Advanced Features
- [ ] Multi-step approval workflows
- [ ] Role-based access control (RBAC)
- [ ] WebSocket notifications
- [ ] Real-time updates
- [ ] In-app chat

### Phase 4: Admin & Settings
- [ ] Company management (for platform admin)
- [ ] Company settings (for company owners)
- [ ] User and role management
- [ ] Permission configuration
- [ ] Email and notification settings

### Phase 5: System Features
- [ ] Audit logging
- [ ] Error handling
- [ ] Caching strategies
- [ ] Performance optimization
- [ ] Security hardening

## Key Features to Implement

### Authentication
- [ ] Email/password auth
- [ ] Refresh token rotation
- [ ] Password reset via email
- [ ] First login password change
- [ ] Session management

### Disbursement Management
- [ ] Multi-step approval workflow (Agent → Dept Head → Validator → Cashier)
- [ ] Bulk approval for admins
- [ ] Historical approvals with timestamps
- [ ] Document uploads
- [ ] Email notifications at each stage

### Company Structure
- [ ] Multi-tenant isolation
- [ ] Departments and offices
- [ ] User management per company
- [ ] Role and permission assignment
- [ ] Feature enablement per subscription

### Data Management
- [ ] Pagination for all lists
- [ ] Search and filtering
- [ ] Sorting
- [ ] Export to Excel/CSV
- [ ] Advanced reporting

### Notifications
- [ ] In-app notifications
- [ ] Email notifications
- [ ] WebSocket real-time updates
- [ ] Notification preferences per user/role
- [ ] Reminder scheduling

### Logging & Monitoring
- [ ] Complete action audit trail
- [ ] User activity logging
- [ ] System error logging
- [ ] Alert system for admins
- [ ] Log persistence and rotation

## Backend Integration

The frontend expects a NestJS backend API at `http://localhost:3001/api`.

### Key Backend Endpoints Needed
```
POST   /auth/signup         - Register new company/user
POST   /auth/login          - Login with email/password
POST   /auth/refresh        - Refresh access token
POST   /auth/logout         - Logout user

GET    /users               - List users
POST   /users               - Create user
GET    /users/:id           - Get user details
PUT    /users/:id           - Update user
DELETE /users/:id           - Delete user

GET    /disbursements       - List disbursements
POST   /disbursements       - Create disbursement
GET    /disbursements/:id   - Get disbursement
PUT    /disbursements/:id   - Update disbursement
POST   /disbursements/:id/approve    - Approve
POST   /disbursements/:id/reject     - Reject
POST   /disbursements/:id/execute    - Execute

GET    /collections         - List collections
POST   /collections         - Create collection
GET    /collections/:id     - Get collection
PUT    /collections/:id     - Update collection

GET    /companies           - List companies (admin only)
POST   /companies           - Create company
GET    /companies/:id       - Get company details
PUT    /companies/:id       - Update company
DELETE /companies/:id       - Delete company

... and more endpoints for roles, permissions, notifications, etc.
```

## Important Notes

1. **Always use client components** (`'use client'`) when using hooks like useTranslation, Zustand stores, or React Query
2. **Path aliases**: Always use `@/` imports for consistency
3. **Environment variables**: Frontend vars start with `NEXT_PUBLIC_`, backend vars don't
4. **Styling**: Use Tailwind CSS classes and semantic design tokens from globals.css
5. **Types**: Define all interfaces in `/src/types/index.ts`
6. **API calls**: Always use `useApi` hook for authenticated requests

## Troubleshooting

### i18n not loading?
- Ensure I18nProvider wraps children in RootProvider
- Check browser localStorage for saved language
- Verify JSON translation files are valid

### API calls failing?
- Check `NEXT_PUBLIC_API_URL` in .env.local
- Verify backend is running on correct port
- Check network tab in browser dev tools
- Ensure token is present in Authorization header

### TypeScript errors?
- Run `npm run build` to see all errors
- Check `/src/types/index.ts` for missing interfaces
- Ensure all imports use correct paths

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [i18next Documentation](https://www.i18next.com/overview/getting-started)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
