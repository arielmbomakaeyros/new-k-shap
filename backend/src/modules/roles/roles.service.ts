import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '../../database/schemas/role.schema';
import { Permission } from '../../database/schemas/permission.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async createDefaultCompanyRoles(companyId: string, createdBy?: string) {
    const companyObjectId = new Types.ObjectId(companyId);
    const basePermissions = await this.permissionModel.find({ isSystemPermission: true } as any).exec();
    const permissions = basePermissions.length
      ? basePermissions
      : await this.permissionModel.find({ company: { $exists: false } } as any).exec();

    const allPermissionIds = permissions.map((p) => p._id);
    const disbursementReadApprove = permissions
      .filter(
        (p) =>
          p.code?.includes('disbursement') &&
          (p.code?.includes('read') || p.code?.includes('approve')),
      )
      .map((p) => p._id);
    const disbursementReadUpdate = permissions
      .filter(
        (p) =>
          p.code?.includes('disbursement') &&
          (p.code?.includes('read') || p.code?.includes('update')),
      )
      .map((p) => p._id);
    const readOnlyPermissions = permissions
      .filter((p) => p.code?.includes('read'))
      .map((p) => p._id);

    const roleDefinitions = [
      {
        name: 'Company Super Admin',
        description: 'Full access to all company features',
        systemRoleType: 'company_super_admin',
        permissions: allPermissionIds,
      },
      {
        name: 'Validator',
        description: 'Validate disbursements',
        systemRoleType: 'validator',
        permissions: disbursementReadApprove,
      },
      {
        name: 'Department Head',
        description: 'Approve disbursements for department',
        systemRoleType: 'department_head',
        permissions: disbursementReadApprove,
      },
      {
        name: 'Cashier',
        description: 'Process disbursements',
        systemRoleType: 'cashier',
        permissions: disbursementReadUpdate,
      },
      {
        name: 'Agent',
        description: 'Basic user with limited access',
        systemRoleType: 'agent',
        permissions: readOnlyPermissions,
      },
    ];

    const createdRoles: Role[] = [];

    for (const roleDef of roleDefinitions) {
      const existing = await this.roleModel.findOne({
        company: companyObjectId,
        systemRoleType: roleDef.systemRoleType,
      } as any);
      if (existing) continue;

      const createdRole = await this.roleModel.create({
        company: companyObjectId as any,
        name: roleDef.name,
        description: roleDef.description,
        permissions: roleDef.permissions as any,
        isSystemRole: true,
        systemRoleType: roleDef.systemRoleType,
        createdBy: createdBy ? new Types.ObjectId(createdBy) as any : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      createdRoles.push(createdRole);
    }

    return createdRoles;
  }

  async create(createRoleDto: any) {
    const createdRole = new this.roleModel(createRoleDto);
    const saved = await createdRole.save();
    return saved.populate('permissions');
  }

  async findAll(companyId?: string | null) {
    const filter = companyId ? { company: new Types.ObjectId(companyId) } : {};
    return this.roleModel.find(filter as any).populate('permissions');
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.roleModel.findOne(filter as any).populate('permissions');
  }

  async update(id: string, updateRoleDto: any, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.roleModel.findOneAndUpdate(filter as any, updateRoleDto, { new: true }).populate('permissions');
  }

  async remove(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.roleModel.findOneAndDelete(filter as any);
  }
}
