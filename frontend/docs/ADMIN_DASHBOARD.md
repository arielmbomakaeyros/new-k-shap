# Admin Dashboard Documentation

## Overview

The Admin Dashboard is exclusively for K-shap platform owners (super admins) to manage all companies, subscriptions, users, and system configuration.

## Access Control

Only users with `super_admin` role can access the admin dashboard:
- `/admin` - Protected by `ProtectedRoute` with role check
- Attempts to access without proper role are redirected to `/dashboard`

## Pages & Features

### 1. Overview Dashboard (`/admin`)

Central hub showing key platform metrics and alerts.

**Features:**
- **Stats Cards**: 
  - Total Companies (24)
  - Active Subscriptions (21)
  - Total Users (487)
  - Monthly Revenue ($24,500)
  
- **Recent Companies**: List of newly registered companies
- **Subscription Alerts**: 
  - Expiring Soon
  - Expired
  - New Signups
  - Upgrade Available
  
- **Quick Actions**: 
  - Create Company
  - Manage Subscriptions
  - View Reports
  - System Settings

### 2. Companies Management (`/admin/companies`)

Manage all subscribed companies and their subscription status.

**Features:**
- **Search & Filter**: 
  - Search by company name or email
  - Filter by subscription status (Active, Suspended, Inactive, Expired)
  
- **Companies Table**:
  - Company name
  - Email
  - Subscription status (with dropdown to change)
  - Number of users
  - Creation date
  - Actions: Edit, Delete
  
- **Bulk Actions**: 
  - Select multiple companies
  - Perform batch operations

**API Endpoints Needed:**
```
GET    /admin/companies              - List all companies
POST   /admin/companies              - Create company
GET    /admin/companies/:id          - Get company details
PUT    /admin/companies/:id          - Update company
DELETE /admin/companies/:id          - Delete company
PUT    /admin/companies/:id/subscription  - Change subscription status
```

### 3. Subscriptions Management (`/admin/subscriptions`)

Monitor and manage subscription plans and renewals.

**Features:**
- **Summary Cards**:
  - Active Subscriptions
  - Expiring Soon (< 30 days)
  - Expired
  - Monthly Revenue
  
- **Subscriptions Table**:
  - Company name
  - Plan (Starter, Professional, Enterprise)
  - Status (Active, Expired, Suspended)
  - Number of users
  - Price per month
  - Days until expiry
  - Actions: Edit, Renew
  
- **Filters & Search**:
  - By status
  - By plan type
  - By company name

**API Endpoints Needed:**
```
GET    /admin/subscriptions          - List subscriptions
POST   /admin/subscriptions          - Create subscription
GET    /admin/subscriptions/:id      - Get subscription details
PUT    /admin/subscriptions/:id      - Update subscription
DELETE /admin/subscriptions/:id      - Cancel subscription
POST   /admin/subscriptions/:id/renew - Renew subscription
```

### 4. Users Management (`/admin/users`)

Manage all users across all companies.

**Features:**
- **Search & Filter**:
  - Search by name or email
  - Filter by role (Company Owner, Validator, Department Head, Agent, Cashier, Accountant)
  
- **Users Table**:
  - User name
  - Email
  - Company
  - Role
  - Status (Active, Inactive)
  - Join date
  - Actions: Edit, Deactivate
  
- **Bulk Actions**:
  - Deactivate multiple users
  - Change roles

**API Endpoints Needed:**
```
GET    /admin/users                  - List all users
POST   /admin/users                  - Create user
GET    /admin/users/:id              - Get user details
PUT    /admin/users/:id              - Update user
DELETE /admin/users/:id              - Delete user
PUT    /admin/users/:id/status       - Change user status
```

### 5. Analytics (`/admin/analytics`)

View platform-wide analytics and metrics.

**Features:**
- **Key Metrics**:
  - Total Transactions
  - Total Disbursements
  - Average Response Time
  - User Growth
  
- **Charts** (Recharts):
  - Revenue Trend (line chart)
  - Active Companies (pie/bar chart)
  - User Growth (line chart)
  - Transaction Volume (bar chart)
  
- **Top Companies**: 
  - Ranked by revenue
  - User count
  - Activity level

**API Endpoints Needed:**
```
GET    /admin/analytics/stats        - Get summary statistics
GET    /admin/analytics/revenue      - Revenue data (time series)
GET    /admin/analytics/companies    - Company statistics
GET    /admin/analytics/transactions - Transaction data
```

### 6. System Logs (`/admin/logs`)

Monitor all system activities, errors, and user actions.

**Features:**
- **Log Levels**:
  - Info (blue)
  - Warning (yellow)
  - Error (red)
  
- **Log Table**:
  - Timestamp
  - Log level
  - User
  - Action (LOGIN, CREATE_DISBURSEMENT, UPDATE_COMPANY, etc.)
  - Resource type
  - Status (success/failed)
  - Details/message
  
- **Filters**:
  - By log level
  - By status
  - By user
  - By date range
  
- **Export Options**:
  - CSV export
  - JSON export
  - Date range selection

**API Endpoints Needed:**
```
GET    /admin/logs                   - Get system logs
GET    /admin/logs/export            - Export logs (CSV/JSON)
POST   /admin/logs/search            - Search logs with filters
```

### 7. Settings (`/admin/settings`)

Configure platform-wide settings.

**Sections:**

#### Email Configuration
- SMTP Host
- SMTP Port
- SMTP User
- SMTP Password
- From Email

#### Notifications
- Send error alerts
- Daily activity summary
- Suspicious login alerts
- Subscription reminders

#### Subscription Plans
- Starter Plan ($299/month)
- Professional Plan ($999/month)
- Enterprise Plan ($2,999/month)
- Edit/configure features for each plan

#### API Configuration
- API Base URL
- Rate limiting
- Rate limit threshold (requests/minute)
- API key management

**API Endpoints Needed:**
```
GET    /admin/settings               - Get all settings
PUT    /admin/settings               - Update settings
GET    /admin/settings/email         - Get email config
PUT    /admin/settings/email         - Update email config
GET    /admin/settings/plans         - Get subscription plans
PUT    /admin/settings/plans/:id     - Update plan
```

## Component Structure

```
src/components/admin/
├── AdminLayout.tsx                  # Main admin layout with sidebar
├── AdminStats.tsx                   # Stats cards component
├── CompaniesTable.tsx               # Reusable companies table
└── (other components as needed)

src/app/admin/
├── page.tsx                         # Overview dashboard
├── companies/
│   └── page.tsx                     # Companies management
├── subscriptions/
│   └── page.tsx                     # Subscriptions management
├── users/
│   └── page.tsx                     # Users management
├── analytics/
│   └── page.tsx                     # Analytics dashboard
├── logs/
│   └── page.tsx                     # System logs
└── settings/
    └── page.tsx                     # Platform settings
```

## Navigation Structure

**Admin Sidebar Navigation:**
```
📊 Overview        → /admin
🏢 Companies       → /admin/companies
👥 Users           → /admin/users
💳 Subscriptions   → /admin/subscriptions
📈 Analytics       → /admin/analytics
📋 Logs            → /admin/logs
⚙️ Settings        → /admin/settings
```

## Key Features by Role

### Platform Owner (Super Admin)
- ✅ View all companies
- ✅ Manage subscriptions
- ✅ Activate/suspend companies
- ✅ View all users
- ✅ Access system logs
- ✅ Configure platform settings
- ✅ View analytics and reports
- ✅ Export data
- ✅ Manage email configuration

## Data Models

### Company (Admin View)
```typescript
{
  id: string
  name: string
  email: string
  subscriptionStatus: 'active' | 'suspended' | 'inactive' | 'expired'
  subscriptionEndDate: Date
  usersCount: number
  createdAt: Date
  owner: {
    name: string
    email: string
  }
  features: string[]
}
```

### Subscription
```typescript
{
  id: string
  companyId: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'expired' | 'suspended'
  startDate: Date
  endDate: Date
  price: number
  billingCycle: 'monthly' | 'yearly'
  autoRenew: boolean
}
```

### SystemLog
```typescript
{
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error'
  user: string
  action: string
  resource: string
  status: 'success' | 'failed'
  details: string
  ipAddress?: string
  userAgent?: string
}
```

## Backend Requirements

### Required Endpoints

**Companies:**
```
GET    /admin/companies              List all companies
POST   /admin/companies              Create new company
GET    /admin/companies/:id          Get company details
PUT    /admin/companies/:id          Update company
DELETE /admin/companies/:id          Delete company
PUT    /admin/companies/:id/status   Change subscription status
```

**Subscriptions:**
```
GET    /admin/subscriptions          List subscriptions
POST   /admin/subscriptions          Create subscription
PUT    /admin/subscriptions/:id      Update subscription
POST   /admin/subscriptions/:id/renew Renew subscription
```

**Users:**
```
GET    /admin/users                  List all users
POST   /admin/users                  Create user
GET    /admin/users/:id              Get user details
PUT    /admin/users/:id              Update user
PUT    /admin/users/:id/status       Change user status
```

**Logs:**
```
GET    /admin/logs                   Get system logs
GET    /admin/logs/search            Search logs
GET    /admin/logs/export            Export logs (CSV/JSON)
```

**Analytics:**
```
GET    /admin/analytics/stats        Get statistics
GET    /admin/analytics/revenue      Get revenue data
GET    /admin/analytics/companies    Get company stats
GET    /admin/analytics/transactions Get transaction data
```

**Settings:**
```
GET    /admin/settings               Get all settings
PUT    /admin/settings               Update settings
GET    /admin/settings/email         Get email config
PUT    /admin/settings/email         Update email config
GET    /admin/settings/plans         Get subscription plans
PUT    /admin/settings/plans/:id     Update plan
```

## Security Considerations

1. **Role-Based Access**: Only super_admin role can access
2. **Audit Trail**: Log all admin actions
3. **Rate Limiting**: Protect sensitive endpoints
4. **Data Privacy**: Don't expose sensitive user data
5. **IP Whitelisting**: Optional: restrict admin access to specific IPs
6. **Session Management**: Auto-logout after inactivity

## Future Enhancements

- [ ] Real-time alerts via WebSocket
- [ ] Advanced analytics with date ranges
- [ ] Bulk operations (CSV import/export)
- [ ] Admin activity audit log
- [ ] Two-factor authentication for admin
- [ ] Custom report builder
- [ ] SLA monitoring
- [ ] Automated backup management
- [ ] Multi-admin support with permissions
- [ ] White-label configuration

## Testing Checklist

- [ ] Can access admin dashboard with super_admin role
- [ ] Cannot access without proper role
- [ ] Can view and search companies
- [ ] Can change subscription status
- [ ] Can manage users
- [ ] Can view logs and export
- [ ] Can update settings
- [ ] All filters work correctly
- [ ] Charts/analytics load properly
- [ ] Mobile responsive design
