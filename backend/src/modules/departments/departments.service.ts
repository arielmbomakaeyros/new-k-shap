import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from '../../database/schemas/department.schema';

@Injectable()
export class DepartmentsService {
  constructor(@InjectModel(Department.name) private departmentModel: Model<Department>) {}

  async create(createDepartmentDto: any) {
    const createdDepartment = new this.departmentModel(createDepartmentDto);
    return createdDepartment.save();
  }

  async findAll() {
    return this.departmentModel.find();
  }

  async findOne(id: string) {
    return this.departmentModel.findById(id);
  }

  async update(id: string, updateDepartmentDto: any) {
    return this.departmentModel.findByIdAndUpdate(id, updateDepartmentDto, { new: true });
  }

  async remove(id: string) {
    return this.departmentModel.findByIdAndDelete(id);
  }
}
