import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Office } from '../../database/schemas/office.schema';

@Injectable()
export class OfficesService {
  constructor(@InjectModel(Office.name) private officeModel: Model<Office>) {}

  async create(createOfficeDto: any) {
    const createdOffice = new this.officeModel(createOfficeDto);
    return createdOffice.save();
  }

  async findAll() {
    return this.officeModel.find();
  }

  async findOne(id: string) {
    return this.officeModel.findById(id);
  }

  async update(id: string, updateOfficeDto: any) {
    return this.officeModel.findByIdAndUpdate(id, updateOfficeDto, { new: true });
  }

  async remove(id: string) {
    return this.officeModel.findByIdAndDelete(id);
  }
}
