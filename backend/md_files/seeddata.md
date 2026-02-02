// ==================== src/database/seeders/seed.ts ====================

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

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
  const disbursementModel = app.get('DisbursementModel') as Model<any>;

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
    canLogin: true,
    mustChangePassword: false,
    isActive: true,
  });

  const kaeyrosSupport = await userModel.create({
    firstName: 'Kaeyros',
    lastName: 'Support',
    email: 'support@kaeyros.com',
    password: await bcrypt.hash('Support@2024!', 10),
    isKaeyrosUser: true,
    systemRoles: ['kaeyros_support'],
    canLogin: true,
    mustChangePassword: false,
    isActive: true,
  });

  console.log('✅ Kaeyros users created\n');

  // ==================== 2. CREATE SAMPLE COMPANY ====================
  
  console.log('🏢 Creating sample company...');

  const sampleCompany = await companyModel.create({
    name: 'Tech Solutions Ltd',
    slug: 'tech-solutions-ltd',
    email: 'contact@techsolutions.com',
    phone: '+237670000000',
    address: 'Douala, Cameroon',
    status: 'active',
    subscriptionStartDate: new Date(),
    subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    planType: 'premium',
    maxUsers: 100,
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
    defaultCurrency: 'XAF',
    timezone: 'Africa/Douala',
    supportedLanguages: ['fr', 'en'],
    defaultLanguage: 'fr',
    createdBy: kaeyrosSuperAdmin._id,
    kaeyrosAccountManager: kaeyrosSuperAdmin._id,
  });

  console.log('✅ Company created\n');

  // ==================== 3. CREATE DEPARTMENTS ====================
  
  console.log('📁 Creating departments...');

  const departments = await departmentModel.insertMany([
    {
      company: sampleCompany._id,
      name: 'Finance',
      code: 'FIN-001',
      description: 'Finance and accounting department',
      createdBy: kaeyrosSuperAdmin._id,
    },
    {
      company: sampleCompany._id,
      name: 'IT',
      code: 'IT-001',
      description: 'Information Technology department',
      createdBy: kaeyrosSuperAdmin._id,
    },
    {
      company: sampleCompany._id,
      name: 'Operations',
      code: 'OPS-001',
      description: 'Operations department',
      createdBy: kaeyrosSuperAdmin._id,
    },
    {
      company: sampleCompany._id,
      name: 'Human Resources',
      code: 'HR-001',
      description: 'Human Resources department',
      createdBy: kaeyrosSuperAdmin._id,
    },
  ]);

  console.log(`✅ ${departments.length} departments created\n`);

  // ==================== 4. CREATE OFFICES ====================
  
  console.log('🏢 Creating offices...');

  const offices = await officeModel.insertMany([
    {
      company: sampleCompany._id,
      name: 'Douala Office',
      code: 'DLA',
      address: 'Akwa, Douala',
      city: 'Douala',
      country: 'Cameroon',
      phone: '+237670000001',
      createdBy: kaeyrosSuperAdmin._id,
    },
    {
      company: sampleCompany._id,
      name: 'Yaoundé Office',
      code: 'YDE',
      address: 'Centre Ville, Yaoundé',
      city: 'Yaoundé',
      country: 'Cameroon',
      phone: '+237670000002',
      createdBy: kaeyrosSuperAdmin._id,
    },
  ]);

  console.log(`✅ ${offices.length} offices created\n`);

  // ==================== 5. CREATE PERMISSIONS ====================
  
  console.log('🔐 Creating permissions...');

  const permissions = await permissionModel.insertMany([
    // User permissions
    { company: sampleCompany._id, name: 'Create User', code: 'user.create', resource: 'USER', action: 'CREATE', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Read User', code: 'user.read', resource: 'USER', action: 'READ', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Update User', code: 'user.update', resource: 'USER', action: 'UPDATE', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Delete User', code: 'user.delete', resource: 'USER', action: 'DELETE', isSystemPermission: true },
    
    // Disbursement permissions
    { company: sampleCompany._id, name: 'Create Disbursement', code: 'disbursement.create', resource: 'DISBURSEMENT', action: 'CREATE', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Read Disbursement', code: 'disbursement.read', resource: 'DISBURSEMENT', action: 'READ', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Update Disbursement', code: 'disbursement.update', resource: 'DISBURSEMENT', action: 'UPDATE', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Delete Disbursement', code: 'disbursement.delete', resource: 'DISBURSEMENT', action: 'DELETE', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Validate Disbursement', code: 'disbursement.validate', resource: 'DISBURSEMENT', action: 'VALIDATE', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Approve Disbursement', code: 'disbursement.approve', resource: 'DISBURSEMENT', action: 'APPROVE', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Execute Disbursement', code: 'disbursement.execute', resource: 'DISBURSEMENT', action: 'EXECUTE', isSystemPermission: true },
    { company: sampleCompany._id, name: 'Force Complete Disbursement', code: 'disbursement.force_complete', resource: 'DISBURSEMENT', action: 'FORCE_COMPLETE', isSystemPermission: true },
    
    // Export permissions
    { company: sampleCompany._id, name: 'Export Data', code: 'export.data', resource: 'EXPORT', action: 'EXPORT', isSystemPermission: true },
  ]);

  console.log(`✅ ${permissions.length} permissions created\n`);

  // ==================== 6. CREATE ROLES ====================
  
  console.log('👥 Creating roles...');

  const superAdminRole = await roleModel.create({
    company: sampleCompany._id,
    name: 'Company Super Admin',
    description: 'Full access to all company features',
    permissions: permissions.map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'company_super_admin',
    hierarchyLevel: 3,
    createdBy: kaeyrosSuperAdmin._id,
  });

  const validatorRole = await roleModel.create({
    company: sampleCompany._id,
    name: 'Validator',
    description: 'Can approve disbursements',
    permissions: permissions.filter(p => p.code.startsWith('disbursement.')).map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'validator',
    hierarchyLevel: 2,
    createdBy: kaeyrosSuperAdmin._id,
  });

  const deptHeadRole = await roleModel.create({
    company: sampleCompany._id,
    name: 'Department Head',
    description: 'Can validate disbursements for their department',
    permissions: permissions.filter(p => p.code.includes('read') || p.code.includes('validate')).map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'department_head',
    hierarchyLevel: 1,
    createdBy: kaeyrosSuperAdmin._id,
  });

  const cashierRole = await roleModel.create({
    company: sampleCompany._id,
    name: 'Cashier',
    description: 'Can execute disbursements',
    permissions: permissions.filter(p => p.code.includes('read') || p.code.includes('execute')).map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'cashier',
    hierarchyLevel: 1,
    createdBy: kaeyrosSuperAdmin._id,
  });

  const agentRole = await roleModel.create({
    company: sampleCompany._id,
    name: 'Agent',
    description: 'Can create disbursements',
    permissions: permissions.filter(p => p.code.includes('read') || p.code === 'disbursement.create').map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'agent',
    hierarchyLevel: 0,
    createdBy: kaeyrosSuperAdmin._id,
  });

  const accountantRole = await roleModel.create({
    company: sampleCompany._id,
    name: 'Accountant',
    description: 'Read-only access with export capabilities',
    permissions: permissions.filter(p => p.code.includes('read') || p.code.includes('export')).map(p => p._id),
    isSystemRole: true,
    systemRoleType: 'accountant',
    hierarchyLevel: 0,
    createdBy: kaeyrosSuperAdmin._id,
  });

  console.log('✅ Roles created\n');

  // ==================== 7. CREATE USERS ====================
  
  console.log('👤 Creating company users...');

  const companySuperAdmin = await userModel.create({
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@techsolutions.com',
    password: await bcrypt.hash('Admin@2024!', 10),
    phone: '+237670000010',
    company: sampleCompany._id,
    roles: [superAdminRole._id],
    systemRoles: ['company_super_admin'],
    departments: [departments[0]._id],
    offices: [offices[0]._id],
    canLogin: true,
    isActive: true,
    createdBy: kaeyrosSuperAdmin._id,
  });

  const validator = await userModel.create({
    firstName: 'Alice',
    lastName: 'Validator',
    email: 'alice@techsolutions.com',
    password: await bcrypt.hash('Validator@2024!', 10),
    company: sampleCompany._id,
    roles: [validatorRole._id],
    systemRoles: ['validator'],
    departments: [departments[0]._id],
    offices: [offices[0]._id],
    maxApprovalAmount: 5000000,
    canLogin: true,
    isActive: true,
    createdBy: companySuperAdmin._id,
  });

  const deptHead = await userModel.create({
    firstName: 'Bob',
    lastName: 'Manager',
    email: 'bob@techsolutions.com',
    password: await bcrypt.hash('Manager@2024!', 10),
    company: sampleCompany._id,
    roles: [deptHeadRole._id],
    systemRoles: ['department_head'],
    departments: [departments[1]._id],
    offices: [offices[0]._id],
    canLogin: true,
    isActive: true,
    createdBy: companySuperAdmin._id,
  });

  const cashier = await userModel.create({
    firstName: 'Carol',
    lastName: 'Cashier',
    email: 'carol@techsolutions.com',
    password: await bcrypt.hash('Cashier@2024!', 10),
    company: sampleCompany._id,
    roles: [cashierRole._id],
    systemRoles: ['cashier'],
    departments: [departments[0]._id],
    offices: [offices[0]._id],
    canLogin: true,
    isActive: true,
    createdBy: companySuperAdmin._id,
  });

  const agent = await userModel.create({
    firstName: 'David',
    lastName: 'Agent',
    email: 'david@techsolutions.com',
    password: await bcrypt.hash('Agent@2024!', 10),
    company: sampleCompany._id,
    roles: [agentRole._id],
    systemRoles: ['agent'],
    departments: [departments[1]._id],
    offices: [offices[0]._id],
    canLogin: true,
    isActive: true,
    createdBy: companySuperAdmin._id,
  });

  // Update department heads
  departments[0].head = validator._id;
  await departments[0].save();
  departments[1].head = deptHead._id;
  await departments[1].save();

  // Update company user count
  sampleCompany.currentUserCount = 5;
  await sampleCompany.save();

  console.log('✅ Users created\n');

  // ==================== 8. CREATE DISBURSEMENT TYPES ====================
  
  console.log('💼 Creating disbursement types...');

  const disbursementTypes = await disbursementTypeModel.insertMany([
    {
      company: sampleCompany._id,
      name: 'Office Supplies',
      code: 'SUPP',
      description: 'Office supplies and equipment',
      category: 'Operational',
      requiresDeptHeadValidation: true,
      requiresValidatorApproval: true,
      requiresCashierExecution: true,
      icon: 'package',
      color: '#3B82F6',
      createdBy: companySuperAdmin._id,
    },
    {
      company: sampleCompany._id,
      name: 'Monthly Bills',
      code: 'BILLS',
      description: 'Utilities and recurring bills',
      category: 'Administrative',
      requiresDeptHeadValidation: true,
      requiresValidatorApproval: true,
      requiresCashierExecution: true,
      autoApproveUnder: 50000,
      icon: 'receipt',
      color: '#10B981',
      createdBy: companySuperAdmin._id,
    },
    {
      company: sampleCompany._id,
      name: 'Employee Salaries',
      code: 'SAL',
      description: 'Monthly salary payments',
      category: 'Payroll',
      requiresDeptHeadValidation: true,
      requiresValidatorApproval: true,
      requiresCashierExecution: true,
      icon: 'users',
      color: '#F59E0B',
      createdBy: companySuperAdmin._id,
    },
  ]);

  console.log(`✅ ${disbursementTypes.length} disbursement types created\n`);

  // ==================== 9. CREATE BENEFICIARIES ====================
  
  console.log('👥 Creating beneficiaries...');

  const beneficiaries = await beneficiaryModel.insertMany([
    {
      company: sampleCompany._id,
      name: 'Office Depot Cameroon',
      type: 'supplier',
      disbursementType: disbursementTypes[0]._id,
      email: 'contact@officedepot.cm',
      phone: '+237670000100',
      address: 'Douala, Cameroon',
      createdBy: companySuperAdmin._id,
    },
    {
      company: sampleCompany._id,
      name: 'ENEO',
      type: 'company',
      disbursementType: disbursementTypes[1]._id,
      email: 'support@eneo.cm',
      phone: '+237670000101',
      createdBy: companySuperAdmin._id,
    },
    {
      company: sampleCompany._id,
      name: 'CAMWATER',
      type: 'company',
      disbursementType: disbursementTypes[1]._id,
      email: 'info@camwater.cm',
      phone: '+237670000102',
      createdBy: companySuperAdmin._id,
    },
  ]);

  console.log(`✅ ${beneficiaries.length} beneficiaries created\n`);

  // ==================== 10. CREATE SAMPLE DISBURSEMENTS ====================
  
  console.log('💰 Creating sample disbursements...');

  const now = new Date();

  // Completed disbursement
  const completedDisbursement = await disbursementModel.create({
    company: sampleCompany._id,
    referenceNumber: 'DISB-2024-000001',
    amount: 150000,
    currency: 'XAF',
    status: 'completed',
    disbursementType: disbursementTypes[0]._id,
    beneficiary: beneficiaries[0]._id,
    description: 'Purchase of office supplies',
    purpose: 'Needed for new employees',
    department: departments[1]._id,
    office: offices[0]._id,
    paymentMethod: 'bank_transfer',
    expectedPaymentDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    actualPaymentDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    isCompleted: true,
    completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    createdBy: agent._id,
    // Workflow steps
    agentSubmission: {
      status: 'approved',
      isCompleted: true,
      completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      completedBy: agent._id,
      history: [{
        action: 'created',
        performedBy: agent._id,
        performedByName: 'David Agent',
        performedByRole: 'agent',
        performedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      }],
    },
    deptHeadValidation: {
      status: 'approved',
      isCompleted: true,
      completedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      completedBy: deptHead._id,
      history: [{
        action: 'dept_head_validated',
        performedBy: deptHead._id,
        performedByName: 'Bob Manager',
        performedByRole: 'department_head',
        performedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      }],
    },
    validatorApproval: {
      status: 'approved',
      isCompleted: true,
      completedAt: new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000),
      completedBy: validator._id,
      history: [{
        action: 'validator_approved',
        performedBy: validator._id,
        performedByName: 'Alice Validator',
        performedByRole: 'validator',
        performedAt: new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000),
      }],
    },
    cashierExecution: {
      status: 'approved',
      isCompleted: true,
      completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      completedBy: cashier._id,
      history: [{
        action: 'cashier_executed',
        performedBy: cashier._id,
        performedByName: 'Carol Cashier',
        performedByRole: 'cashier',
        performedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      }],
    },
    actionHistory: [
      {
        action: 'created',
        performedBy: agent._id,
        performedByName: 'David Agent',
        performedByRole: 'agent',
        performedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        action: 'dept_head_validated',
        performedBy: deptHead._id,
        performedByName: 'Bob Manager',
        performedByRole: 'department_head',
        performedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        action: 'validator_approved',
        performedBy: validator._id,
        performedByName: 'Alice Validator',
        performedByRole: 'validator',
        performedAt: new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000),
      },
      {
        action: 'cashier_executed',
        performedBy: cashier._id,
        performedByName: 'Carol Cashier',
        performedByRole: 'cashier',
        performedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Pending disbursement (waiting for dept head)
  const pendingDisbursement = await disbursementModel.create({
    company: sampleCompany._id,
    referenceNumber: 'DISB-2024-000002',
    amount: 250000,
    currency: 'XAF',
    status: 'pending_dept_head',
    disbursementType: disbursementTypes[1]._id,
    beneficiary: beneficiaries[1]._id,
    description: 'Electricity bill payment',
    department: departments[0]._id,
    office: offices[0]._id,
    paymentMethod: 'bank_transfer',
    expectedPaymentDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    priority: 'high',
    deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    createdBy: agent._id,
    agentSubmission: {
      status: 'approved',
      isCompleted: true,
      completedAt: now,
      completedBy: agent._id,
      history: [{
        action: 'created',
        performedBy: agent._id,
        performedByName: 'David Agent',
        performedByRole: 'agent',
        performedAt: now,
      }],
    },
    deptHeadValidation: { status: 'pending', history: [] },
    validatorApproval: { status: 'pending', history: [] },
    cashierExecution: { status: 'pending', history: [] },
    actionHistory: [{
      action: 'created',
      performedBy: agent._id,
      performedByName: 'David Agent',
      performedByRole: 'agent',
      performedAt: now,
    }],
  });

  console.log('✅ Sample disbursements created\n');

  // ==================== SUMMARY ====================
  
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
  console.log('🔑 Validator:');
  console.log('   Email: alice@techsolutions.com');
  console.log('   Password: Validator@2024!\n');
  console.log('🔑 Department Head:');
  console.log('   Email: bob@techsolutions.com');
  console.log('   Password: Manager@2024!\n');
  console.log('🔑 Cashier:');
  console.log('   Email: carol@techsolutions.com');
  console.log('   Password: Cashier@2024!\n');
  console.log('🔑 Agent:');
  console.log('   Email: david@techsolutions.com');
  console.log('   Password: Agent@2024!\n');
  console.log('======================================================\n');

  await app.close();
}

bootstrap()
  .then(() => {
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });