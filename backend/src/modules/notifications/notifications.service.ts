import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../database/schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

  async create(createNotificationDto: any) {
    const createdNotification = new this.notificationModel(createNotificationDto);
    return createdNotification.save();
  }

  async findAll() {
    return this.notificationModel.find();
  }

  async findOne(id: string) {
    return this.notificationModel.findById(id);
  }

  async update(id: string, updateNotificationDto: any) {
    return this.notificationModel.findByIdAndUpdate(id, updateNotificationDto, { new: true });
  }

  async remove(id: string) {
    return this.notificationModel.findByIdAndDelete(id);
  }
}
