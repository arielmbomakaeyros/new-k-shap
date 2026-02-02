import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Disbursement } from '../../database/schemas/disbursement.schema';

@Injectable()
export class DisbursementsService {
  constructor(@InjectModel(Disbursement.name) private disbursementModel: Model<Disbursement>) {}

  async create(createDisbursementDto: any) {
    const createdDisbursement = new this.disbursementModel(createDisbursementDto);
    return createdDisbursement.save();
  }

  async findAll() {
    return this.disbursementModel.find();
  }

  async findOne(id: string) {
    return this.disbursementModel.findById(id);
  }

  async update(id: string, updateDisbursementDto: any) {
    return this.disbursementModel.findByIdAndUpdate(id, updateDisbursementDto, { new: true });
  }

  async remove(id: string) {
    return this.disbursementModel.findByIdAndDelete(id);
  }
}
