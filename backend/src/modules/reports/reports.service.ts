import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Disbursement } from '../../database/schemas/disbursement.schema';
import { Collection } from '../../database/schemas/collection.schema';
import { User } from '../../database/schemas/user.schema';
import { DisbursementStatus } from '../../database/schemas/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Disbursement.name)
    private disbursementModel: Model<Disbursement>,
    @InjectModel(Collection.name)
    private collectionModel: Model<Collection>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createReportDto: any, _companyId?: string | null) {
    // Implement report creation logic
    return createReportDto;
  }

  async findAll(_companyId?: string | null) {
    // Implement report retrieval logic
    return [];
  }

  async findOne(id: string, _companyId?: string | null) {
    // Implement report retrieval logic
    return {};
  }

  async update(id: string, updateReportDto: any, _companyId?: string | null) {
    // Implement report update logic
    return updateReportDto;
  }

  async remove(id: string, _companyId?: string | null) {
    // Implement report removal logic
    return {};
  }

  private resolvePeriodRange(period?: string) {
    if (!period) return null;
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (period) {
      case 'today': {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'this_week': {
        const day = now.getDay() || 7;
        start.setDate(now.getDate() - day + 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'this_month': {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'this_year': {
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      default:
        return null;
    }
  }

  async getDashboardSummary(companyId?: string | null, period?: string) {
    const companyFilter = companyId
      ? { company: new Types.ObjectId(companyId) }
      : {};

    const range = this.resolvePeriodRange(period);
    const disbursementMatch: any = { isDeleted: false, ...companyFilter };
    const collectionMatch: any = { isDeleted: false, ...companyFilter };
    if (range) {
      disbursementMatch.createdAt = { $gte: range.start, $lte: range.end };
      collectionMatch.collectionDate = { $gte: range.start, $lte: range.end };
    }
    const userMatch: any = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };

    const [
      totalDisbursements,
      pendingApprovals,
      totalUsers,
      totalCollectionsAgg,
    ] = await Promise.all([
      this.disbursementModel.countDocuments(disbursementMatch),
      this.disbursementModel.countDocuments({
        ...disbursementMatch,
        status: {
          $in: [
            DisbursementStatus.PENDING_DEPT_HEAD,
            DisbursementStatus.PENDING_VALIDATOR,
            DisbursementStatus.PENDING_CASHIER,
          ],
        },
      }),
      this.userModel.countDocuments(userMatch),
      this.collectionModel.aggregate([
        { $match: collectionMatch },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalCollectionsAmount =
      totalCollectionsAgg?.[0]?.total || 0;

    return {
      totalDisbursements,
      totalCollectionsAmount,
      pendingApprovals,
      totalUsers,
    };
  }
}
