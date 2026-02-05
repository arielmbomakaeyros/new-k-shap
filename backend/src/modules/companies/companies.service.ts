import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from '../../database/schemas/company.schema';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    private rolesService: RolesService,
  ) {}

  private normalizePrefix(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async create(createCompanyDto: any) {
    // Generate slug from name
    const slug = createCompanyDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const baseFilePrefix = this.normalizePrefix(createCompanyDto.baseFilePrefix || slug);
    if (!baseFilePrefix) {
      throw new BadRequestException('Base file prefix is required');
    }

    const createdCompany = new this.companyModel({
      ...createCompanyDto,
      slug,
      baseFilePrefix,
      filePrefixes: [],
      activeFilePrefix: '',
    });
    const saved = await createdCompany.save();
    await this.rolesService.createDefaultCompanyRoles(saved._id.toString());
    return saved;
  }

  async findAll() {
    return this.companyModel.find();
  }

  async findOne(id: string) {
    return this.companyModel.findById(id);
  }

  async update(id: string, updateCompanyDto: any) {
    if (updateCompanyDto.baseFilePrefix !== undefined) {
      throw new BadRequestException('Base file prefix cannot be changed after creation');
    }
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
