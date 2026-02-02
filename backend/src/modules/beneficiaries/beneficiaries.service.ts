import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Beneficiary } from '../../database/schemas/beneficiary.schema';

@Injectable()
export class BeneficiariesService {
  constructor(@InjectModel(Beneficiary.name) private beneficiaryModel: Model<Beneficiary>) {}

  async create(createBeneficiaryDto: any) {
    const createdBeneficiary = new this.beneficiaryModel(createBeneficiaryDto);
    return createdBeneficiary.save();
  }

  async findAll() {
    return this.beneficiaryModel.find();
  }

  async findOne(id: string) {
    return this.beneficiaryModel.findById(id);
  }

  async update(id: string, updateBeneficiaryDto: any) {
    return this.beneficiaryModel.findByIdAndUpdate(id, updateBeneficiaryDto, { new: true });
  }

  async remove(id: string) {
    return this.beneficiaryModel.findByIdAndDelete(id);
  }
}
