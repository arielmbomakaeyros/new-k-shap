import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collection } from '../../database/schemas/collection.schema';

@Injectable()
export class CollectionsService {
  constructor(@InjectModel(Collection.name) private collectionModel: Model<Collection>) {}

  async create(createCollectionDto: any) {
    const createdCollection = new this.collectionModel(createCollectionDto);
    return createdCollection.save();
  }

  async findAll() {
    return this.collectionModel.find();
  }

  async findOne(id: string) {
    return this.collectionModel.findById(id);
  }

  async update(id: string, updateCollectionDto: any) {
    return this.collectionModel.findByIdAndUpdate(id, updateCollectionDto, { new: true });
  }

  async remove(id: string) {
    return this.collectionModel.findByIdAndDelete(id);
  }
}
