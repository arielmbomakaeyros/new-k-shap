import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from '../../database/schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>) {}

  async create(createAuditLogDto: any, companyId?: string | null) {
    const createdAuditLog = new this.auditLogModel({
      ...createAuditLogDto,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    });
    return createdAuditLog.save();
  }

  async findAll(companyId?: string | null) {
    const filter = companyId ? { company: new Types.ObjectId(companyId) } : {};
    return this.auditLogModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.auditLogModel.findOne(filter as any);
  }

  async update(id: string, updateAuditLogDto: any, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.auditLogModel.findOneAndUpdate(filter as any, updateAuditLogDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.auditLogModel.findOneAndDelete(filter as any);
  }
}
