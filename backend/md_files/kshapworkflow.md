# K-shap Complete Timestamp & Undo System 🕐

## Overview

Every action on a disbursement is **tracked with complete timestamps** and **can be undone** with full audit trail. Nothing is ever overwritten - everything is **appended to history**.

---

## 📊 Data Structure

### 1. **WorkflowStep** (for each step: agent, dept head, validator, cashier)

```typescript
{
  status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'undone',
  isCompleted: boolean,
  completedAt: Date,
  completedBy: ObjectId,
  notes: string,
  
  // COMPLETE HISTORY - NEVER OVERWRITTEN
  history: [
    {
      action: 'dept_head_validated',
      performedBy: userId,
      performedByName: 'John Doe',
      performedByRole: 'department_head',
      performedAt: '2024-01-20T10:30:00Z',  // ✅ TIMESTAMP
      notes: 'Approved after reviewing documents',
      metadata: {
        approved: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      }
    },
    {
      action: 'dept_head_validation_undone',
      performedBy: userId,
      performedByName: 'Jane Smith',
      performedByRole: 'company_super_admin',
      performedAt: '2024-01-20T14:45:00Z',  // ✅ UNDO TIMESTAMP
      reason: 'Need to re-review updated invoice',
      metadata: {
        undoneAction: {
          actionId: '...',
          originalAction: 'dept_head_validated',
          originalPerformedBy: 'userId',
          originalPerformedAt: '2024-01-20T10:30:00Z'
        }
      }
    }
  ],
  
  // Undo tracking
  wasUndone: true,
  undoneBy: userId,
  undoneAt: '2024-01-20T14:45:00Z',  // ✅ WHEN UNDONE
  undoReason: 'Need to re-review updated invoice'
}
```

### 2. **Disbursement.actionHistory** (Complete timeline)

```typescript
disbursement.actionHistory = [
  {
    action: 'created',
    performedBy: userId,
    performedByName: 'Agent Smith',
    performedByRole: 'agent',
    performedAt: '2024-01-20T09:00:00Z',  // ✅ Creation
    notes: 'New disbursement for office supplies'
  },
  {
    action: 'dept_head_validated',
    performedBy: userId,
    performedByName: 'John Doe',
    performedByRole: 'department_head',
    performedAt: '2024-01-20T10:30:00Z',  // ✅ Validation
    notes: 'Approved'
  },
  {
    action: 'dept_head_validation_undone',
    performedBy: userId,
    performedByName: 'Jane Smith',
    performedByRole: 'company_super_admin',
    performedAt: '2024-01-20T14:45:00Z',  // ✅ Undo
    reason: 'Need to re-review'
  },
  {
    action: 'dept_head_validated',
    performedBy: userId,
    performedByName: 'John Doe',
    performedByRole: 'department_head',
    performedAt: '2024-01-20T15:30:00Z',  // ✅ Re-validation
    notes: 'Approved after reviewing updated invoice'
  },
  {
    action: 'validator_approved',
    performedBy: userId,
    performedByName: 'Validator Alice',
    performedByRole: 'validator',
    performedAt: '2024-01-20T16:00:00Z',  // ✅ Approval
    notes: 'Approved'
  },
  // ... continues
]
```

### 3. **Status Timeline**

```typescript
disbursement.statusTimeline = {
  draft: '2024-01-20T09:00:00Z',
  pendingDeptHead: '2024-01-20T09:00:00Z',
  pendingValidator: '2024-01-20T10:30:00Z',  // When moved to validator
  pendingCashier: '2024-01-20T16:00:00Z',    // When moved to cashier
  completed: '2024-01-20T17:30:00Z'          // When completed
}
```

---

## ✅ Complete Timestamp Tracking

### What Gets Timestamped:

1. **Creation**: `disbursement.createdAt`
2. **Each workflow step completion**: `step.completedAt`
3. **Each action in history**: `action.performedAt`
4. **Status changes**: `statusTimeline.{status}`
5. **Undos**: `step.undoneAt`, plus action in history
6. **Force completions**: `forceCompletedAt`
7. **Rejections**: `currentRejection.rejectedAt`
8. **Every update**: `disbursement.updatedAt`

### Example Complete Timeline:

```
09:00:00 - Created by Agent Smith
10:30:00 - Validated by Dept Head John Doe
14:45:00 - Validation undone by Super Admin Jane (reason: Need re-review)
15:30:00 - Re-validated by Dept Head John Doe
16:00:00 - Approved by Validator Alice
17:30:00 - Executed by Cashier Bob
```

**Frontend can display:**
- Timeline view (vertical timeline with all actions)
- Step-by-step view (each workflow step with history)
- Audit trail (complete action log)

---

## 🔄 Undo System

### Undo Actions Available:

1. **Undo Dept Head Validation**
2. **Undo Validator Approval**
3. **Undo Cashier Execution**
4. **Undo Rejection**
5. **Undo Force Completion**
6. **Revert to Previous Status** (super admin only)

### Undo Flow:

```typescript
// User clicks "Undo Validation"
POST /api/v1/disbursements/:id/undo-dept-head-validation
{
  "reason": "Need to review updated invoice"
}

// Backend:
1. Check permission (can this user undo this action?)
2. Check time limit (within allowed time window?)
3. Check step progression (can undo after next step?)
4. Create undo action in history
5. Mark step as undone
6. Update status if needed
7. Send notifications
8. Log to audit trail
```

### Undo Result:

```typescript
// Step state AFTER undo:
deptHeadValidation: {
  status: 'undone',
  isCompleted: false,
  completedAt: '2024-01-20T10:30:00Z',  // Original completion time
  wasUndone: true,
  undoneBy: userId,
  undoneAt: '2024-01-20T14:45:00Z',     // ✅ When undone
  undoReason: 'Need to review updated invoice',
  history: [
    { action: 'dept_head_validated', performedAt: '10:30' },
    { action: 'dept_head_validation_undone', performedAt: '14:45' }
  ]
}

// Disbursement status reverts to:
status: 'pending_dept_head'
```

---

## 🔐 Undo Permissions

### Configurable per Company:

```typescript
{
  rules: [
    {
      action: 'dept_head_validation',
      canUndo: true,
      allowedRoles: ['company_super_admin', 'validator', 'department_head'],
      timeLimitHours: 24,              // ⏰ Can only undo within 24h
      canUndoAfterNextStep: false,     // 🚫 Cannot undo if validator approved
      requiresApproval: false,
      notifyOnUndo: ['company_super_admin']
    },
    {
      action: 'validator_approval',
      canUndo: true,
      allowedRoles: ['company_super_admin', 'validator'],
      timeLimitHours: 24,
      canUndoAfterNextStep: false,     // 🚫 Cannot undo if cashier executed
      requiresApproval: false,
      notifyOnUndo: ['company_super_admin']
    },
    {
      action: 'cashier_execution',
      canUndo: true,
      allowedRoles: ['company_super_admin'],  // 👑 Only super admin
      timeLimitHours: 48,
      canUndoAfterNextStep: true,      // ✅ Can undo even after completion
      requiresApproval: true,          // ⚠️ Needs explicit approval
      notifyOnUndo: ['company_super_admin', 'validator']
    }
  ]
}
```

### Permission Checks:

```typescript
canUndoAction(user, disbursement, step):
  // 1. Kaeyros and super admin can ALWAYS undo
  if (user.isKaeyrosUser || user.systemRoles.includes('company_super_admin')):
    return true
  
  // 2. Get undo rules for this company
  rules = getUndoRules(disbursement.company)
  stepRule = rules.find(r => r.action === step)
  
  // 3. Check if user's role is allowed
  if (!stepRule.allowedRoles.includes(user.role)):
    return false
  
  // 4. Check time limit
  if (stepRule.timeLimitHours):
    hoursSinceAction = (now - stepAction.performedAt) / 3600000
    if (hoursSinceAction > stepRule.timeLimitHours):
      return false  // Too late to undo
  
  // 5. Check if next step is completed
  if (!stepRule.canUndoAfterNextStep):
    if (nextStepIsCompleted):
      return false  // Cannot undo, next step already done
  
  return true
```

---

## 📱 Frontend Display

### 1. Timeline View (Recommended)

```jsx
<Timeline>
  {disbursement.actionHistory.map(action => (
    <TimelineItem key={action.performedAt}>
      <Avatar src={action.performedBy.avatar} />
      <div>
        <strong>{action.performedByName}</strong>
        <span className="role">{action.performedByRole}</span>
        <p>{getActionDescription(action)}</p>
        <time>{formatTimestamp(action.performedAt)}</time>
        
        {action.action.includes('undone') && (
          <div className="undo-info">
            <Icon name="undo" />
            <span>Undone: {action.reason}</span>
            <span>Original action: {action.metadata.undoneAction.originalAction}</span>
          </div>
        )}
      </div>
    </TimelineItem>
  ))}
</Timeline>
```

### 2. Workflow Steps View

```jsx
<WorkflowSteps>
  <Step 
    title="Agent Submission"
    status={disbursement.agentSubmission.status}
    completedAt={disbursement.agentSubmission.completedAt}
    completedBy={disbursement.agentSubmission.completedBy}
    wasUndone={disbursement.agentSubmission.wasUndone}
  />
  
  <Step 
    title="Dept Head Validation"
    status={disbursement.deptHeadValidation.status}
    completedAt={disbursement.deptHeadValidation.completedAt}
    completedBy={disbursement.deptHeadValidation.completedBy}
    wasUndone={disbursement.deptHeadValidation.wasUndone}
    undoInfo={disbursement.deptHeadValidation.wasUndone && {
      undoneBy: disbursement.deptHeadValidation.undoneBy,
      undoneAt: disbursement.deptHeadValidation.undoneAt,
      reason: disbursement.deptHeadValidation.undoReason
    }}
    canUndo={canUserUndoThisStep(user, 'deptHeadValidation')}
    onUndo={() => handleUndo('dept_head_validation')}
  />
  
  {/* ... other steps ... */}
</WorkflowSteps>
```

### 3. Undo Button (Conditional)

```jsx
{canUndo && (
  <Button 
    variant="outline" 
    onClick={() => showUndoDialog()}
    disabled={!checkUndoPermissions(user, step)}
  >
    <Icon name="undo" />
    Undo {stepName}
  </Button>
)}

<UndoDialog>
  <h3>Undo {stepName}?</h3>
  <p>This will revert the disbursement to the previous step.</p>
  
  <TextField
    label="Reason (required)"
    value={undoReason}
    onChange={setUndoReason}
    multiline
    required
  />
  
  <Alert severity="warning">
    This action will be logged and all stakeholders will be notified.
  </Alert>
  
  <Button onClick={confirmUndo}>Confirm Undo</Button>
</UndoDialog>
```

---

## 🎯 API Endpoints

### Workflow Actions
```
POST /disbursements/:id/validate          # Dept head validates
POST /disbursements/:id/approve           # Validator approves
POST /disbursements/:id/execute           # Cashier executes
POST /disbursements/:id/force-complete    # Super admin force complete
```

### Undo Actions
```
POST /disbursements/:id/undo-dept-head-validation
POST /disbursements/:id/undo-validator-approval
POST /disbursements/:id/undo-cashier-execution
POST /disbursements/:id/undo-rejection
POST /disbursements/:id/undo-force-completion
POST /disbursements/:id/revert-status     # Revert to any status (super admin)
```

### Timeline
```
GET /disbursements/:id/timeline           # Complete action history
```

---

## 📝 Example Scenario

### Scenario: Disbursement with Multiple Validations and Undos

```
Day 1, 09:00 - Agent creates disbursement
Day 1, 10:30 - Dept Head validates ✅
Day 1, 14:00 - Updated invoice uploaded
Day 1, 14:15 - Super Admin undoes validation 🔄 (reason: new invoice)
Day 1, 15:00 - Dept Head re-validates ✅
Day 1, 16:00 - Validator approves ✅
Day 1, 16:30 - Cashier executes ✅
Day 2, 09:00 - Error discovered in amount
Day 2, 09:15 - Super Admin undoes cashier execution 🔄
Day 2, 09:30 - Amount corrected
Day 2, 10:00 - Cashier re-executes ✅
```

**Complete Audit Trail:**
```json
{
  "actionHistory": [
    {
      "action": "created",
      "performedAt": "2024-01-20T09:00:00Z",
      "performedBy": "Agent Smith"
    },
    {
      "action": "dept_head_validated",
      "performedAt": "2024-01-20T10:30:00Z",
      "performedBy": "John Doe"
    },
    {
      "action": "dept_head_validation_undone",
      "performedAt": "2024-01-20T14:15:00Z",
      "performedBy": "Super Admin Jane",
      "reason": "New invoice uploaded, need re-review"
    },
    {
      "action": "dept_head_validated",
      "performedAt": "2024-01-20T15:00:00Z",
      "performedBy": "John Doe"
    },
    {
      "action": "validator_approved",
      "performedAt": "2024-01-20T16:00:00Z",
      "performedBy": "Validator Alice"
    },
    {
      "action": "cashier_executed",
      "performedAt": "2024-01-20T16:30:00Z",
      "performedBy": "Cashier Bob"
    },
    {
      "action": "cashier_execution_undone",
      "performedAt": "2024-01-21T09:15:00Z",
      "performedBy": "Super Admin Jane",
      "reason": "Amount error discovered, need correction"
    },
    {
      "action": "cashier_executed",
      "performedAt": "2024-01-21T10:00:00Z",
      "performedBy": "Cashier Bob"
    }
  ]
}
```

---

## ✅ Summary

### What You Have Now:

1. ✅ **Complete timestamp tracking** for every action
2. ✅ **Never overwrite history** - always append
3. ✅ **Full undo capability** with audit trail
4. ✅ **Configurable undo permissions** per company
5. ✅ **Time limits** for undos
6. ✅ **Step progression rules** (can/cannot undo after next step)
7. ✅ **Undo tracking** (who undid what, when, why)
8. ✅ **Multiple actions on same step** (validate → undo → re-validate)
9. ✅ **Complete audit trail** in `actionHistory` array
10. ✅ **Timeline API** for frontend display

### Key Design Principles:

- **Immutable history**: Never delete or overwrite actions
- **Full transparency**: Every action logged with timestamp
- **Flexible undo**: Configurable rules per company
- **Permission-based**: Control who can undo what
- **Audit compliance**: Complete trail of all changes

**This is enterprise-grade audit logging! 🚀**