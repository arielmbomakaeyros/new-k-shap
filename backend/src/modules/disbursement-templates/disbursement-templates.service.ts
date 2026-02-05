import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DisbursementTemplate } from '../../database/schemas/disbursement-template.schema';
import { CreateDisbursementTemplateDto, UpdateDisbursementTemplateDto } from './dto';

@Injectable()
export class DisbursementTemplatesService {
  constructor(
    @InjectModel(DisbursementTemplate.name)
    private templateModel: Model<DisbursementTemplate>,
  ) {}

  async create(dto: CreateDisbursementTemplateDto, companyId: string | null | undefined, userId: string) {
    if (!companyId) {
      throw new NotFoundException('Company not found');
    }
    const template = new this.templateModel({
      ...dto,
      company: new Types.ObjectId(companyId),
      createdBy: new Types.ObjectId(userId),
      currency: dto.currency || 'XAF',
    });

    return template.save();
  }

  async findAll(companyId?: string | null) {
    const filter: Record<string, any> = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.templateModel
      .find(filter as any)
      .sort({ createdAt: -1 })
      .populate('disbursementType')
      .populate('beneficiary')
      .populate('department')
      .populate('office')
      .exec();
  }

  async findOne(id: string, companyId?: string | null) {
    const filter: Record<string, any> = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    const template = await this.templateModel
      .findOne(filter as any)
      .populate('disbursementType')
      .populate('beneficiary')
      .populate('department')
      .populate('office')
      .exec();

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(id: string, dto: UpdateDisbursementTemplateDto, companyId: string | null | undefined, userId: string) {
    const template = await this.templateModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    } as any);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    Object.assign(template, dto, { updatedBy: new Types.ObjectId(userId) });
    return template.save();
  }

  async remove(id: string, companyId: string | null | undefined, userId: string) {
    const template = await this.templateModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    } as any);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    template.isDeleted = true;
    template.deletedAt = new Date();
    template.deletedBy = new Types.ObjectId(userId) as any;
    return template.save();
  }
}
