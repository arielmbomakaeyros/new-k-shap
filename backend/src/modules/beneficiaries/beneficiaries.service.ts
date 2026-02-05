import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Beneficiary } from '../../database/schemas/beneficiary.schema';

@Injectable()
export class BeneficiariesService {
  constructor(@InjectModel(Beneficiary.name) private beneficiaryModel: Model<Beneficiary>) {}

  async create(createBeneficiaryDto: any, companyId?: string | null) {
    const createdBeneficiary = new this.beneficiaryModel({
      ...createBeneficiaryDto,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    });
    return createdBeneficiary.save();
  }

  async findAll(companyId?: string | null, disbursementType?: string) {
    const filter: Record<string, any> = companyId
      ? { company: new Types.ObjectId(companyId) }
      : {};
    if (disbursementType) {
      filter.disbursementType = new Types.ObjectId(disbursementType);
    }
    return this.beneficiaryModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.beneficiaryModel.findOne(filter as any);
  }

  async update(id: string, updateBeneficiaryDto: any, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.beneficiaryModel.findOneAndUpdate(filter as any, updateBeneficiaryDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.beneficiaryModel.findOneAndDelete(filter as any);
  }
}
