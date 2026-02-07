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

  async findAll(companyId?: string | null, params?: any, userId?: string | null) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      recipientId,
      type,
      isRead,
    } = params || {};

    const filter: Record<string, any> = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };

    const targetUserId = recipientId || userId;
    if (targetUserId) {
      filter.user = new Types.ObjectId(targetUserId);
    }

    if (type) {
      filter.type = type;
    }

    if (isRead !== undefined) {
      if (isRead === 'true' || isRead === true) filter.isRead = true;
      if (isRead === 'false' || isRead === false) filter.isRead = false;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { title: regex },
        { message: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find(filter as any)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      this.notificationModel.countDocuments(filter as any),
    ]);

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
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

  async markAllAsRead(userId: string, companyId?: string | null, ids?: string[]) {
    const filter: Record<string, any> = {
      user: new Types.ObjectId(userId),
      isDeleted: false,
    };
    if (companyId) {
      filter.company = new Types.ObjectId(companyId);
    }
    if (ids?.length) {
      filter._id = { $in: ids.map((id) => new Types.ObjectId(id)) };
    }

    await this.notificationModel.updateMany(
      filter as any,
      { $set: { isRead: true, readAt: new Date() } },
    );
    return { success: true };
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
