import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '../../database/schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

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
