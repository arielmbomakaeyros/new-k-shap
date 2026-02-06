import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Office } from '../../database/schemas/office.schema';

@Injectable()
export class OfficesService {
  constructor(@InjectModel(Office.name) private officeModel: Model<Office>) {}

  async create(createOfficeDto: any, companyId?: string | null) {
    const data = { ...createOfficeDto };
    if (companyId) {
      data.company = new Types.ObjectId(companyId);
    }
    const createdOffice = new this.officeModel(data);
    return createdOffice.save();
  }

  async findAll(companyId?: string | null) {
    const filter = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.officeModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.officeModel.findOne(filter as any);
  }

  async update(id: string, updateOfficeDto: any, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.officeModel.findOneAndUpdate(filter as any, updateOfficeDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.officeModel.findOneAndDelete(filter as any);
  }
}
