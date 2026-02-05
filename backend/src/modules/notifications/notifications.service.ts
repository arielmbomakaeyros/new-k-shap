import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../../database/schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

  async create(createNotificationDto: any, companyId?: string | null) {
    const createdNotification = new this.notificationModel({
      ...createNotificationDto,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    });
    return createdNotification.save();
  }

  async findAll(companyId?: string | null) {
    const filter = companyId ? { company: new Types.ObjectId(companyId) } : {};
    return this.notificationModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.notificationModel.findOne(filter as any);
  }

  async update(id: string, updateNotificationDto: any, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.notificationModel.findOneAndUpdate(filter as any, updateNotificationDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.notificationModel.findOneAndDelete(filter as any);
  }
}
