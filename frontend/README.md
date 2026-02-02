# K-shap - Enterprise Financial Management Platform

A comprehensive multi-tenant platform for tracking enterprise disbursements and cash inflows with multi-step approval workflows, role-based access control, and complete audit trails.

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Internationalization**: i18next (EN, FR)
- **Forms**: React Hook Form

### Backend
- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT (Access + Refresh tokens)
- **Email**: NodeMailer
- **Logging**: Winston
- **Error Handling**: Custom error module

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout with providers
│   ├── globals.css         # Global styles
│   └── page.tsx            # Home page
├── components/
│   ├── providers/          # Context providers
│   │   ├── RootProvider.tsx
│   │   ├── I18nProvider.tsx
│   │   └── QueryProvider.tsx
│   ├── ui/                 # shadcn/ui components
│   ├── LanguageSwitcher.tsx
│   └── ...
├── hooks/                  # Custom React hooks
│   ├── useApi.ts          # API call wrapper
│   ├── useI18n.ts         # i18next wrapper
│   └── ...
├── store/                  # Zustand stores
│   ├── authStore.ts       # Authentication state
│   ├── appStore.ts        # App settings state
│   └── ...
├── lib/
│   ├── utils.ts           # Utility functions
│   └── ...
├── types/
│   └── index.ts           # TypeScript type definitions
└── i18n/
    ├── config.ts          # i18next configuration
    └── locales/
        ├── en.json        # English translations
        └── fr.json        # French translations
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:3001/api`

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp src/.env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features

### Authentication
- Email/password login and signup
- JWT token management (access + refresh)
- Protected routes
- Password recovery flow
- First-time password change requirement

### Disbursement Management
- Create and track disbursements
- Multi-step approval workflow
- Role-based validation
- Bulk approval for super admin
- Historical tracking with timestamps
- Document uploads

### Cash Inflow Tracking
- Record money entries from various sources
- Track advance payments and balances
- Upload supporting documents
- Export to Excel/CSV

### Role-Based Access Control
- Super Admin (platform owner)
- Company Owner
- Validator
- Department Head
- Cashier
- Agent
- Accountant

### Company Settings
- Department management
- Office locations
- Permission configuration
- Role assignment
- Email settings
- Notification preferences
- Disbursement types
- Beneficiary management

### Notifications
- In-app notifications
- Email notifications
- Real-time updates via WebSocket
- User/role-based notification preferences

### Reporting & Analytics
- Disbursement reports
- Cash flow reports
- Approval workflow analytics
- Export functionality

### Audit & Logging
- Complete action audit trail
- User activity logging
- System error logging
- File-based log persistence

## Internationalization

The application supports English and French. Language selection is stored in localStorage and can be switched via the language switcher component in the header.

To add a new language:
1. Create a new JSON file in `src/i18n/locales/{language}.json`
2. Add the language code to `src/i18n/config.ts`
3. Update the language list in `src/components/LanguageSwitcher.tsx`

## State Management

### Zustand Stores

#### authStore
- User authentication state
- Token management
- Auth actions (login, logout, setUser)

#### appStore
- Theme preference
- Sidebar state
- Current company context
- General app settings

## API Integration

The application communicates with a NestJS backend via REST API. The base URL is configured in environment variables (`NEXT_PUBLIC_API_URL`).

### API Helper
Use the `useApi` hook for making authenticated API requests:

```tsx
const { fetchAPI } = useApi();

const data = await fetchAPI('/endpoint', {
  method: 'GET',
});
```

## Error Handling

Errors are standardized across the frontend and backend for consistent error handling.

### Frontend Error Boundaries
- Page-level error boundaries
- Component-level error handling
- User-friendly error messages

## Next Steps

1. **Build Authentication Module** - Login/signup pages and flows
2. **Create Dashboard** - Overview and analytics
3. **Implement Disbursement Module** - Full workflow implementation
4. **Build Cash Inflow Module** - Collection tracking
5. **Add Settings Pages** - Company configuration
6. **Implement Notifications** - WebSocket integration
7. **Build Reporting** - Analytics and exports

## Development Notes

- All paths use `@/` alias which points to `src/`
- Client components must have `'use client'` directive
- Use TypeScript for type safety
- Follow existing code patterns for consistency
- Use Tailwind CSS for styling
- Implement responsive design with mobile-first approach

## License

MIT
