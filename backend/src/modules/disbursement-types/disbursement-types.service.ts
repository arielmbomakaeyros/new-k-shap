import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DisbursementType } from '../../database/schemas/disbursement-type.schema';

@Injectable()
export class DisbursementTypesService {
  constructor(@InjectModel(DisbursementType.name) private disbursementTypeModel: Model<DisbursementType>) {}

  async create(createDisbursementTypeDto: any) {
    const createdDisbursementType = new this.disbursementTypeModel(createDisbursementTypeDto);
    return createdDisbursementType.save();
  }

  async findAll() {
    return this.disbursementTypeModel.find();
  }

  async findOne(id: string) {
    return this.disbursementTypeModel.findById(id);
  }

  async update(id: string, updateDisbursementTypeDto: any) {
    return this.disbursementTypeModel.findByIdAndUpdate(id, updateDisbursementTypeDto, { new: true });
  }

  async remove(id: string) {
    return this.disbursementTypeModel.findByIdAndDelete(id);
  }
}
