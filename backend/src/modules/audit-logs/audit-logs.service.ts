import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from '../../database/schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>) {}

  async create(createAuditLogDto: any) {
    const createdAuditLog = new this.auditLogModel(createAuditLogDto);
    return createdAuditLog.save();
  }

  async findAll() {
    return this.auditLogModel.find();
  }

  async findOne(id: string) {
    return this.auditLogModel.findById(id);
  }

  async update(id: string, updateAuditLogDto: any) {
    return this.auditLogModel.findByIdAndUpdate(id, updateAuditLogDto, { new: true });
  }

  async remove(id: string) {
    return this.auditLogModel.findByIdAndDelete(id);
  }
}
