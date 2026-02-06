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

  async findAll(companyId?: string | null, params?: any) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      search,
      userId,
      action,
      resourceType,
      resourceId,
      startDate,
      endDate,
    } = params || {};

    const filter: any = companyId ? { company: new Types.ObjectId(companyId) } : {};
    if (userId) filter.user = new Types.ObjectId(userId);
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (resourceId) filter.resourceId = new Types.ObjectId(resourceId);
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { userEmail: regex },
        { userName: regex },
        { actionDescription: regex },
        { resourceName: regex },
        { resourceType: regex },
        { endpoint: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortField = sortBy || 'timestamp';

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(filter as any)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'firstName lastName email avatar')
        .exec(),
      this.auditLogModel.countDocuments(filter),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
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
