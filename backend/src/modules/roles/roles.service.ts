import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../database/schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async create(createRoleDto: any) {
    const createdRole = new this.roleModel(createRoleDto);
    return createdRole.save();
  }

  async findAll() {
    return this.roleModel.find();
  }

  async findOne(id: string) {
    return this.roleModel.findById(id);
  }

  async update(id: string, updateRoleDto: any) {
    return this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true });
  }

  async remove(id: string) {
    return this.roleModel.findByIdAndDelete(id);
  }
}
