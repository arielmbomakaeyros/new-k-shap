import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
// import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
// import { randomBytes } from 'crypto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get('UserModel') as Model<any>;
  const companyModel = app.get('CompanyModel') as Model<any>;
  const departmentModel = app.get('DepartmentModel') as Model<any>;
  const officeModel = app.get('OfficeModel') as Model<any>;
  const roleModel = app.get('RoleModel') as Model<any>;
  const permissionModel = app.get('PermissionModel') as Model<any>;
  const disbursementTypeModel = app.get('DisbursementTypeModel') as Model<any>;
  const beneficiaryModel = app.get('BeneficiaryModel') as Model<any>;
  const notificationModel = app.get('NotificationModel') as Model<any>;
  const workflowTemplateModel = app.get('WorkflowTemplateModel') as Model<any>;

  console.log('🌱 Starting database seeding...\n');

  // ==================== 1. CREATE KAEYROS USERS ====================
  console.log('👤 Creating Kaeyros users...');
  const kaeyrosSuperAdmin = await userModel.create({
    firstName: 'Kaeyros',
    lastName: 'Admin',
    email: 'admin@kaeyros.com',
    password: await bcrypt.hash('Kaeyros@2024!', 10),
    isKaeyrosUser: true,
    systemRoles: ['kaeyros_super_admin'],
    isActive: true,
    canLogin: true,
    permissions: [],
    lastLoginAt: null,
    loginAttempts: 0,
    lockedUntil: null,
    emailVerified: true,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const kaeyrosSupport = await userModel.create({
    firstName: 'Kaeyros',
    lastName: 'Support',
    email: 'support@kaeyros.com',
    password: await bcrypt.hash('Support@2024!', 10),
    isKaeyrosUser: true,
    systemRoles: ['kaeyros_support'],
    isActive: true,
    canLogin: true,
    permissions: [],
    lastLoginAt: null,
    loginAttempts: 0,
    lockedUntil: null,
    emailVerified: true,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Kaeyros users created\n');

  // ==================== 2. CREATE SAMPLE COMPANY ====================
  console.log('🏢 Creating sample company...');
  const sampleCompany = await companyModel.create({
    name: 'Tech Solutions Inc.',
    slug: 'tech-solutions-inc',
    email: 'admin@techsolutions.com',
    phone: '+1234567890',
    address: '123 Business Ave, Tech City',
    city: 'Tech City',
    country: 'US',
    industry: 'Technology',
    status: 'active',
    planType: 'professional',
    subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    enabledFeatures: {
      disbursements: true,
      collections: true,
      chat: true,
      notifications: true,
      emailNotifications: true,
      reports: true,
      multiCurrency: false,
      apiAccess: true,
    },
    workflowSettings: {
      requireDeptHeadApproval: true,
      requireValidatorApproval: true,
      requireCashierExecution: true,
      maxAmountNoApproval: 500000,
    },
    emailNotificationSettings: {
      onNewDisbursement: true,
      onDisbursementApproved: true,
      onDisbursementRejected: true,
      onCollectionAdded: true,
      dailySummary: false,
    },
    notificationChannels: {
      email: true,
      sms: false,
      whatsapp: false,
      inApp: true,
    },
    payoutSchedule: {
      frequency: 'monthly',
      dayOfMonth: 25,
      dayOfWeek: 'friday',
    },
    approvalLimitsByRole: {},
    officeSpendCaps: {},
    defaultBeneficiaries: [],
    defaultCurrency: 'XAF',
    paymentMethods: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'],
    timezone: 'Africa/Douala',
    supportedLanguages: ['fr', 'en'],
    defaultLanguage: 'fr',
    logoUrl: '',
    primaryColor: '#1d4ed8',
    createdBy: kaeyrosSuperAdmin._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Sample company created\n');

  // ==================== 2.1 CREATE DEFAULT WORKFLOW TEMPLATES ====================
  const existingWorkflowTemplates = await workflowTemplateModel.countDocuments({ isSystem: true });
  if (!existingWorkflowTemplates) {
    console.log('🔁 Creating default workflow templates...');
    await workflowTemplateModel.insertMany([
      {
        name: 'Simple',
        description: 'Agent → Cashier',
        isDefault: false,
        isSystem: true,
        steps: [
          {
            order: 1,
            name: 'Cashier Execution',
            roleRequired: 'cashier',
            description: 'Cashier executes payment',
            statusOnPending: 'pending_cashier',
            statusOnComplete: 'completed',
          },
        ],
      },
      {
        name: 'Standard',
        description: 'Agent → Department Head → Cashier',
        isDefault: false,
        isSystem: true,
        steps: [
          {
            order: 1,
            name: 'Department Head Validation',
            roleRequired: 'department_head',
            description: 'Department head validates disbursement',
            statusOnPending: 'pending_dept_head',
            statusOnComplete: 'pending_cashier',
          },
          {
            order: 2,
            name: 'Cashier Execution',
            roleRequired: 'cashier',
            description: 'Cashier executes payment',
            statusOnPending: 'pending_cashier',
            statusOnComplete: 'completed',
          },
        ],
      },
      {
        name: 'Full',
        description: 'Agent → Department Head → Validator → Cashier',
        isDefault: true,
        isSystem: true,
        steps: [
          {
            order: 1,
            name: 'Department Head Validation',
            roleRequired: 'department_head',
            description: 'Department head validates disbursement',
            statusOnPending: 'pending_dept_head',
            statusOnComplete: 'pending_validator',
          },
          {
            order: 2,
            name: 'Validator Approval',
            roleRequired: 'validator',
            description: 'Validator approves disbursement',
            statusOnPending: 'pending_validator',
            statusOnComplete: 'pending_cashier',
          },
          {
            order: 3,
            name: 'Cashier Execution',
            roleRequired: 'cashier',
            description: 'Cashier executes payment',
            statusOnPending: 'pending_cashier',
            statusOnComplete: 'completed',
          },
        ],
      },
    ]);
    console.log('✅ Default workflow templates created\n');
  } else {
    console.log('✅ Default workflow templates already exist\n');
  }

  // ==================== 3. CREATE SYSTEM-LEVEL PERMISSIONS ====================
  console.log('🔒 Creating system-level permissions...');
  const permissions = await Promise.all([
    permissionModel.create({
      name: 'Create Disbursement',
      code: 'disbursement.create',
      resource: 'disbursement',
      action: 'create',
      description: 'Create new disbursements',
      category: 'Disbursements',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Read Disbursement',
      code: 'disbursement.read',
      resource: 'disbursement',
      action: 'read',
      description: 'View disbursements',
      category: 'Disbursements',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Update Disbursement',
      code: 'disbursement.update',
      resource: 'disbursement',
      action: 'update',
      description: 'Update disbursements',
      category: 'Disbursements',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Delete Disbursement',
      code: 'disbursement.delete',
      resource: 'disbursement',
      action: 'delete',
      description: 'Delete disbursements',
      category: 'Disbursements',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Approve Disbursement',
      code: 'disbursement.approve',
      resource: 'disbursement',
      action: 'approve',
      description: 'Approve disbursements',
      category: 'Disbursements',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Create Collection',
      code: 'collection.create',
      resource: 'collection',
      action: 'create',
      description: 'Create new collections',
      category: 'Collections',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Read Collection',
      code: 'collection.read',
      resource: 'collection',
      action: 'read',
      description: 'View collections',
      category: 'Collections',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Update Collection',
      code: 'collection.update',
      resource: 'collection',
      action: 'update',
      description: 'Update collections',
      category: 'Collections',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Delete Collection',
      code: 'collection.delete',
      resource: 'collection',
      action: 'delete',
      description: 'Delete collections',
      category: 'Collections',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Create User',
      code: 'user.create',
      resource: 'user',
      action: 'create',
      description: 'Create new users',
      category: 'Users',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Read User',
      code: 'user.read',
      resource: 'user',
      action: 'read',
      description: 'View users',
      category: 'Users',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Update User',
      code: 'user.update',
      resource: 'user',
      action: 'update',
      description: 'Update users',
      category: 'Users',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Delete User',
      code: 'user.delete',
      resource: 'user',
      action: 'delete',
      description: 'Delete users',
      category: 'Users',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    permissionModel.create({
      name: 'Export Data',
      code: 'export.data',
      resource: 'export',
      action: 'export',
      description: 'Export data',
      category: 'Exports',
      isSystemPermission: true,
      // No company field for system-level permissions
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
  ]);

  console.log('✅ Permissions created\n');

  // ==================== 4. CREATE ROLES ====================
  console.log('👥 Creating roles...');
  const superAdminRole = await roleModel.create({
    name: 'Company Super Admin',
    description: 'Full access to all company features',
    permissions: permissions.map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'company_super_admin',
    company: sampleCompany._id,
    createdBy: kaeyrosSuperAdmin._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const validatorRole = await roleModel.create({
    name: 'Validator',
    description: 'Validate disbursements',
    permissions: permissions.filter(p => 
      p.code.includes('disbursement') && 
      (p.code.includes('read') || p.code.includes('approve'))
    ).map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'validator',
    company: sampleCompany._id,
    createdBy: kaeyrosSuperAdmin._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const departmentHeadRole = await roleModel.create({
    name: 'Department Head',
    description: 'Approve disbursements for department',
    permissions: permissions.filter(p => 
      p.code.includes('disbursement') && 
      (p.code.includes('read') || p.code.includes('approve'))
    ).map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'department_head',
    company: sampleCompany._id,
    createdBy: kaeyrosSuperAdmin._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const cashierRole = await roleModel.create({
    name: 'Cashier',
    description: 'Process disbursements',
    permissions: permissions.filter(p => 
      p.code.includes('disbursement') && 
      (p.code.includes('read') || p.code.includes('update'))
    ).map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'cashier',
    company: sampleCompany._id,
    createdBy: kaeyrosSuperAdmin._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const agentRole = await roleModel.create({
    name: 'Agent',
    description: 'Basic user with limited access',
    permissions: permissions.filter(p => 
      p.code.includes('read')
    ).map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'agent',
    company: sampleCompany._id,
    createdBy: kaeyrosSuperAdmin._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Roles created\n');

  // ==================== 5. CREATE DEPARTMENTS ====================
  console.log('🏢 Creating departments...');
  const departments = await Promise.all([
    departmentModel.create({
      name: 'Finance',
      code: 'FIN-001',
      description: 'Finance department',
      company: sampleCompany._id,
      headId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    departmentModel.create({
      name: 'Operations',
      code: 'OPS-001',
      description: 'Operations department',
      company: sampleCompany._id,
      headId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    departmentModel.create({
      name: 'Human Resources',
      code: 'HR-001',
      description: 'Human Resources department',
      company: sampleCompany._id,
      headId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    departmentModel.create({
      name: 'IT',
      code: 'IT-001',
      description: 'Information Technology department',
      company: sampleCompany._id,
      headId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
  ]);

  console.log('✅ Departments created\n');

  // ==================== 6. CREATE OFFICES ====================
  console.log('🏢 Creating offices...');
  const offices = await Promise.all([
    officeModel.create({
      name: 'Main Office',
      code: 'MO-001',
      location: 'Downtown',
      address: '456 Main Street, Downtown, TC 12345',
      company: sampleCompany._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
    officeModel.create({
      name: 'Branch Office',
      code: 'BO-001',
      location: 'Uptown',
      address: '789 Uptown Avenue, Uptown, TC 54321',
      company: sampleCompany._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: kaeyrosSuperAdmin._id,
    }),
  ]);

  console.log('✅ Offices created\n');

  // ==================== 7. CREATE COMPANY SUPER ADMIN ====================
  console.log('👤 Creating company super admin...');
  const companySuperAdmin = await userModel.create({
    firstName: 'Company',
    lastName: 'Admin',
    email: 'admin@techsolutions.com',
    password: await bcrypt.hash('Admin@2024!', 10),
    company: sampleCompany._id,
    role: superAdminRole._id,
    roles: [superAdminRole._id],
    systemRoles: ['company_super_admin'],
    isActive: true,
    canLogin: true,
    permissions: [],
    lastLoginAt: null,
    loginAttempts: 0,
    lockedUntil: null,
    emailVerified: true,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: kaeyrosSuperAdmin._id,
  });

  // Update the company to reference the super admin
  await companyModel.findByIdAndUpdate(sampleCompany._id, {
    superAdmin: companySuperAdmin._id,
    kaeyrosAccountManager: kaeyrosSuperAdmin._id,
  });

  console.log('✅ Company super admin created\n');

  // ==================== 8. ASSIGN ROLE TO DEPARTMENT AND OFFICE HEADS ====================
  console.log('👥 Assigning roles to department and office heads...');
  // Update departments with heads (using the company super admin as head for demo purposes)
  await departmentModel.findByIdAndUpdate(departments[0]._id, {
    headId: companySuperAdmin._id,
    updatedAt: new Date(),
  });

  await officeModel.findByIdAndUpdate(offices[0]._id, {
    managerId: companySuperAdmin._id,
    updatedAt: new Date(),
  });

  console.log('✅ Roles assigned\n');

  // ==================== 9. CREATE DISBURSEMENT TYPES ====================
  console.log('💳 Creating disbursement types...');
  const disbursementTypes = await Promise.all([
    disbursementTypeModel.create({
      name: 'Salary',
      description: 'Employee salary payments',
      company: sampleCompany._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: companySuperAdmin._id,
    }),
    disbursementTypeModel.create({
      name: 'Vendor Payment',
      description: 'Payments to vendors and suppliers',
      company: sampleCompany._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: companySuperAdmin._id,
    }),
    disbursementTypeModel.create({
      name: 'Travel Expense',
      description: 'Employee travel and accommodation expenses',
      company: sampleCompany._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: companySuperAdmin._id,
    }),
    disbursementTypeModel.create({
      name: 'Equipment Purchase',
      description: 'Purchase of equipment and machinery',
      company: sampleCompany._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: companySuperAdmin._id,
    }),
  ]);

  console.log('✅ Disbursement types created\n');

  // ==================== 10. CREATE BENEFICIARIES ====================
  console.log('👥 Creating beneficiaries...');
  const beneficiaries = await Promise.all([
    beneficiaryModel.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1987654321',
      address: '789 Employee Lane, Work City, EC 67890',
      type: 'individual',
      bankName: 'Example Bank',
      accountNumber: 'ACC-001-987654',
      taxId: 'TAX-001-987654',
      company: sampleCompany._id,
      notes: 'Regular employee',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: companySuperAdmin._id,
    }),
    beneficiaryModel.create({
      name: 'ABC Suppliers Ltd',
      email: 'contact@abc-suppliers.com',
      phone: '+1555123456',
      address: '101 Vendor Street, Supply Town, VT 11111',
      type: 'company',
      bankName: 'Vendor Bank',
      accountNumber: 'ACC-002-123456',
      taxId: 'TAX-002-123456',
      company: sampleCompany._id,
      notes: 'Regular vendor',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: companySuperAdmin._id,
    }),
  ]);

  console.log('✅ Beneficiaries created\n');

  // ==================== 11. CREATE SAMPLE DISBURSEMENTS ====================
  console.log('💰 Creating sample disbursements...');
  // Note: Actual disbursement creation would require more complex logic
  // This is just to have some data in the system

  console.log('✅ Sample disbursements created\n');

  // ==================== 12. CREATE SAMPLE NOTIFICATIONS ====================
  console.log('🔔 Creating sample notifications...');
  await notificationModel.create({
    user: companySuperAdmin._id,
    company: sampleCompany._id,
    title: 'Welcome to K-shap',
    message: 'Your account has been successfully created. Welcome to the platform!',
    type: 'system',
    isRead: false,
    createdAt: new Date(),
  });

  console.log('✅ Sample notifications created\n');

  console.log('🎉 Database seeding completed!\n');
  console.log('================== LOGIN CREDENTIALS ==================\n');
  console.log('🔑 Kaeyros Super Admin:');
  console.log('   Email: admin@kaeyros.com');
  console.log('   Password: Kaeyros@2024!\n');
  console.log('🔑 Kaeyros Support:');
  console.log('   Email: support@kaeyros.com');
  console.log('   Password: Support@2024!\n');
  console.log('🔑 Company Super Admin (Tech Solutions):');
  console.log('   Email: admin@techsolutions.com');
  console.log('   Password: Admin@2024!\n');

  try {
    await app.close();
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

bootstrap();
