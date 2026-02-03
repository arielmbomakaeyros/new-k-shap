import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
  beneficiary?: string;
}

@Injectable()
export class DisbursementsService {
  constructor(
    @InjectModel(Disbursement.name)
    private disbursementModel: Model<Disbursement>,
  ) {}

  async create(
    createDisbursementDto: any,
    userId?: string,
    companyId?: string,
  ) {
    const disbursementData = {
      ...createDisbursementDto,
      createdBy: userId,
      company: companyId,
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
      beneficiary,
    } = options || {};

    const query: any = {};

    if (companyId) {
      query.company = companyId;
    }

    if (search) {
      query.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (department) {
      query.department = department;
    }

    if (beneficiary) {
      query.beneficiary = beneficiary;
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.disbursementModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('beneficiary')
        .populate('department')
        .populate('office')
        .populate('disbursementType')
        .exec(),
      this.disbursementModel.countDocuments(query),
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

  async findOne(id: string) {
    const disbursement = await this.disbursementModel
      .findById(id)
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

  async update(id: string, updateDisbursementDto: any, userId?: string) {
    const updateData = {
      ...updateDisbursementDto,
      updatedBy: userId,
    };

    const disbursement = await this.disbursementModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    return disbursement;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(id: string, userId?: string) {
    const disbursement = await this.disbursementModel.findByIdAndDelete(id);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    return { success: true, message: 'Disbursement deleted successfully' };
  }

  async submit(id: string, userId?: string) {
    const disbursement = await this.disbursementModel.findById(id);

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

  async approve(id: string, userId?: string, notes?: string) {
    const disbursement = await this.disbursementModel.findById(id);

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

  async reject(id: string, userId?: string, reason?: string) {
    const disbursement = await this.disbursementModel.findById(id);

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

  async cancel(id: string, userId?: string, reason?: string) {
    const disbursement = await this.disbursementModel.findById(id);

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
