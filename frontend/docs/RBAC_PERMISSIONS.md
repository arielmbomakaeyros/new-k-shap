# Role-Based Access Control (RBAC) & Permissions Documentation

## Overview

K-shap implements a comprehensive Role-Based Access Control system with granular permissions. The system supports platform-wide roles and company-level custom roles with flexible permission assignment.

## Role Types

### Platform-Level Roles

#### Super Admin
- **Scope**: Global platform access
- **Description**: Full platform control, user management, company management, billing
- **Key Permissions**:
  - All admin functions
  - All user management
  - All company management
  - Platform settings
  - Audit logs and reports

#### Company-Level Roles

##### Company Owner
- **Scope**: Company-wide access
- **Description**: Full company control, equivalent to super admin at company level
- **Key Permissions**:
  - All company settings
  - User management
  - Department and office management
  - All financial features
  - All analytics and reports

##### Company Admin
- **Scope**: Company management
- **Description**: Administrative duties within a company
- **Key Permissions**:
  - User management
  - Department/office management
  - Most financial features
  - Analytics and reporting
  - Settings management

##### Department Head
- **Scope**: Department-level
- **Description**: Department management and disbursement approval authority
- **Key Permissions**:
  - Create disbursement requests
  - Approve as department head
  - View department analytics
  - Limited user view

##### Finance Manager
- **Scope**: Company-wide financial
- **Description**: Financial oversight, validation, and analytics
- **Key Permissions**:
  - View all disbursements
  - Validate and approve disbursements
  - Process collections
  - Bank reconciliation
  - Advanced analytics
  - Comprehensive reporting

##### Validator
- **Scope**: Financial validation
- **Description**: Validates disbursement requests for compliance and budget
- **Key Permissions**:
  - View disbursements
  - Approve/reject at validation stage
  - View collections
  - Bank reconciliation

##### Cashier
- **Scope**: Payment processing
- **Description**: Processes approved disbursements and records collections
- **Key Permissions**:
  - View disbursements
  - Process/execute disbursements
  - Record collections
  - Basic analytics

##### Employee
- **Scope**: Personal access
- **Description**: Standard employee access for creating requests
- **Key Permissions**:
  - View dashboard
  - Create disbursement requests
  - View collections
  - View own analytics

##### Guest
- **Scope**: Read-only
- **Description**: Limited read-only access to dashboard
- **Key Permissions**:
  - View dashboard only

## Permission Categories

### Dashboard & Basic Access
| Permission | Description | Roles |
|-----------|-------------|-------|
| `dashboard:view` | View main dashboard | All |
| `dashboard:export` | Export dashboard data | Owner, Admin, Finance Manager |

### Disbursement Management
| Permission | Description | Required For |
|-----------|-------------|--------------|
| `disbursement:view` | View disbursements | Most roles |
| `disbursement:create` | Create requests | Dept Head, Owner, Admin |
| `disbursement:edit` | Edit own requests | Creator, Admin |
| `disbursement:delete` | Delete requests | Admin, Owner |
| `disbursement:approve_department` | Dept head approval | Department Head, Admin |
| `disbursement:approve_validate` | Validator approval | Validator, Finance Manager |
| `disbursement:approve_cashier` | Cashier approval | Cashier, Finance Manager |
| `disbursement:export` | Export disbursements | Finance roles |

### Collection Management
| Permission | Description | Required For |
|-----------|-------------|--------------|
| `collection:view` | View collections | Finance roles |
| `collection:create` | Record collections | Cashier, Finance Manager |
| `collection:edit` | Edit collections | Cashier, Finance Manager |
| `collection:delete` | Delete collections | Admin, Owner |
| `collection:reconcile` | Bank reconciliation | Finance Manager, Validator |
| `collection:export` | Export collections | Finance Manager |

### Company Management
| Permission | Description | Assigned To |
|-----------|-------------|------------|
| `company:view` | View settings | Admin+, Owner |
| `company:edit` | Edit settings | Owner, Admin |
| `company:manage_users` | User management | Owner, Admin |
| `company:manage_departments` | Department management | Owner, Admin |
| `company:manage_offices` | Office management | Owner, Admin |
| `company:manage_roles` | Custom role creation | Owner only |

### User Management
| Permission | Description | Assigned To |
|-----------|-------------|------------|
| `user:view` | View user list | Owner, Admin, Managers |
| `user:create` | Invite users | Owner, Admin |
| `user:edit` | Edit user details | Owner, Admin |
| `user:delete` | Remove users | Owner, Admin |
| `user:manage_roles` | Assign roles | Owner, Admin |

### Analytics & Reports
| Permission | Description | Assigned To |
|-----------|-------------|------------|
| `analytics:view` | View analytics | Most roles |
| `analytics:export` | Export reports | Owner, Admin, Finance Manager |
| `analytics:advanced` | Advanced analytics | Owner, Admin, Finance Manager |

### System Access
| Permission | Description | Assigned To |
|-----------|-------------|------------|
| `admin:view` | Admin panel | Super Admin only |
| `admin:manage_companies` | Company management | Super Admin only |
| `admin:manage_subscriptions` | Subscription management | Super Admin only |
| `admin:manage_users` | Platform user management | Super Admin only |
| `admin:view_logs` | System logs | Super Admin only |

## Implementation

### Using Permissions in Code

#### Permission Check Hook
```typescript
import { useAuthorization } from '@/hooks/useAuthorization';

function MyComponent() {
  const { can, canAny, canAll, isAdmin } = useAuthorization();

  if (!can('disbursement:view')) {
    return <AccessDenied />;
  }

  return <DisbursementList />;
}
```

#### Component-Level Access Control
```typescript
import { CanAccess } from '@/components/access/CanAccess';

function MyComponent() {
  return (
    <>
      <CanAccess permission="disbursement:create">
        <CreateButton />
      </CanAccess>

      <CanAccess permission={['disbursement:edit', 'disbursement:delete']} requireAll={false}>
        <EditButton />
      </CanAccess>
    </>
  );
}
```

#### Utility Functions
```typescript
import { hasPermission, isAdmin, isApprover } from '@/lib/rbac';

// Check single permission
if (hasPermission(user, 'disbursement:approve_validate')) {
  // Show validation controls
}

// Check role
if (isAdmin(user.role)) {
  // Show admin features
}

// Check approval authority
if (isApprover(user.role, 'validator')) {
  // Show validator-specific options
}
```

### API Security

All API endpoints should verify permissions server-side:

```typescript
// Example API route
import { hasPermission } from '@/lib/rbac';

export async function GET(request: Request) {
  const user = await getSession();

  if (!hasPermission(user, 'disbursement:view')) {
    return new Response('Forbidden', { status: 403 });
  }

  // Process request
}
```

## Custom Roles

Companies with the `company:manage_roles` permission can create custom roles.

### Creating Custom Role

1. Go to Company Settings → Roles
2. Click "Create New Role"
3. Enter role name and description
4. Select permissions from available list
5. Set department scope (optional)
6. Save role

### Custom Role Limitations

- Must inherit from base role
- Cannot override super admin permissions
- Scope limited to company
- Maximum 10 custom roles per company

## Permission Inheritance

Roles can inherit permissions from parent roles:

```
super_admin
  └── company_owner
      ├── company_admin
      └── department_head
          └── employee
              └── guest
```

When a user is assigned a role, they automatically get all permissions from inherited roles.

## Access Control Patterns

### Pattern 1: Feature Visibility
```typescript
<CanAccess permission="disbursement:approve_validate">
  <ApprovalSection />
</CanAccess>
```

### Pattern 2: Button/Action Availability
```typescript
<Button disabled={!can('disbursement:create')}>
  Create Request
</Button>
```

### Pattern 3: Route Protection
```typescript
// In layout or page component
if (!can('company:view')) {
  return <Redirect to="/unauthorized" />;
}
```

### Pattern 4: Multi-Permission Requirements
```typescript
// User must have ALL these permissions
if (canAll(['admin:manage_companies', 'admin:manage_subscriptions'])) {
  // Show full admin control panel
}

// User must have ANY of these permissions
if (canAny(['company_owner', 'company_admin'])) {
  // Show company management options
}
```

## Audit & Logging

All permission checks and access events should be logged:

- Who accessed what
- When they accessed it
- Whether access was granted/denied
- Reason for denial (if applicable)

Access logs are available in Settings → Audit Logs.

## Best Practices

1. **Principle of Least Privilege**
   - Assign minimum required permissions
   - Review permissions regularly
   - Revoke unnecessary access

2. **Regular Audits**
   - Review user permissions quarterly
   - Remove inactive users
   - Update roles as responsibilities change

3. **Separation of Duties**
   - Different users for different approval stages
   - Validator ≠ Cashier ≠ Department Head
   - Finance controls by independent parties

4. **Documentation**
   - Document custom role purposes
   - Maintain user-role mapping
   - Keep audit trail

5. **Testing**
   - Test permission boundaries
   - Verify access control enforcement
   - Check for privilege escalation risks

## Troubleshooting

### User Can't Access Feature
1. Check user's assigned role
2. Verify role has required permission
3. Check for company-level restrictions
4. Review audit logs for access attempts

### Permission Not Working
1. Verify permission name is correct
2. Check hook/utility usage
3. Ensure permission is in ROLE_PERMISSIONS
4. Test with super admin to isolate issue

### Custom Role Issues
1. Verify role created in correct company
2. Check permission selections
3. Verify users assigned to role
4. Review inheritance rules

## API Reference

### useAuthorization Hook
```typescript
const {
  user,                          // Current user object
  can,                            // Check single permission
  canAny,                         // Check any permission
  canAll,                         // Check all permissions
  isAdmin,                        // Check if admin role
  isFinanceRole,                 // Check if finance role
  isApprover,                    // Check if can approve
  getPermissions,                // Get all user permissions
  isAuthenticated,               // Check if logged in
  hasRole,                       // Check specific role
  hasCompanyId,                  // Check company membership
} = useAuthorization();
```

### CanAccess Component
```typescript
<CanAccess 
  permission="disbursement:view"  // Single permission
  fallback={<div>Access Denied</div>} // Optional fallback
  requireAll={false}              // For arrays: all vs any
>
  <YourComponent />
</CanAccess>
```

### RBAC Utilities
```typescript
hasPermission(user, permission)           // Boolean
hasAnyPermission(user, permissions[])     // Boolean
hasAllPermissions(user, permissions[])    // Boolean
getUserPermissions(user)                  // Permission[]
roleCanAccess(role, permission)           // Boolean
getRolesWithPermission(permission)        // string[]
isAdmin(role)                             // Boolean
isFinanceRole(role)                       // Boolean
isApprover(role, stage?)                  // Boolean
```

## Security Considerations

1. **Server-Side Enforcement**: Always verify permissions on the backend
2. **Token Refresh**: Permissions are embedded in JWT - refresh on role change
3. **Denial of Service**: Rate limit permission checks
4. **Audit Trail**: Log all access control decisions
5. **Encryption**: Protect permission configurations in transit
