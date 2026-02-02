import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../../database/schemas/permission.schema';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private permissionModel: Model<Permission>) {}

  async create(createPermissionDto: any) {
    const createdPermission = new this.permissionModel(createPermissionDto);
    return createdPermission.save();
  }

  async findAll() {
    return this.permissionModel.find();
  }

  async findOne(id: string) {
    return this.permissionModel.findById(id);
  }

  async update(id: string, updatePermissionDto: any) {
    return this.permissionModel.findByIdAndUpdate(id, updatePermissionDto, { new: true });
  }

  async remove(id: string) {
    return this.permissionModel.findByIdAndDelete(id);
  }
}
