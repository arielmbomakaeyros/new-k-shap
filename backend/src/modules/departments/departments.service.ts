import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department } from '../../database/schemas/department.schema';

@Injectable()
export class DepartmentsService {
  constructor(@InjectModel(Department.name) private departmentModel: Model<Department>) {}

  async create(createDepartmentDto: any, companyId?: string | null) {
    const data = { ...createDepartmentDto };
    if (companyId) {
      data.company = new Types.ObjectId(companyId);
    }
    const createdDepartment = new this.departmentModel(data);
    return createdDepartment.save();
  }

  async findAll(companyId?: string | null) {
    const filter = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.departmentModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.departmentModel.findOne(filter as any);
  }

  async update(id: string, updateDepartmentDto: any, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.departmentModel.findOneAndUpdate(filter as any, updateDepartmentDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.departmentModel.findOneAndDelete(filter as any);
  }
}
