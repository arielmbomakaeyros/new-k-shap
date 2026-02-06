import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../../database/schemas/notification.schema';
import { Company } from '../../database/schemas/company.schema';
import { User } from '../../database/schemas/user.schema';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
import { NotificationsGateway } from './notifications.gateway';
import { EmailService } from '../../email/email.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly emailService: EmailService,
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

      // Send email notification if enabled
      this.sendEmailNotification(
        savedNotification.user.toString(),
        companyId,
        createNotificationDto,
      ).catch((err) => {
        this.logger.warn(`Email notification failed: ${err.message}`);
      });
    }
    return savedNotification;
  }

  private async sendEmailNotification(
    userId: string,
    companyId: string | null | undefined,
    dto: CreateNotificationDto,
  ) {
    // Check company email channel
    if (companyId) {
      const company = await this.companyModel.findById(companyId).lean();
      if (!company?.notificationChannels?.email) return;
    }

    // Check user preferences
    const user = await this.userModel.findById(userId).lean();
    if (!user || !user.notificationPreferences?.email) return;

    await this.emailService.send({
      to: user.email,
      subject: dto.title,
      template: 'notification',
      context: {
        title: dto.title,
        content: dto.content,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      },
    });
  }

  async findAll(companyId?: string | null) {
    const filter = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.notificationModel.find(filter as any);
  }

  async countUnread(userId: string, companyId?: string | null) {
    const filter: Record<string, any> = {
      user: new Types.ObjectId(userId),
      isRead: false,
      isDeleted: false,
    };

    if (companyId) {
      filter.company = new Types.ObjectId(companyId);
    }

    return this.notificationModel.countDocuments(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.notificationModel.findOne(filter as any);
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.notificationModel.findOneAndUpdate(
      filter as any,
      this.mapUpdatePayload(updateNotificationDto),
      { new: true },
    );
  }

  async remove(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.notificationModel.findOneAndDelete(filter as any);
  }
}
