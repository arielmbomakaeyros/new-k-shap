import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { Disbursement } from '../../database/schemas/disbursement.schema';
import {
  DisbursementStatus,
  DisbursementActionType,
} from '../../database/schemas/enums';

interface FindAllOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
  department?: string;
  office?: string;
  beneficiary?: string;
  disbursementType?: string;
  paymentMethod?: string;
  priority?: string;
  isUrgent?: string;
  isRetroactive?: string;
  isCompleted?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  tags?: string;
}

@Injectable()
export class DisbursementsService {
  constructor(
    @InjectModel(Disbursement.name)
    private disbursementModel: Model<Disbursement>,
  ) {}

  private async generateReferenceNumber(): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
      const referenceNumber = `DISB-${datePart}-${randomPart}`;
      const exists = await this.disbursementModel.exists({ referenceNumber });
      if (!exists) return referenceNumber;
    }
    throw new BadRequestException('Failed to generate disbursement reference number');
  }

  private parseObjectIdList(value: string | undefined, fieldName: string) {
    if (!value) return [];
    const items = value.split(',').map((item) => item.trim()).filter(Boolean);
    const ids = items.map((item) => {
      if (!Types.ObjectId.isValid(item)) {
        throw new BadRequestException(`Invalid ${fieldName} id`);
      }
      return new Types.ObjectId(item);
    });
    return ids;
  }

  async create(
    createDisbursementDto: any,
    userId?: string,
    companyId?: string,
  ) {
    const referenceNumber =
      createDisbursementDto.referenceNumber || (await this.generateReferenceNumber());
    const disbursementData = {
      ...createDisbursementDto,
      referenceNumber,
      createdBy: userId,
      company: companyId ? new Types.ObjectId(companyId) : undefined,
      status: DisbursementStatus.DRAFT,
      statusTimeline: {
        draft: new Date(),
      },
    };
    const createdDisbursement = new this.disbursementModel(disbursementData);
    return createdDisbursement.save();
  }

  async findAll(companyId?: string, options?: FindAllOptions) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    } = options || {};

    const query: any = {};

    if (companyId) {
      query.company = new Types.ObjectId(companyId);
    }

    if (search) {
      query.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      query.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
    }

    if (department) {
      const ids = this.parseObjectIdList(department, 'department');
      query.department = ids.length > 1 ? { $in: ids } : ids[0];
    }

    if (office) {
      const ids = this.parseObjectIdList(office, 'office');
      query.office = ids.length > 1 ? { $in: ids } : ids[0];
    }

    if (beneficiary) {
      const ids = this.parseObjectIdList(beneficiary, 'beneficiary');
      query.beneficiary = ids.length > 1 ? { $in: ids } : ids[0];
    }

    if (disbursementType) {
      const ids = this.parseObjectIdList(disbursementType, 'disbursementType');
      query.disbursementType = ids.length > 1 ? { $in: ids } : ids[0];
    }

    if (paymentMethod) {
      const methods = paymentMethod.split(',').map((m) => m.trim()).filter(Boolean);
      query.paymentMethod = methods.length > 1 ? { $in: methods } : methods[0];
    }

    if (priority) {
      const priorities = priority.split(',').map((p) => p.trim()).filter(Boolean);
      query.priority = priorities.length > 1 ? { $in: priorities } : priorities[0];
    }

    if (isUrgent !== undefined) {
      query.isUrgent = isUrgent === 'true';
    }

    if (isRetroactive !== undefined) {
      query.isRetroactive = isRetroactive === 'true';
    }

    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === 'true';
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = Number(minAmount);
      if (maxAmount !== undefined) query.amount.$lte = Number(maxAmount);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length) {
        query.tags = { $in: tagList };
      }
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.disbursementModel
        .find(query as any)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('beneficiary')
        .populate('department')
        .populate('office')
        .populate('disbursementType')
        .exec(),
      this.disbursementModel.countDocuments(query as any),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportCsv(companyId?: string, options?: FindAllOptions) {
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    } = options || {};

    const { data } = await this.findAll(companyId, {
      page: 1,
      limit: 100000,
      sortBy,
      sortOrder,
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    });

    const headers = [
      'Reference Number',
      'Description',
      'Amount',
      'Currency',
      'Status',
      'Payment Method',
      'Priority',
      'Beneficiary',
      'Disbursement Type',
      'Department',
      'Office',
      'Created At',
    ];

    const rows = (data || []).map((item: any) => [
      item.referenceNumber || item._id,
      item.description || '',
      item.amount ?? '',
      item.currency || '',
      item.status || '',
      item.paymentMethod || '',
      item.priority || '',
      item.beneficiary?.name || item.beneficiary?.email || '',
      item.disbursementType?.name || '',
      item.department?.name || '',
      item.office?.name || '',
      item.createdAt ? new Date(item.createdAt).toISOString() : '',
    ]);

    const escape = (value: any) => {
      const str = value === null || value === undefined ? '' : String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ];

    return csvLines.join('\n');
  }

  async exportXlsx(companyId?: string, options?: FindAllOptions) {
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    } = options || {};

    const { data } = await this.findAll(companyId, {
      page: 1,
      limit: 100000,
      sortBy,
      sortOrder,
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Disbursements');

    sheet.columns = [
      { header: 'Reference Number', key: 'referenceNumber', width: 20 },
      { header: 'Description', key: 'description', width: 32 },
      { header: 'Amount', key: 'amount', width: 14 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Beneficiary', key: 'beneficiary', width: 24 },
      { header: 'Disbursement Type', key: 'disbursementType', width: 24 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Office', key: 'office', width: 18 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    (data || []).forEach((item: any) => {
      sheet.addRow({
        referenceNumber: item.referenceNumber || item._id,
        description: item.description || '',
        amount: item.amount ?? '',
        currency: item.currency || '',
        status: item.status || '',
        paymentMethod: item.paymentMethod || '',
        priority: item.priority || '',
        beneficiary: item.beneficiary?.name || item.beneficiary?.email || '',
        disbursementType: item.disbursementType?.name || '',
        department: item.department?.name || '',
        office: item.office?.name || '',
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : '',
      });
    });

    sheet.getRow(1).font = { bold: true };
    return workbook.xlsx.writeBuffer();
  }

  async findOne(id: string, companyId?: string) {
    const disbursement = await this.disbursementModel
      .findOne({
        _id: new Types.ObjectId(id),
        ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      } as any)
      .populate('beneficiary')
      .populate('department')
      .populate('office')
      .populate('disbursementType')
      .exec();

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    return disbursement;
  }

  async update(id: string, updateDisbursementDto: any, userId?: string, companyId?: string) {
    const updateData = {
      ...updateDisbursementDto,
      updatedBy: userId,
    };

    const disbursement = await this.disbursementModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      } as any,
      updateData,
      { new: true },
    );

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    return disbursement;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(id: string, userId?: string, companyId?: string) {
    const disbursement = await this.disbursementModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    return { success: true, message: 'Disbursement deleted successfully' };
  }

  async submit(id: string, userId?: string, companyId?: string) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    if (disbursement.status !== DisbursementStatus.DRAFT) {
      throw new BadRequestException(
        'Disbursement can only be submitted from draft status',
      );
    }

    const now = new Date();
    disbursement.status = DisbursementStatus.PENDING_DEPT_HEAD;
    disbursement.statusTimeline = {
      ...disbursement.statusTimeline,
      pendingDeptHead: now,
    };
    disbursement.agentSubmission = {
      ...disbursement.agentSubmission,
      status: 'approved',
      isCompleted: true,
      completedAt: now,
      completedBy: userId as any,
    };

    disbursement.actionHistory.push({
      action: DisbursementActionType.SUBMIT,
      performedBy: userId as any,
      performedAt: now,
      metadata: {
        previousStatus: DisbursementStatus.DRAFT,
        newStatus: DisbursementStatus.PENDING_DEPT_HEAD,
      },
    } as any);

    return disbursement.save();
  }

  async approve(id: string, userId?: string, notes?: string, companyId?: string) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    const now = new Date();
    const previousStatus = disbursement.status;
    let newStatus: DisbursementStatus;
    let actionType: DisbursementActionType;

    switch (disbursement.status) {
      case DisbursementStatus.PENDING_DEPT_HEAD:
        newStatus = DisbursementStatus.PENDING_VALIDATOR;
        actionType = DisbursementActionType.DEPT_HEAD_VALIDATED;
        disbursement.deptHeadValidation = {
          ...disbursement.deptHeadValidation,
          status: 'approved',
          isCompleted: true,
          completedAt: now,
          completedBy: userId as any,
          notes: notes || '',
        };
        disbursement.statusTimeline = {
          ...disbursement.statusTimeline,
          pendingValidator: now,
        };
        break;

      case DisbursementStatus.PENDING_VALIDATOR:
        newStatus = DisbursementStatus.PENDING_CASHIER;
        actionType = DisbursementActionType.VALIDATOR_APPROVED;
        disbursement.validatorApproval = {
          ...disbursement.validatorApproval,
          status: 'approved',
          isCompleted: true,
          completedAt: now,
          completedBy: userId as any,
          notes: notes || '',
        };
        disbursement.statusTimeline = {
          ...disbursement.statusTimeline,
          pendingCashier: now,
        };
        break;

      case DisbursementStatus.PENDING_CASHIER:
        newStatus = DisbursementStatus.COMPLETED;
        actionType = DisbursementActionType.CASHIER_EXECUTED;
        disbursement.cashierExecution = {
          ...disbursement.cashierExecution,
          status: 'approved',
          isCompleted: true,
          completedAt: now,
          completedBy: userId as any,
          notes: notes || '',
        };
        disbursement.isCompleted = true;
        disbursement.completedAt = now;
        disbursement.statusTimeline = {
          ...disbursement.statusTimeline,
          completed: now,
        };
        break;

      default:
        throw new BadRequestException(
          'Disbursement cannot be approved in current status',
        );
    }

    disbursement.status = newStatus;
    disbursement.actionHistory.push({
      action: actionType,
      performedBy: userId as any,
      performedAt: now,
      notes,
      metadata: {
        previousStatus,
        newStatus,
      },
    } as any);

    return disbursement.save();
  }

  async reject(id: string, userId?: string, reason?: string, companyId?: string) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    const now = new Date();
    const previousStatus = disbursement.status;

    disbursement.status = DisbursementStatus.REJECTED;
    disbursement.currentRejection = {
      rejectedBy: userId as any,
      rejectedAt: now,
      stage: previousStatus,
      reason: reason || '',
      wasUndone: false,
    };
    disbursement.rejectionHistory.push({
      rejectedBy: userId as any,
      rejectedAt: now,
      stage: previousStatus,
      reason: reason || '',
    });
    disbursement.statusTimeline = {
      ...disbursement.statusTimeline,
      rejected: now,
    };
    disbursement.actionHistory.push({
      action: DisbursementActionType.REJECTED,
      performedBy: userId as any,
      performedAt: now,
      reason,
      metadata: {
        previousStatus,
        newStatus: DisbursementStatus.REJECTED,
      },
    } as any);

    return disbursement.save();
  }

  async cancel(id: string, userId?: string, reason?: string, companyId?: string) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    if (disbursement.status === DisbursementStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed disbursements cannot be cancelled',
      );
    }

    const now = new Date();
    const previousStatus = disbursement.status;

    disbursement.status = DisbursementStatus.CANCELLED;
    disbursement.statusTimeline = {
      ...disbursement.statusTimeline,
      cancelled: now,
    };
    disbursement.actionHistory.push({
      action: DisbursementActionType.CANCEL,
      performedBy: userId as any,
      performedAt: now,
      reason,
      metadata: {
        previousStatus,
        newStatus: DisbursementStatus.CANCELLED,
      },
    } as any);

    return disbursement.save();
  }
}
