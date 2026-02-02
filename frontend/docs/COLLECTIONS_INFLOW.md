# Collections & Cash Inflow Module Documentation

## Overview

The Collections Module tracks all incoming payments and cash inflows. It provides comprehensive recording, tracking, reconciliation, and analytics capabilities for managing cash flow.

## Collection Status Lifecycle

| Status | Description |
|--------|-------------|
| `pending` | Newly created, awaiting receipt confirmation |
| `received` | Payment confirmed as received |
| `deposited` | Funds deposited to bank account |
| `reconciled` | Matched with bank statement |
| `disputed` | Payment is under dispute |
| `cancelled` | Collection cancelled |

## Collection Types

### By Payer
- **Customer** - Regular customer payments
- **Client** - Service client payments
- **Partner** - Partner organization payments
- **Other** - Other payment sources

### By Payment Method
- Bank Transfer (ACH, Wire)
- Check
- Cash
- Credit Card
- Other

## Request Fields

### Basic Information
- `referenceNumber`: Unique collection reference (e.g., COL-2024-001)
- `invoiceNumber`: Related invoice number (optional)
- `description`: Payment description
- `amount`: Currency amount
- `currency`: Currency code (USD, EUR, GBP)

### Payer Information
- `payer`: Payer name or company
- `payerType`: Type of payer (customer, client, partner, other)
- `payerEmail`: Contact email
- `payerPhone`: Contact phone

### Organizational
- `departmentId`: Department receiving payment
- `officeId`: Office location
- `bankAccountId`: Bank account receiving funds (optional)

### Additional
- `notes`: Additional notes or transaction details

## Components

### CreateCollectionForm
Form for recording new incoming payments.

**Props:**
- `onSuccess?: () => void` - Callback when collection is recorded

**Features:**
- Form validation with Zod
- Payment method selection
- Multi-currency support
- Department and office allocation
- Note-taking capabilities

### CollectionStatusBadge
Visual status indicator for collections.

**Props:**
- `status: CollectionStatus` - Current status

**Features:**
- Color-coded status display
- Semantic status indicators

## Pages

### /collections
Main collections list with filtering and statistics.

**Features:**
- Search by reference or payer
- Filter by status and period
- Summary statistics (total collected, this month, average)
- Quick view links
- Sortable columns
- Pagination support

**Statistics Displayed:**
- Total Collected (All time)
- This Month Total
- Average Transaction Amount
- Total Transactions

### /collections/new
Record new incoming payment form.

**Features:**
- Complete collection form
- Form validation
- Success redirect
- Back navigation

### /collections/[id]
Detailed view of single collection.

**Features:**
- Full collection details
- Payer information display
- Payment details
- Processing timeline visualization
- Bank account information
- Metadata (created by, timestamps)

### /collections/reconciliation
Bank reconciliation tool.

**Features:**
- Bank statement matching
- System vs. bank comparison
- Variance identification
- Reconciled items list
- Balance verification
- Period selection

**Reconciliation Workflow:**
1. Select period (month, quarter, year)
2. Input bank statement data
3. System automatically matches collections
4. Identify discrepancies
5. Mark as reconciled

### /collections/analytics
Analytics and insights dashboard.

**Features:**
- Key metrics (total collected, monthly average, etc.)
- Transaction statistics
- Monthly trend visualization
- Payment method breakdown
- Department distribution
- Top payers list
- Period-based analysis

## API Endpoints (Backend Required)

### Record Collection
```http
POST /api/collections
Content-Type: application/json

{
  "referenceNumber": "COL-2024-001",
  "payer": "Tech Corp Inc",
  "payerType": "customer",
  "payerEmail": "finance@techcorp.com",
  "amount": 5000,
  "currency": "USD",
  "paymentMethod": "bank_transfer",
  "invoiceNumber": "INV-2024-045",
  "description": "Service fees Q1 2024",
  "departmentId": "dept-123",
  "officeId": "office-456",
  "notes": "Wire transfer received"
}
```

### Get Collections
```http
GET /api/collections?status=received&limit=10&offset=0
```

### Get Single Collection
```http
GET /api/collections/col-123
```

### Update Collection Status
```http
PATCH /api/collections/col-123/status
Content-Type: application/json

{
  "status": "deposited",
  "bankAccountId": "acc-456",
  "bankTransactionId": "txn-789"
}
```

### Reconcile Collection
```http
POST /api/collections/col-123/reconcile
Content-Type: application/json

{
  "bankStatementId": "stmt-123",
  "bankTransactionId": "txn-456"
}
```

### Get Analytics
```http
GET /api/collections/analytics?period=month&month=01&year=2024
```

### Get Reconciliation Data
```http
GET /api/collections/reconciliation?month=01&year=2024
```

## Database Schema

### Collections Table
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  reference_number VARCHAR(50) NOT NULL UNIQUE,
  
  payer_name VARCHAR(255) NOT NULL,
  payer_type VARCHAR(50) NOT NULL,
  payer_email VARCHAR(255),
  payer_phone VARCHAR(20),
  
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  payment_method VARCHAR(50) NOT NULL,
  invoice_number VARCHAR(50),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  
  department_id UUID REFERENCES departments(id),
  office_id UUID REFERENCES offices(id),
  bank_account_id UUID REFERENCES bank_accounts(id),
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  received_at TIMESTAMP,
  deposited_at TIMESTAMP,
  reconciled_at TIMESTAMP,
  created_by UUID REFERENCES users(id)
);
```

### Bank Reconciliation Table
```sql
CREATE TABLE bank_reconciliations (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  bank_opening_balance DECIMAL(12, 2),
  bank_closing_balance DECIMAL(12, 2),
  
  system_opening_balance DECIMAL(12, 2),
  system_closing_balance DECIMAL(12, 2),
  
  variance DECIMAL(12, 2),
  status VARCHAR(50), -- pending, completed, exception
  
  reconciled_by UUID REFERENCES users(id),
  reconciled_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Reconciliation Process

### Monthly Reconciliation Steps

1. **Prepare Bank Statement**
   - Obtain bank statement for period
   - Record opening and closing balances
   - List all transactions

2. **Input System Data**
   - System automatically calculates totals
   - Collections recorded during period
   - Deposits and withdrawals

3. **Match Transactions**
   - Auto-match collections to bank deposits
   - Identify unmatched items

4. **Investigate Differences**
   - Bank fees
   - Timing differences
   - Missing deposits

5. **Reconcile**
   - Mark matched items
   - Resolve discrepancies
   - Finalize reconciliation

6. **Review & Approve**
   - Finance manager reviews
   - Approves if balanced
   - Documents exceptions

## Permissions & Access Control

### Sales/Operations
- Record collections
- View assigned collections
- View own department analytics

### Finance/Validator
- View all collections
- Update status
- Perform reconciliation
- Access reconciliation details

### Cashier
- Confirm receipt
- Process deposits
- Mark as deposited

### Super Admin
- Full access to all collections
- Override statuses
- Archive old records

## Key Features

### Auto-Recording
- Quick entry form
- Pre-filled templates
- Auto-calculation of amounts
- Duplicate prevention

### Status Tracking
- Visual status timeline
- Timestamp recording
- Audit trail
- Status change notifications

### Reconciliation
- Bank statement matching
- Variance identification
- Automated matching
- Manual adjustment support

### Analytics
- Collection trends
- Payer performance
- Payment method analysis
- Department distribution
- Forecasting (planned)

### Reporting
- Collection reports
- Reconciliation reports
- Trend analysis
- Departmental breakdowns

## Best Practices

1. **Timely Recording**: Record collections promptly
2. **Complete Information**: Fill all required fields
3. **Regular Deposits**: Deposit received funds promptly
4. **Monthly Reconciliation**: Complete monthly reconciliation
5. **Documentation**: Attach supporting documents
6. **Follow-up**: Address disputed items promptly

## Common Issues & Solutions

### Unmatched Deposits
- Check timing (bank lag)
- Verify reference number
- Check for duplicates
- Contact payer if needed

### Missing Collections
- Confirm payment received
- Check bank account
- Verify deposit timing
- Review bank statement

### Reconciliation Variance
- Document outstanding items
- Contact bank if discrepancy
- Investigate timing differences
- Adjust as necessary

## Integration with Other Modules

### Disbursement Module
- Track disbursements vs. collections
- Cash flow analysis
- Budget impact

### Company Management
- Department-level analytics
- Office-level tracking
- Payer management

### Reporting
- Financial statements
- Cash flow statements
- Aging reports
