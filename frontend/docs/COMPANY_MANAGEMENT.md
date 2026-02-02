# Company Management & Multi-Tenant System Documentation

## Overview

The Company Management system allows each company (organization) to manage their internal structure including users, departments, offices, and role-based permissions within the K-shap platform.

## Architecture Overview

### Multi-Tenancy Model

K-shap uses a **tenant-based multi-tenancy model** where:
- Each company is a separate tenant
- Data is logically isolated per company
- All operations are scoped to the authenticated user's company
- Company ID is used as a primary isolation key

### Key Concepts

1. **Company**: Organization that subscribes to K-shap
2. **Department**: Subdivision within a company
3. **Office**: Physical location of the company
4. **User**: Individual within a company
5. **Role**: Set of permissions assigned to users
6. **Permission**: Individual action/access right

## Access Control

### Company-Level Routes

All company routes are protected and scoped to the logged-in user's company:
- `/company/*` - Protected by ProtectedRoute with role check
- Only users with roles: `company_owner`, `validator`, `department_head`

### Role-Based Access by Page

| Page | Required Role(s) | Purpose |
|------|-----------------|---------|
| `/company` | `company_owner`, `validator`, `department_head` | View company dashboard |
| `/company/users` | `company_owner` | Manage company users |
| `/company/departments` | `company_owner` | Manage departments |
| `/company/offices` | `company_owner` | Manage office locations |
| `/company/roles` | `company_owner` | Configure roles & permissions |
| `/company/settings` | `company_owner` | Configure company settings |

## Pages & Features

### 1. Company Dashboard (`/company`)

Central hub showing company overview and quick access to management features.

**Features:**
- **Stats Cards**:
  - Total Users
  - Active Disbursements
  - Departments Count
  - Offices Count

- **Management Sections**:
  - User Management
  - Organization Structure (Departments, Offices)
  - Roles & Permissions
  - Company Settings

- **Recent Activity**: Display of recent events in the company

### 2. Users Management (`/company/users`)

Manage all users within the company.

**Features:**
- **User Table**:
  - Name
  - Email
  - Role (dropdown to change)
  - Department
  - Status (Active/Inactive)
  - Join Date
  - Actions: Edit, Remove

- **Search & Filters**:
  - Search by name or email
  - Filter by role
  - Filter by department (future enhancement)
  - Filter by status

- **Bulk Actions**:
  - Invite multiple users
  - Change roles in bulk
  - Deactivate users

**Features to Implement:**
- Invite new users (send email invitation)
- Role assignment/change
- Department assignment
- User deactivation/activation
- Password reset
- User activity logs

### 3. Departments Management (`/company/departments`)

Organize company into logical departments.

**Features:**
- **Department Cards**:
  - Department name
  - Department head (user)
  - Number of users
  - Creation date
  - Actions: Edit, Delete

- **Create Department Form**:
  - Department name
  - Department head (select from users)
  - Budget (optional)
  - Description

- **Edit Department**:
  - Change name
  - Change department head
  - View department users
  - Manage permissions

**Benefits:**
- Organize workflow by departments
- Assign department heads
- Control access by department
- Track budget per department
- Better reporting and analytics

### 4. Offices Management (`/company/offices`)

Manage physical office locations.

**Features:**
- **Office Cards**:
  - Office name
  - Location (city, country)
  - Full address
  - Number of users
  - Creation date
  - Actions: Edit, Delete

- **Create Office Form**:
  - Office name
  - Location (city, country)
  - Full address
  - Contact information
  - Manager/point of contact

**Benefits:**
- Track office locations
- Organize users by location
- Location-specific configurations
- Regional reporting

### 5. Roles & Permissions (`/company/roles`)

Define custom roles with specific permissions.

**Features:**
- **Built-in Roles**:
  - Validator: Approve disbursements
  - Department Head: Create and approve department requests
  - Agent: Create disbursement requests
  - Accountant: View financial reports
  - Cashier: Execute disbursements

- **Custom Roles**:
  - Create custom roles
  - Assign permissions per role
  - View roles in use
  - Edit existing roles
  - Delete unused roles

- **Available Permissions**:
  ```
  - create_disbursement
  - approve_disbursement
  - execute_disbursement
  - view_reports
  - manage_users
  - manage_departments
  - view_analytics
  - export_data
  - manage_settings
  - approve_collections
  ```

- **Role Details View**:
  - Role name and description
  - All permissions
  - Number of users with role
  - Edit/update permissions
  - Delete role (if not in use)

### 6. Company Settings (`/company/settings`)

Configure company-wide settings and preferences.

**Sections:**

#### Basic Information
- Company name
- Company email
- Phone number
- Industry
- Address
- Logo (optional)
- Website (optional)

#### Email Notifications
- Send email on new request
- Send email on approvals
- Daily/weekly summaries
- Alert on collections
- Customizable recipient list

#### Disbursement Workflow
- Require department head approval
- Require validator approval
- Require cashier execution
- Maximum auto-approve amount
- Approval timeout settings

#### Collection Settings
- Default collection method
- Auto-deposit settings
- Reconciliation rules
- Bank account information

#### Security Settings
- IP whitelisting
- Session timeout
- Password policy
- Two-factor authentication
- Activity logging

#### Company Billing
- Subscription plan
- Billing contact
- Payment method
- Invoice preferences

#### Danger Zone
- Archive company
- Download all company data
- Request data deletion
- Disable company

## Data Models

### Company
```typescript
{
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  logo?: string
  website?: string
  industry?: string
  status: 'active' | 'suspended' | 'archived'
  subscriptionId: string
  subscriptionStatus: SubscriptionStatus
  ownerId: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}
```

### Department
```typescript
{
  id: string
  companyId: string
  name: string
  description?: string
  headId?: string
  budget?: number
  createdAt: Date
  updatedAt: Date
}
```

### Office
```typescript
{
  id: string
  companyId: string
  name: string
  location: string
  address: string
  city: string
  country: string
  contactPerson?: string
  phone?: string
  email?: string
  createdAt: Date
  updatedAt: Date
}
```

### CompanyUser
```typescript
{
  id: string
  userId: string
  companyId: string
  roleId: string
  departmentId?: string
  officeId?: string
  status: 'active' | 'inactive' | 'pending'
  invitedAt?: Date
  acceptedAt?: Date
  joinedAt: Date
}
```

### Role
```typescript
{
  id: string
  companyId: string
  name: string
  description: string
  isCustom: boolean
  permissions: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Permission
```typescript
{
  id: string
  key: string
  label: string
  description: string
  category: 'disbursement' | 'collection' | 'reporting' | 'users' | 'settings'
}
```

## Backend Requirements

### Company Endpoints
```
GET    /companies/:id                - Get company details
PUT    /companies/:id                - Update company info
GET    /companies/:id/stats          - Get company statistics
POST   /companies/:id/archive        - Archive company
```

### User Management Endpoints
```
GET    /companies/:id/users          - List company users
POST   /companies/:id/users          - Invite new user
PUT    /companies/:id/users/:userId  - Update user
DELETE /companies/:id/users/:userId  - Remove user from company
PUT    /companies/:id/users/:userId/role - Change user role
GET    /companies/:id/users/:userId/permissions - Get user permissions
```

### Department Endpoints
```
GET    /companies/:id/departments    - List departments
POST   /companies/:id/departments    - Create department
PUT    /companies/:id/departments/:deptId - Update department
DELETE /companies/:id/departments/:deptId - Delete department
GET    /companies/:id/departments/:deptId/users - Get department users
```

### Office Endpoints
```
GET    /companies/:id/offices        - List offices
POST   /companies/:id/offices        - Create office
PUT    /companies/:id/offices/:officeId - Update office
DELETE /companies/:id/offices/:officeId - Delete office
GET    /companies/:id/offices/:officeId/users - Get office users
```

### Role Endpoints
```
GET    /companies/:id/roles          - List roles
POST   /companies/:id/roles          - Create custom role
PUT    /companies/:id/roles/:roleId  - Update role
DELETE /companies/:id/roles/:roleId  - Delete role
GET    /roles/available              - Get available permissions
```

### Settings Endpoints
```
GET    /companies/:id/settings       - Get company settings
PUT    /companies/:id/settings       - Update settings
GET    /companies/:id/settings/email - Get email config
PUT    /companies/:id/settings/email - Update email config
GET    /companies/:id/settings/workflow - Get workflow config
PUT    /companies/:id/settings/workflow - Update workflow config
```

## Multi-Tenancy Security

### Data Isolation

1. **User Company Association**
   - Every user has a company_id
   - All queries filtered by company_id
   - Cannot access data from other companies

2. **Row Level Security (RLS)**
   - Database enforces company-level isolation
   - Prevent accidental data leakage
   - Audit trail of access attempts

3. **API Authorization**
   - Verify company_id matches user's company
   - Validate user permissions for action
   - Log all data access

### Access Control Rules

```sql
-- Example: Users can only see their company's data
SELECT * FROM disbursements 
WHERE company_id = current_user_company_id;

-- Example: Departments belong to specific company
SELECT * FROM departments 
WHERE company_id = current_user_company_id;
```

### Permission Checks

```typescript
// Before allowing any action:
1. Check user has active session
2. Verify company matches user's company
3. Check user has required role/permission
4. Log the action in audit trail
5. Execute query with company_id filter
```

## Component Structure

```
src/components/company/
├── CompanyLayout.tsx                # Main layout with sidebar
└── (role-specific components as needed)

src/app/company/
├── page.tsx                         # Dashboard
├── users/
│   └── page.tsx                     # User management
├── departments/
│   └── page.tsx                     # Department management
├── offices/
│   └── page.tsx                     # Office management
├── roles/
│   └── page.tsx                     # Roles & permissions
└── settings/
    └── page.tsx                     # Company settings
```

## Database Schema (SQL)

```sql
-- Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  industry VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  subscription_id UUID,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);

-- Departments Table
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  head_id UUID,
  budget DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (head_id) REFERENCES auth.users(id)
);

-- Offices Table
CREATE TABLE offices (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Company Users (Junction Table)
CREATE TABLE company_users (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  role_id UUID NOT NULL,
  department_id UUID,
  office_id UUID,
  status VARCHAR(50) DEFAULT 'active',
  invited_at TIMESTAMP,
  accepted_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (office_id) REFERENCES offices(id),
  UNIQUE(user_id, company_id)
);

-- Roles Table
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  company_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Role Permissions (Junction Table)
CREATE TABLE role_permissions (
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Permissions Table
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Checklist

### Backend
- [ ] Create database tables for multi-tenancy
- [ ] Implement RLS policies in database
- [ ] Create API endpoints for all resources
- [ ] Add company_id filtering to all queries
- [ ] Implement permission checking middleware
- [ ] Create audit logging system
- [ ] Add email invitation system
- [ ] Implement role inheritance (if needed)

### Frontend
- [ ] Create company layout component
- [ ] Build all management pages
- [ ] Implement form validation
- [ ] Add error handling
- [ ] Create confirmation modals
- [ ] Add loading states
- [ ] Implement real-time updates (SWR)
- [ ] Add mobile responsiveness

### Testing
- [ ] Test data isolation between companies
- [ ] Test permission enforcement
- [ ] Test bulk operations
- [ ] Test error scenarios
- [ ] Test concurrent updates
- [ ] Load testing with multiple companies
- [ ] Security testing (SQL injection, XSS, CSRF)

### Documentation
- [ ] API documentation
- [ ] Permission matrix
- [ ] User guide for company admin
- [ ] Troubleshooting guide
- [ ] Security guidelines

## Future Enhancements

- [ ] Advanced role inheritance
- [ ] Temporary role assignments
- [ ] Role approval workflow
- [ ] Delegation of authority
- [ ] Activity audit dashboard
- [ ] Bulk user import (CSV)
- [ ] SSO/SAML integration
- [ ] Custom fields for users/departments
- [ ] Team management (sub-groups within departments)
- [ ] Holiday calendar per office
- [ ] Document management per department
- [ ] Department-level budgets and spending limits
- [ ] Approval hierarchies visualization
