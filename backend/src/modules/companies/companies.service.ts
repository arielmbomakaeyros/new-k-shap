import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from '../../database/schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: Model<Company>) {}

  async create(createCompanyDto: any) {
    const createdCompany = new this.companyModel(createCompanyDto);
    return createdCompany.save();
  }

  async findAll() {
    return this.companyModel.find();
  }

  async findOne(id: string) {
    return this.companyModel.findById(id);
  }

  async update(id: string, updateCompanyDto: any) {
    return this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true });
  }

  async remove(id: string) {
    return this.companyModel.findByIdAndDelete(id);
  }
}
