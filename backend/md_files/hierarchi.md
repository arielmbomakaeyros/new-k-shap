# K-shap Permission Hierarchy & Kaeyros Role

## 🎯 Correct Permission Structure

### **Company Operations** (Primary)
```
Company Super Admin (First User)
    ├── Full control over their company
    ├── Can force complete disbursements
    ├── Can undo any action
    ├── Can revert status
    ├── Can manage users, roles, permissions
    └── Can configure company settings
```

### **Kaeyros Role** (Secondary - Emergency Support Only)
```
Kaeyros Support Team
    ├── Access to ALL companies (read-only by default)
    ├── Emergency intervention when company can't solve issues
    ├── All actions logged as "KAEYROS INTERVENTION"
    ├── Company super admin notified of intervention
    └── Used for: support, troubleshooting, emergency fixes
```

---

## 📋 Who Can Do What

### **Force Complete Disbursement**

**Primary:** Company Super Admin
```typescript
// Company ABC's super admin force completing Company ABC's disbursement
✅ ALLOWED - This is their company
📝 Logged as: "Force completed by Company Super Admin"
🔔 Severity: warning
```

**Secondary:** Kaeyros (Emergency Support)
```typescript
// Kaeyros user force completing Company ABC's disbursement
✅ ALLOWED - But only for emergency support
📝 Logged as: "[KAEYROS INTERVENTION] Force completed"
🔔 Severity: critical
📧 Notification: Sent to Company ABC super admin
💬 Message: "Kaeyros support intervened on disbursement DISB-2024-001234"
```

**Not Allowed:**
```typescript
// Kaeyros trying to use company super admin account
❌ FORBIDDEN - "Use your Kaeyros account for company operations"

// Regular user trying to force complete
❌ FORBIDDEN - "Only company super admin can force complete"
```

---

### **Undo Actions**

**Hierarchy:**

1. **Company Super Admin** (Always allowed for their company)
```typescript
if (isCompanySuperAdmin && belongsToCompany) {
  return true; // No restrictions
}
```

2. **Kaeyros** (Emergency support, any company)
```typescript
if (isKaeyrosUser) {
  return true; // Emergency support
  // But logged as critical intervention
}
```

3. **Configured Roles** (Based on company settings)
```typescript
// Example: Company allows validators to undo their own approvals
if (undoRules.allowedRoles.includes(user.role)) {
  return checkTimeLimit(action, rule.timeLimitHours);
}
```

---

### **Access Company Data**

**Company Super Admin:**
```typescript
// Can access ONLY their company's data
GET /api/v1/companies/:companyId/disbursements
✅ ALLOWED if companyId === user.company
❌ FORBIDDEN if companyId !== user.company
```

**Kaeyros:**
```typescript
// Can access ANY company's data (for support)
GET /api/v1/companies/:companyId/disbursements
✅ ALLOWED for any companyId
📝 Logged in audit trail
🔔 Company can see Kaeyros accessed their data
```

---

## 🔐 Permission Guard Logic

```typescript
// src/common/guards/company-access.guard.ts

canActivate(context: ExecutionContext): boolean {
  const user = request.user;
  const params = request.params;

  // 1. Kaeyros can access ALL companies (for support)
  if (user.isKaeyrosUser) {
    // Log the access
    this.auditLogService.log({
      action: 'KAEYROS_DATA_ACCESS',
      user: user._id,
      company: params.companyId,
      severity: 'info',
      metadata: { accessType: 'support' }
    });
    return true;
  }

  // 2. Company users can ONLY access their own company
  if (params.companyId && user.company) {
    if (params.companyId !== user.company.toString()) {
      throw new ForbiddenException(
        'You do not have access to this company data'
      );
    }
  }

  return true;
}
```

---

## 📊 Audit Trail Differences

### Company Super Admin Action:
```json
{
  "action": "DISBURSEMENT_FORCE_COMPLETED",
  "actionDescription": "Force completed disbursement DISB-2024-001234",
  "user": "company_super_admin_id",
  "company": "company_abc_id",
  "severity": "warning",
  "metadata": {
    "reason": "Urgent disbursement needed",
    "interventionType": "company_admin"
  }
}
```

### Kaeyros Intervention:
```json
{
  "action": "DISBURSEMENT_FORCE_COMPLETED",
  "actionDescription": "[KAEYROS INTERVENTION] Force completed disbursement DISB-2024-001234",
  "user": "kaeyros_support_id",
  "company": "company_abc_id",
  "severity": "critical",
  "metadata": {
    "reason": "Emergency support - company reported system issue",
    "interventionType": "emergency_support",
    "isKaeyrosIntervention": true
  }
}
```

---

## 🎯 Use Cases

### **Scenario 1: Normal Force Complete**
```
Company ABC's super admin needs to bypass workflow for urgent payment
👤 User: Company ABC Super Admin
🎯 Action: Force complete disbursement
✅ Result: Completed successfully
📝 Log: Standard force completion (severity: warning)
📧 Notify: Stakeholders in company
```

### **Scenario 2: Emergency Support**
```
Company ABC reports: "Can't complete disbursement, validator is on leave"
👤 User: Kaeyros Support Agent
🎯 Action: Force complete disbursement
✅ Result: Completed successfully
📝 Log: KAEYROS INTERVENTION (severity: critical)
📧 Notify: Company ABC super admin + stakeholders
💬 Email: "Kaeyros support intervened to resolve your issue"
```

### **Scenario 3: Kaeyros Using Wrong Account**
```
Kaeyros agent tries to use Company ABC super admin account
❌ Error: "Use your Kaeyros account for company operations"
💡 Reason: Transparency - all Kaeyros actions must be logged as such
```

---

## 🔔 Notifications

### When Kaeyros Intervenes:
```typescript
async notifyKaeyrosIntervention(disbursement, kaeyrosUser, reason) {
  // 1. Find company super admin
  const companySuperAdmin = await this.userModel.findOne({
    company: disbursement.company,
    systemRoles: 'company_super_admin'
  });

  // 2. Send email notification
  await this.emailService.send({
    to: companySuperAdmin.email,
    subject: 'Kaeyros Support Intervention Notice',
    template: 'kaeyros-intervention',
    context: {
      disbursementRef: disbursement.referenceNumber,
      action: 'Force Completed',
      kaeyrosAgent: kaeyrosUser.firstName + ' ' + kaeyrosUser.lastName,
      reason: reason,
      timestamp: new Date(),
    }
  });

  // 3. Create in-app notification
  await this.notificationService.create({
    user: companySuperAdmin._id,
    type: 'kaeyros_intervention',
    title: 'Kaeyros Support Intervention',
    message: `Kaeyros support force completed disbursement ${disbursement.referenceNumber}`,
    priority: 'high',
    metadata: { disbursementId: disbursement._id }
  });
}
```

---

## ✅ Summary

### **Company Super Admin (First User)**
- ✅ Full control over THEIR company
- ✅ Force complete disbursements
- ✅ Undo any action
- ✅ Manage users, roles, settings
- ✅ Primary admin for all company operations
- ❌ Cannot access other companies

### **Kaeyros**
- ✅ View ALL companies (for support)
- ✅ Emergency interventions (logged as critical)
- ✅ Access any company's data (logged)
- ✅ Force complete when company can't (emergency)
- 📝 All actions logged as "KAEYROS INTERVENTION"
- 📧 Company notified of interventions
- ⚠️ Should NOT be used for routine operations

### **Key Principle**
> **Companies manage themselves. Kaeyros provides support when needed.**
> 
> Think of it like:
> - **Company Super Admin** = Building Manager
> - **Kaeyros** = Building Owner (only intervenes for major issues)

---

## 🎨 Frontend Implications

### Display Kaeyros Interventions Differently:
```jsx
{action.metadata?.isKaeyrosIntervention && (
  <div className="kaeyros-intervention-badge">
    <Icon name="shield" />
    <span>KAEYROS SUPPORT INTERVENTION</span>
    <Tooltip>
      Kaeyros support team intervened on this disbursement
      to resolve: {action.reason}
    </Tooltip>
  </div>
)}
```

### Show in Timeline:
```
🛡️ 14:30  [KAEYROS INTERVENTION] Force completed by Support Agent John
           Reason: Emergency support - validator unavailable
           Company notified: Yes
```

This makes it **crystal clear** who did what and why! 🎯