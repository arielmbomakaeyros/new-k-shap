# K-shap Backend Project Structure (NestJS)

k-shap-backend/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── config/                          # Configuration
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── email.config.ts
│   │   ├── jwt.config.ts
│   │   ├── app.config.ts
│   │   └── index.ts
│   │
│   ├── common/                          # Shared utilities
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-company.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── public.decorator.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   ├── kaeyros.guard.ts        # Only Kaeyros users
│   │   │   └── company-access.guard.ts # Multi-tenant isolation
│   │   │
│   │   ├── filters/
│   │   │   ├── all-exceptions.filter.ts
│   │   │   ├── http-exception.filter.ts
│   │   │   └── mongoose-exception.filter.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts # Standardize responses
│   │   │   ├── cache.interceptor.ts
│   │   │   └── audit-log.interceptor.ts # Auto-log actions
│   │   │
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   └── parse-objectid.pipe.ts
│   │   │
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   ├── response.dto.ts
│   │   │   └── filter.dto.ts
│   │   │
│   │   ├── interfaces/
│   │   │   ├── pagination.interface.ts
│   │   │   ├── api-response.interface.ts
│   │   │   └── request-with-user.interface.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── error-messages.ts
│   │   │   ├── success-messages.ts
│   │   │   └── permissions.constants.ts
│   │   │
│   │   └── utils/
│   │       ├── hash.util.ts
│   │       ├── token.util.ts
│   │       ├── date.util.ts
│   │       ├── file-upload.util.ts
│   │       └── slug.util.ts
│   │
│   ├── modules/                         # Feature modules
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── refresh-token.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       ├── reset-password.dto.ts
│   │   │       ├── change-password.dto.ts
│   │   │       └── activate-account.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       ├── update-user.dto.ts
│   │   │       ├── filter-user.dto.ts
│   │   │       └── user-response.dto.ts
│   │   │
│   │   ├── companies/                   # Multi-tenant company management
│   │   │   ├── companies.module.ts
│   │   │   ├── companies.controller.ts
│   │   │   ├── companies.service.ts
│   │   │   ├── companies.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-company.dto.ts
│   │   │       ├── update-company.dto.ts
│   │   │       ├── toggle-feature.dto.ts
│   │   │       └── company-stats.dto.ts
│   │   │
│   │   ├── roles/
│   │   │   ├── roles.module.ts
│   │   │   ├── roles.controller.ts
│   │   │   ├── roles.service.ts
│   │   │   ├── roles.repository.ts
│   │   │   └── dto/
│   │   │
│   │   ├── permissions/
│   │   │   ├── permissions.module.ts
│   │   │   ├── permissions.controller.ts
│   │   │   ├── permissions.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── departments/
│   │   │   ├── departments.module.ts
│   │   │   ├── departments.controller.ts
│   │   │   ├── departments.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── offices/
│   │   │   ├── offices.module.ts
│   │   │   ├── offices.controller.ts
│   │   │   ├── offices.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── disbursements/               # Core feature
│   │   │   ├── disbursements.module.ts
│   │   │   ├── disbursements.controller.ts
│   │   │   ├── disbursements.service.ts
│   │   │   ├── disbursements.repository.ts
│   │   │   ├── workflow/
│   │   │   │   ├── validation.service.ts      # Dept head validation
│   │   │   │   ├── approval.service.ts        # Validator approval
│   │   │   │   ├── execution.service.ts       # Cashier execution
│   │   │   │   └── force-complete.service.ts  # Super admin bypass
│   │   │   └── dto/
│   │   │       ├── create-disbursement.dto.ts
│   │   │       ├── update-disbursement.dto.ts
│   │   │       ├── validate-disbursement.dto.ts
│   │   │       ├── approve-disbursement.dto.ts
│   │   │       ├── execute-disbursement.dto.ts
│   │   │       ├── force-complete.dto.ts
│   │   │       ├── filter-disbursement.dto.ts
│   │   │       └── export-disbursement.dto.ts
│   │   │
│   │   ├── collections/                 # Cash inflow
│   │   │   ├── collections.module.ts
│   │   │   ├── collections.controller.ts
│   │   │   ├── collections.service.ts
│   │   │   ├── collections.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-collection.dto.ts
│   │   │       ├── update-collection.dto.ts
│   │   │       ├── filter-collection.dto.ts
│   │   │       └── export-collection.dto.ts
│   │   │
│   │   ├── disbursement-types/
│   │   │   ├── disbursement-types.module.ts
│   │   │   ├── disbursement-types.controller.ts
│   │   │   ├── disbursement-types.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── beneficiaries/
│   │   │   ├── beneficiaries.module.ts
│   │   │   ├── beneficiaries.controller.ts
│   │   │   ├── beneficiaries.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.gateway.ts  # Socket.IO
│   │   │   └── dto/
│   │   │
│   │   ├── chat/
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── chat.gateway.ts          # Socket.IO
│   │   │   └── dto/
│   │   │       ├── send-message.dto.ts
│   │   │       ├── create-chat.dto.ts
│   │   │       └── filter-messages.dto.ts
│   │   │
│   │   ├── audit-logs/
│   │   │   ├── audit-logs.module.ts
│   │   │   ├── audit-logs.controller.ts
│   │   │   ├── audit-logs.service.ts
│   │   │   └── dto/
│   │   │       └── filter-audit-logs.dto.ts
│   │   │
│   │   ├── settings/
│   │   │   ├── settings.module.ts
│   │   │   ├── email-settings/
│   │   │   │   ├── email-settings.controller.ts
│   │   │   │   ├── email-settings.service.ts
│   │   │   │   └── dto/
│   │   │   └── reminder-settings/
│   │   │       ├── reminder-settings.controller.ts
│   │   │       ├── reminder-settings.service.ts
│   │   │       └── dto/
│   │   │
│   │   ├── exports/                     # Data export module
│   │   │   ├── exports.module.ts
│   │   │   ├── exports.controller.ts
│   │   │   ├── exports.service.ts
│   │   │   └── dto/
│   │   │       └── export-request.dto.ts
│   │   │
│   │   ├── reports/                     # Reporting & analytics
│   │   │   ├── reports.module.ts
│   │   │   ├── reports.controller.ts
│   │   │   ├── reports.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── kaeyros/                     # Platform owner dashboard
│   │   │   ├── kaeyros.module.ts
│   │   │   ├── kaeyros.controller.ts
│   │   │   ├── kaeyros.service.ts
│   │   │   └── dto/
│   │   │
│   │   └── file-upload/
│   │       ├── file-upload.module.ts
│   │       ├── file-upload.controller.ts
│   │       └── file-upload.service.ts
│   │
│   ├── database/                        # Database schemas
│   │   ├── schemas/
│   │   │   ├── user.schema.ts
│   │   │   ├── company.schema.ts
│   │   │   ├── role.schema.ts
│   │   │   ├── permission.schema.ts
│   │   │   ├── department.schema.ts
│   │   │   ├── office.schema.ts
│   │   │   ├── disbursement.schema.ts
│   │   │   ├── collection.schema.ts
│   │   │   ├── disbursement-type.schema.ts
│   │   │   ├── beneficiary.schema.ts
│   │   │   ├── audit-log.schema.ts
│   │   │   ├── notification.schema.ts
│   │   │   ├── chat-message.schema.ts
│   │   │   ├── deleted-data-registry.schema.ts
│   │   │   ├── error-log.schema.ts
│   │   │   ├── email-settings.schema.ts
│   │   │   └── reminder-settings.schema.ts
│   │   │
│   │   └── database.module.ts
│   │
│   ├── jobs/                            # Cron jobs
│   │   ├── jobs.module.ts
│   │   ├── reminder.job.ts             # Email reminders
│   │   ├── cleanup.job.ts              # Delete old data after 30 days
│   │   ├── subscription.job.ts         # Check subscription status
│   │   └── activity-summary.job.ts     # Compute daily stats
│   │
│   ├── email/                           # Email service
│   │   ├── email.module.ts
│   │   ├── email.service.ts
│   │   └── templates/
│   │       ├── welcome.hbs
│   │       ├── activation.hbs
│   │       ├── password-reset.hbs
│   │       ├── disbursement-created.hbs
│   │       ├── disbursement-validated.hbs
│   │       ├── disbursement-rejected.hbs
│   │       └── critical-error.hbs       # To Kaeyros
│   │
│   ├── logger/                          # Centralized logging
│   │   ├── logger.module.ts
│   │   ├── logger.service.ts
│   │   └── transports/
│   │       ├── file.transport.ts
│   │       ├── email.transport.ts       # Email on critical errors
│   │       └── console.transport.ts
│   │
│   └── cache/                           # Redis caching
│       ├── cache.module.ts
│       └── cache.service.ts
│
├── logs/                                # Log files
│   ├── error.log
│   ├── combined.log
│   └── access.log
│
├── uploads/                             # Uploaded files
│   ├── invoices/
│   ├── receipts/
│   └── documents/
│
├── test/                                # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env                                 # Environment variables
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.mds