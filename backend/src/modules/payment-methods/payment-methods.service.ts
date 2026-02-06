import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentMethod } from '../../database/schemas/payment-method.schema';
import type { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto';

const DEFAULT_PAYMENT_METHODS = [
  { name: 'Cash', code: 'cash' },
  { name: 'Bank Transfer', code: 'bank_transfer' },
  { name: 'Mobile Money', code: 'mobile_money' },
  { name: 'Check', code: 'check' },
  { name: 'Card', code: 'card' },
  { name: 'Orange Money', code: 'orange_money' },
  { name: 'MTN Money', code: 'mtn_money' },
];

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectModel(PaymentMethod.name) private paymentMethodModel: Model<PaymentMethod>,
  ) {}

  async create(companyId: string, dto: CreatePaymentMethodDto) {
    const created = new this.paymentMethodModel({
      ...dto,
      company: new Types.ObjectId(companyId),
    });
    return created.save();
  }

  async findAll(companyId?: string | null) {
    const filter = companyId ? { company: new Types.ObjectId(companyId), isDeleted: false } : { isDeleted: false };
    return this.paymentMethodModel.find(filter as any).sort({ name: 1 });
  }

  async update(id: string, companyId: string, dto: UpdatePaymentMethodDto) {
    const filter = { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId), isDeleted: false };
    const updated = await this.paymentMethodModel.findOneAndUpdate(filter as any, dto, { new: true });
    if (!updated) throw new NotFoundException('Payment method not found');
    return updated;
  }

  async remove(id: string, companyId: string) {
    const filter = { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId), isDeleted: false };
    const removed = await this.paymentMethodModel.findOneAndDelete(filter as any);
    if (!removed) throw new NotFoundException('Payment method not found');
    return { success: true };
  }

  async createDefaultCompanyPaymentMethods(companyId: string) {
    const existing = await this.paymentMethodModel
      .find({
        company: new Types.ObjectId(companyId),
        isDeleted: false,
        code: { $in: DEFAULT_PAYMENT_METHODS.map((m) => m.code) },
      } as any)
      .select('code')
      .lean();
    const existingCodes = new Set(existing.map((m: any) => m.code));
    const toInsert = DEFAULT_PAYMENT_METHODS.filter((m) => !existingCodes.has(m.code)).map((m) => ({
      ...m,
      company: new Types.ObjectId(companyId),
      isActive: true,
    }));
    if (toInsert.length > 0) {
      await this.paymentMethodModel.insertMany(toInsert);
    }
    return { success: true, created: toInsert.length };
  }
}
