import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../../database/schemas/notification.schema';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private mapCreatePayload(createNotificationDto: CreateNotificationDto, companyId?: string | null) {
    const userId = createNotificationDto.recipientId;

    return {
      company: companyId ? new Types.ObjectId(companyId) : undefined,
      user: userId ? new Types.ObjectId(userId) : undefined,
      type: createNotificationDto.type,
      title: createNotificationDto.title,
      message: createNotificationDto.content,
      metadata: createNotificationDto.metadata ?? {},
    };
  }

  private mapUpdatePayload(updateNotificationDto: UpdateNotificationDto) {
    const payload: Record<string, any> = {};

    if (updateNotificationDto.title !== undefined) {
      payload.title = updateNotificationDto.title;
    }
    if (updateNotificationDto.content !== undefined) {
      payload.message = updateNotificationDto.content;
    }
    if (updateNotificationDto.type !== undefined) {
      payload.type = updateNotificationDto.type;
    }
    if (updateNotificationDto.metadata !== undefined) {
      payload.metadata = updateNotificationDto.metadata;
    }
    if (updateNotificationDto.isRead !== undefined) {
      payload.isRead = updateNotificationDto.isRead;
      payload.readAt = updateNotificationDto.isRead ? new Date() : null;
    }
    if (updateNotificationDto.recipientId !== undefined) {
      payload.user = new Types.ObjectId(updateNotificationDto.recipientId);
    }

    return payload;
  }

  async create(createNotificationDto: CreateNotificationDto, companyId?: string | null) {
    const createdNotification = new this.notificationModel(
      this.mapCreatePayload(createNotificationDto, companyId),
    );
    const savedNotification = await createdNotification.save();
    if (savedNotification.user) {
      this.notificationsGateway.emitToUser(
        savedNotification.user.toString(),
        savedNotification.toObject(),
      );
    }
    return savedNotification;
  }

  async findAll(companyId?: string | null) {
    const filter = companyId ? { company: new Types.ObjectId(companyId) } : {};
    return this.notificationModel.find(filter as any);
  }

  async countUnread(userId: string, companyId?: string | null) {
    const filter: Record<string, any> = {
      user: new Types.ObjectId(userId),
      isRead: false,
    };

    if (companyId) {
      filter.company = new Types.ObjectId(companyId);
    }

    return this.notificationModel.countDocuments(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.notificationModel.findOne(filter as any);
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.notificationModel.findOneAndUpdate(
      filter as any,
      this.mapUpdatePayload(updateNotificationDto),
      { new: true },
    );
  }

  async remove(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.notificationModel.findOneAndDelete(filter as any);
  }
}
