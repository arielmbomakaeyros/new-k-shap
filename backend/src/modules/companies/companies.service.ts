import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from '../../database/schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: Model<Company>) {}

  async create(createCompanyDto: any) {
    // Generate slug from name
    const slug = createCompanyDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const createdCompany = new this.companyModel({
      ...createCompanyDto,
      slug,
    });
    return createdCompany.save();
  }

  async findAll() {
    return this.companyModel.find();
  }

  async findOne(id: string) {
    return this.companyModel.findById(id);
  }

  async update(id: string, updateCompanyDto: any) {
    // Map subscriptionStatus to status for database
    const updateData = { ...updateCompanyDto };
    if (updateData.subscriptionStatus) {
      updateData.status = updateData.subscriptionStatus;
      delete updateData.subscriptionStatus;
    }
    return this.companyModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async remove(id: string) {
    return this.companyModel.findByIdAndDelete(id);
  }
}
