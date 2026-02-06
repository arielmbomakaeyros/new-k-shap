import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collection } from '../../database/schemas/collection.schema';

@Injectable()
export class CollectionsService {
  constructor(@InjectModel(Collection.name) private collectionModel: Model<Collection>) {}

  private generateReferenceNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `COLL-${datePart}-${randomPart}`;
  }

  async create(createCollectionDto: any, companyId?: string | null, userId?: string | null) {
    const maxRetries = 5;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const referenceNumber = createCollectionDto.referenceNumber || this.generateReferenceNumber();
      const createdCollection = new this.collectionModel({
        ...createCollectionDto,
        referenceNumber,
        createdBy: userId ? new Types.ObjectId(userId) : undefined,
        ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      });
      try {
        return await createdCollection.save();
      } catch (err: any) {
        const isDuplicateRef =
          err?.code === 11000 &&
          err?.keyPattern?.referenceNumber &&
          !createCollectionDto.referenceNumber;
        if (!isDuplicateRef || attempt === maxRetries - 1) {
          throw err;
        }
      }
    }
    throw new Error('Failed to generate unique collection reference number');
  }

  async findAll(companyId?: string | null) {
    const filter = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.collectionModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.collectionModel.findOne(filter as any);
  }

  async update(id: string, updateCollectionDto: any, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.collectionModel.findOneAndUpdate(filter as any, updateCollectionDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.collectionModel.findOneAndDelete(filter as any);
  }
}
