import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collection } from '../../database/schemas/collection.schema';

@Injectable()
export class CollectionsService {
  constructor(@InjectModel(Collection.name) private collectionModel: Model<Collection>) {}

  async create(createCollectionDto: any, companyId?: string | null) {
    const createdCollection = new this.collectionModel({
      ...createCollectionDto,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    });
    return createdCollection.save();
  }

  async findAll(companyId?: string | null) {
    const filter = companyId ? { company: new Types.ObjectId(companyId) } : {};
    return this.collectionModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.collectionModel.findOne(filter as any);
  }

  async update(id: string, updateCollectionDto: any, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.collectionModel.findOneAndUpdate(filter as any, updateCollectionDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.collectionModel.findOneAndDelete(filter as any);
  }
}
