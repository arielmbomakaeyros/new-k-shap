# Disbursement Module & Workflow Documentation

## Overview

The Disbursement Module is the core financial management feature of K-shap. It manages the complete lifecycle of payment requests through a multi-stage approval workflow.

## Workflow Stages

### 1. Draft Stage
- User creates initial disbursement request
- Request is saved as draft (not submitted yet)
- Can be edited or deleted before submission
- Validation occurs on submission

### 2. Department Head Approval
- Request moves to department head for review
- Department head can:
  - **Approve**: Request moves to validator
  - **Request Changes**: Request returns to creator with feedback
  - **Reject**: Request is rejected with explanation
- Status: `pending_department_head`

### 3. Validator Approval
- Validator (Finance) verifies:
  - Budget availability
  - Compliance with policies
  - Documentation completeness
- Can:
  - **Approve**: Request moves to cashier
  - **Request Changes**: Return to creator
  - **Reject**: Reject with explanation
- Status: `pending_validator`

### 4. Cashier Disbursement
- Cashier/Finance Officer processes payment
- Verifies:
  - Bank details
  - Payment method
  - Final authorization
- Can:
  - **Approve**: Payment processed (status: `disbursed`)
  - **Request Changes**: Return to creator
  - **Reject**: Reject with explanation
- Status: `pending_cashier`

## Request Statuses

| Status | Stage | Description |
|--------|-------|-------------|
| `draft` | Draft | Initial creation, not submitted |
| `pending_department_head` | Approval 1 | Awaiting department head review |
| `pending_validator` | Approval 2 | Awaiting financial validator |
| `pending_cashier` | Approval 3 | Awaiting payment processing |
| `approved` | Post-Approval | All approvals complete, awaiting disbursement |
| `disbursed` | Completed | Payment has been processed |
| `rejected` | Terminal | Request has been rejected |
| `changes_requested` | Revision | Awaiting changes from creator |

## Request Fields

### Basic Information
- `title`: Brief description of disbursement
- `description`: Detailed explanation
- `amount`: Currency amount
- `currency`: Currency code (USD, EUR, GBP, etc.)

### Payee Information
- `payeeType`: internal_staff, vendor, contractor, other
- `payeeName`: Name or company name
- `payeeEmail`: Email address
- `payeePhone`: Contact phone number

### Organizational
- `departmentId`: Department initiating request
- `officeId`: Office location
- `budgetCode`: Optional budget allocation

### Documentation
- `justification`: Detailed reason for disbursement
- `documents`: Attached supporting documents (invoices, quotes, etc.)

## Components

### CreateDisbursementForm
Main form for creating new disbursement requests with validation.

**Props:**
- `onSuccess?: () => void` - Callback when request is created

**Features:**
- Form validation with Zod
- Multi-field input with currency selection
- Department and office dropdown selection
- File upload support (planned)
- Real-time validation feedback

### ApprovalDialog
Modal dialog for approvers to review and approve/reject requests.

**Props:**
- `disbursementId: string` - Request ID
- `stage: 'department_head' | 'validator' | 'cashier'` - Current approval stage
- `onClose: () => void` - Close handler
- `onSuccess?: () => void` - Success callback

**Features:**
- Action selection (approve/reject/request changes)
- Notes/feedback input
- Conditional fields based on action
- Submission handling

### StatusBadge
Visual indicator for request status.

**Props:**
- `status: DisbursementStatus` - Current status

**Displays:**
- Color-coded status with label
- Semantic color mapping (green for approved, red for rejected, etc.)

### WorkflowTimeline
Visual representation of approval workflow progress.

**Props:**
- `disbursement: Disbursement` - Full disbursement object

**Features:**
- Stage visualization with progress indicator
- Approval history display
- Approver information
- Action history with timestamps

## Pages

### /disbursements
Main disbursement list with filtering and search.

**Features:**
- Search by title or payee
- Filter by status
- Sortable columns
- Quick view links
- Pagination support

### /disbursements/new
Create new disbursement request form.

**Features:**
- Full form with validation
- Back navigation
- Success redirect

### /disbursements/[id]
Detailed view of single disbursement.

**Features:**
- Full request details
- Approval workflow timeline
- Action buttons for approvers
- Attachment display
- PDF export

### /disbursements/approvals
Pending approvals queue for current user.

**Features:**
- Filtered list of requests awaiting user's action
- Summary statistics
- Quick access to review/approve
- Priority indication

## API Endpoints (Backend Required)

### Create Disbursement
```http
POST /api/disbursements
Content-Type: application/json

{
  "title": "Office Supplies",
  "description": "Monthly supplies",
  "amount": 500,
  "currency": "USD",
  "payeeType": "vendor",
  "payeeName": "ABC Supplies",
  "payeeEmail": "contact@abcsupplies.com",
  "departmentId": "dept-123",
  "officeId": "office-456",
  "justification": "Regular supplies for operations"
}
```

### Get Disbursements
```http
GET /api/disbursements?status=pending_department_head&limit=10&offset=0
```

### Get Single Disbursement
```http
GET /api/disbursements/dis-123
```

### Approve/Review Disbursement
```http
POST /api/disbursements/dis-123/approve
Content-Type: application/json

{
  "action": "approve|reject|request_changes",
  "stage": "department_head|validator|cashier",
  "notes": "Optional feedback"
}
```

### Get User's Pending Approvals
```http
GET /api/disbursements/approvals/pending
```

## Database Schema

### Disbursements Table
```sql
CREATE TABLE disbursements (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  creator_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  payee_type VARCHAR(50) NOT NULL,
  payee_name VARCHAR(255) NOT NULL,
  payee_email VARCHAR(255),
  payee_phone VARCHAR(20),
  
  department_id UUID REFERENCES departments(id),
  office_id UUID REFERENCES offices(id),
  budget_code VARCHAR(50),
  justification TEXT NOT NULL,
  
  status VARCHAR(50) DEFAULT 'draft',
  current_stage VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### Approvals Table
```sql
CREATE TABLE approvals (
  id UUID PRIMARY KEY,
  disbursement_id UUID NOT NULL REFERENCES disbursements(id),
  approver_id UUID NOT NULL REFERENCES users(id),
  stage VARCHAR(50) NOT NULL,
  action VARCHAR(50), -- approve, reject, request_changes
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Permissions & Access Control

### Creator
- View own requests
- Edit while in draft
- View approval history
- Make changes if requested

### Department Head
- View company requests
- Approve/reject requests assigned to them
- Request changes

### Validator (Finance)
- View all company requests
- Approve/reject at validator stage
- Access to budget and compliance information

### Cashier
- View approved requests
- Process payments
- Track disbursed requests

### Super Admin
- View all company requests
- Manual approval override capability

## Workflow Customization

Companies can customize workflow in Settings:

**Configuration Options:**
- Enable/disable stages
- Approval limits (amount thresholds)
- Required approvers per department
- Budget enforcement

**Example Configuration:**
```json
{
  "requireDeptHeadApproval": true,
  "requireValidatorApproval": true,
  "requireCashierApproval": true,
  "amountThresholds": {
    "0": ["department_head"],
    "1000": ["department_head", "validator"],
    "5000": ["department_head", "validator", "cashier"]
  }
}
```

## Notifications

### Email Notifications Sent
- Request submitted → Department head
- Request approved → Creator
- Request rejected → Creator
- Changes requested → Creator
- Ready for disbursement → Cashier

### In-App Notifications
- All email notifications also appear in-app
- Real-time updates via WebSocket (planned)

## Audit & Compliance

All disbursement actions are logged:
- Request creation
- All approvals/rejections
- Status changes
- Document uploads
- User accessing requests

## Best Practices

1. **Clear Justification**: Always provide detailed justification
2. **Attach Documentation**: Include supporting documents (invoices, quotes)
3. **Verify Payee Details**: Double-check payee information before submission
4. **Track Status**: Monitor approval progress regularly
5. **Set Reminders**: Request changes should be addressed promptly

## Troubleshooting

### Request Stuck in Approval
- Check if approver has received notification
- Escalate to manager if urgent
- Use comments to send reminders

### Incorrect Payee Information
- If in draft: Edit and resubmit
- If already submitted: Request changes, then update

### Payment Not Processed
- Check cashier stage status
- Verify payment method and bank details
- Contact finance team if issues persist
