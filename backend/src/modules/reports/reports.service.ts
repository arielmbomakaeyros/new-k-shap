import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Disbursement } from '../../database/schemas/disbursement.schema';
import { Collection } from '../../database/schemas/collection.schema';
import { User } from '../../database/schemas/user.schema';
import { Department } from '../../database/schemas/department.schema';
import { Company } from '../../database/schemas/company.schema';
import { DisbursementStatus } from '../../database/schemas/enums';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Disbursement.name)
    private disbursementModel: Model<Disbursement>,
    @InjectModel(Collection.name)
    private collectionModel: Model<Collection>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Department.name)
    private departmentModel: Model<Department>,
    @InjectModel(Company.name)
    private companyModel: Model<Company>,
    private readonly currencyService: CurrencyService,
  ) {}

  private async getTargetCurrency(companyId?: string | null): Promise<string> {
    if (!companyId) return 'XAF';
    const company = await this.companyModel
      .findById(companyId)
      .select('defaultCurrency')
      .lean();
    return company?.defaultCurrency || 'XAF';
  }

  /**
   * Convert an array of { _id (currency), totalAmount, ... } buckets
   * into a single normalized total in the target currency.
   */
  private normalizeByCurrency(
    buckets: Array<{ _id: string; totalAmount: number; [key: string]: any }>,
    targetCurrency: string,
  ): number {
    return buckets.reduce((sum, b) => {
      const currency = b._id || 'XAF';
      return sum + this.currencyService.convert(b.totalAmount, currency, targetCurrency);
    }, 0);
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
      case 'last_month': {
        start.setMonth(now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(0); // Last day of previous month
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'last_year': {
        start.setFullYear(now.getFullYear() - 1, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(now.getFullYear() - 1, 11, 31);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      default:
        return null;
    }
  }

  private buildCompanyFilter(companyId?: string | null) {
    return companyId ? { company: new Types.ObjectId(companyId) } : {};
  }

  async getDashboardSummary(companyId?: string | null, period?: string) {
    const companyFilter = this.buildCompanyFilter(companyId);
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

    const targetCurrency = await this.getTargetCurrency(companyId);

    const [
      totalDisbursements,
      pendingApprovals,
      totalUsers,
      collectionsByCurrency,
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
        { $group: { _id: '$currency', totalAmount: { $sum: '$amount' } } },
      ]),
    ]);

    const totalCollectionsAmount = this.normalizeByCurrency(
      collectionsByCurrency,
      targetCurrency,
    );

    return {
      totalDisbursements,
      totalCollectionsAmount,
      pendingApprovals,
      totalUsers,
      currency: targetCurrency,
    };
  }

  async getDisbursementsSummary(
    companyId?: string | null,
    period?: string,
    filters?: { department?: string; status?: string },
  ) {
    const companyFilter = this.buildCompanyFilter(companyId);
    const range = this.resolvePeriodRange(period);
    const match: any = { isDeleted: false, ...companyFilter };

    if (range) {
      match.createdAt = { $gte: range.start, $lte: range.end };
    }
    if (filters?.department) {
      match.department = new Types.ObjectId(filters.department);
    }
    if (filters?.status) {
      match.status = filters.status;
    }

    const [byStatus, byDepartment, amountRanges, totals] = await Promise.all([
      // Group by status
      this.disbursementModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Group by department
      this.disbursementModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
        {
          $lookup: {
            from: 'departments',
            let: { deptId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$deptId'] },
                  ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
                },
              },
            ],
            as: 'dept',
          },
        },
        { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            departmentId: '$_id',
            departmentName: { $ifNull: ['$dept.name', 'Unknown'] },
            count: 1,
            totalAmount: 1,
          },
        },
        { $sort: { totalAmount: -1 } },
      ]),

      // Amount ranges
      this.disbursementModel.aggregate([
        { $match: match },
        {
          $bucket: {
            groupBy: '$amount',
            boundaries: [0, 100000, 500000, 1000000, 5000000, Infinity],
            default: 'Other',
            output: { count: { $sum: 1 }, totalAmount: { $sum: '$amount' } },
          },
        },
      ]),

      // Overall totals
      this.disbursementModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' },
            minAmount: { $min: '$amount' },
            maxAmount: { $max: '$amount' },
          },
        },
      ]),
    ]);

    return {
      totals: totals[0] || { count: 0, totalAmount: 0, avgAmount: 0, minAmount: 0, maxAmount: 0 },
      byStatus,
      byDepartment,
      amountRanges,
    };
  }

  async getCollectionsSummary(
    companyId?: string | null,
    period?: string,
    filters?: { department?: string; paymentType?: string },
  ) {
    const companyFilter = this.buildCompanyFilter(companyId);
    const range = this.resolvePeriodRange(period);
    const match: any = { isDeleted: false, ...companyFilter };

    if (range) {
      match.collectionDate = { $gte: range.start, $lte: range.end };
    }
    if (filters?.department) {
      match.department = new Types.ObjectId(filters.department);
    }
    if (filters?.paymentType) {
      match.paymentType = filters.paymentType;
    }

    const [byPaymentType, byFullyPaid, totals] = await Promise.all([
      // Group by payment type
      this.collectionModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$paymentType',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]),

      // Group by fully paid status
      this.collectionModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$isFullyPaid',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalRemaining: { $sum: { $ifNull: ['$remainingBalance', 0] } },
          },
        },
      ]),

      // Overall totals
      this.collectionModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' },
            totalRemaining: { $sum: { $ifNull: ['$remainingBalance', 0] } },
          },
        },
      ]),
    ]);

    return {
      totals: totals[0] || { count: 0, totalAmount: 0, avgAmount: 0, totalRemaining: 0 },
      byPaymentType,
      byFullyPaid,
    };
  }

  async getFinancialOverview(companyId?: string | null, period?: string) {
    const companyFilter = this.buildCompanyFilter(companyId);
    const range = this.resolvePeriodRange(period);
    const disbMatch: any = { isDeleted: false, ...companyFilter };
    const collMatch: any = { isDeleted: false, ...companyFilter };

    if (range) {
      disbMatch.createdAt = { $gte: range.start, $lte: range.end };
      collMatch.collectionDate = { $gte: range.start, $lte: range.end };
    }

    const targetCurrency = await this.getTargetCurrency(companyId);

    const [disbursementByCurrency, collectionByCurrency, disbCount, collCount] =
      await Promise.all([
        // Group completed disbursements by currency
        this.disbursementModel.aggregate([
          { $match: { ...disbMatch, status: DisbursementStatus.COMPLETED } },
          {
            $group: {
              _id: '$currency',
              totalAmount: { $sum: '$amount' },
            },
          },
        ]),
        // Group collections by currency
        this.collectionModel.aggregate([
          { $match: collMatch },
          {
            $group: {
              _id: '$currency',
              totalAmount: { $sum: '$amount' },
            },
          },
        ]),
        this.disbursementModel.countDocuments({
          ...disbMatch,
          status: DisbursementStatus.COMPLETED,
        }),
        this.collectionModel.countDocuments(collMatch),
      ]);

    const totalDisbursed = this.normalizeByCurrency(
      disbursementByCurrency,
      targetCurrency,
    );
    const totalCollected = this.normalizeByCurrency(
      collectionByCurrency,
      targetCurrency,
    );

    return {
      totalDisbursed,
      totalCollected,
      netCashFlow: totalCollected - totalDisbursed,
      disbursementCount: disbCount,
      collectionCount: collCount,
      currency: targetCurrency,
    };
  }

  async getDepartmentPerformance(companyId?: string | null, period?: string) {
    const companyFilter = this.buildCompanyFilter(companyId);
    const range = this.resolvePeriodRange(period);
    const match: any = { isDeleted: false, ...companyFilter };

    if (range) {
      match.createdAt = { $gte: range.start, $lte: range.end };
    }

    const results = await this.disbursementModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$department',
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', DisbursementStatus.COMPLETED] }, 1, 0] },
          },
          completedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', DisbursementStatus.COMPLETED] }, '$amount', 0],
            },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', DisbursementStatus.REJECTED] }, 1, 0] },
          },
          pendingCount: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [
                      DisbursementStatus.PENDING_DEPT_HEAD,
                      DisbursementStatus.PENDING_VALIDATOR,
                      DisbursementStatus.PENDING_CASHIER,
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'departments',
          let: { deptId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$deptId'] },
                ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
              },
            },
          ],
          as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          departmentId: '$_id',
          departmentName: { $ifNull: ['$dept.name', 'Unknown'] },
          totalCount: 1,
          totalAmount: 1,
          avgAmount: 1,
          completedCount: 1,
          completedAmount: 1,
          rejectedCount: 1,
          pendingCount: 1,
          completionRate: {
            $cond: [
              { $eq: ['$totalCount', 0] },
              0,
              { $multiply: [{ $divide: ['$completedCount', '$totalCount'] }, 100] },
            ],
          },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    return results;
  }

  async getPendingApprovals(companyId?: string | null) {
    const companyFilter = this.buildCompanyFilter(companyId);

    const results = await this.disbursementModel.aggregate([
      {
        $match: {
          isDeleted: false,
          ...companyFilter,
          status: {
            $in: [
              DisbursementStatus.PENDING_DEPT_HEAD,
              DisbursementStatus.PENDING_VALIDATOR,
              DisbursementStatus.PENDING_CASHIER,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          oldestPending: { $min: '$updatedAt' },
        },
      },
    ]);

    const byStage: Record<string, any> = {};
    let totalPending = 0;
    let totalPendingAmount = 0;

    for (const r of results) {
      byStage[r._id] = {
        count: r.count,
        totalAmount: r.totalAmount,
        oldestPending: r.oldestPending,
      };
      totalPending += r.count;
      totalPendingAmount += r.totalAmount;
    }

    return { totalPending, totalPendingAmount, byStage };
  }

  async getMonthlyTrends(companyId?: string | null, period?: string) {
    const companyFilter = this.buildCompanyFilter(companyId);
    const range = this.resolvePeriodRange(period);

    // Default to this_year if no period specified
    const defaultRange = range || {
      start: new Date(new Date().getFullYear(), 0, 1),
      end: new Date(),
    };

    const disbMatch: any = {
      isDeleted: false,
      ...companyFilter,
      createdAt: { $gte: defaultRange.start, $lte: defaultRange.end },
    };
    const collMatch: any = {
      isDeleted: false,
      ...companyFilter,
      collectionDate: { $gte: defaultRange.start, $lte: defaultRange.end },
    };

    const [disbursementTrends, collectionTrends] = await Promise.all([
      this.disbursementModel.aggregate([
        { $match: disbMatch },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            completedAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', DisbursementStatus.COMPLETED] }, '$amount', 0],
              },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      this.collectionModel.aggregate([
        { $match: collMatch },
        {
          $group: {
            _id: {
              year: { $year: '$collectionDate' },
              month: { $month: '$collectionDate' },
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    return {
      disbursements: disbursementTrends.map((d) => ({
        year: d._id.year,
        month: d._id.month,
        count: d.count,
        totalAmount: d.totalAmount,
        completedAmount: d.completedAmount,
      })),
      collections: collectionTrends.map((c) => ({
        year: c._id.year,
        month: c._id.month,
        count: c.count,
        totalAmount: c.totalAmount,
      })),
    };
  }
}
