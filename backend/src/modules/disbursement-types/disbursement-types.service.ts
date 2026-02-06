import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DisbursementType } from '../../database/schemas/disbursement-type.schema';

@Injectable()
export class DisbursementTypesService {
  constructor(@InjectModel(DisbursementType.name) private disbursementTypeModel: Model<DisbursementType>) {}

  async create(createDisbursementTypeDto: any, companyId?: string | null) {
    const createdDisbursementType = new this.disbursementTypeModel({
      ...createDisbursementTypeDto,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    });
    return createdDisbursementType.save();
  }

  async findAll(companyId?: string | null) {
    const filter = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.disbursementTypeModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.disbursementTypeModel.findOne(filter as any);
  }

  async update(id: string, updateDisbursementTypeDto: any, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.disbursementTypeModel.findOneAndUpdate(filter as any, updateDisbursementTypeDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.disbursementTypeModel.findOneAndDelete(filter as any);
  }
}
