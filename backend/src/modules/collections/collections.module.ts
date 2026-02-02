import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema } from '../../database/schemas/collection.schema';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Collection.name, schema: CollectionSchema }]),
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
