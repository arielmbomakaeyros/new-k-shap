// ==================== src/modules/notifications/notifications.gateway.ts ====================

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '@/database/schemas/notification.schema';
import { User } from '@/database/schemas/user.schema';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private activeConnections: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // ==================== CONNECTION HANDLING ====================

  async handleConnection(client: Socket) {
    try {
      // Verify JWT token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn('Client connection rejected: No token provided');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findById(payload.sub);

      if (!user || user.isDeleted || !user.isActive) {
        this.logger.warn(`Connection rejected for user: ${payload.sub}`);
        client.disconnect();
        return;
      }

      // Store user info in socket
      client.data.user = user;
      
      // Store active connection
      this.activeConnections.set(user._id.toString(), client.id);

      // Join rooms
      client.join(`user-${user._id}`); // Personal notifications
      client.join(`company-${user.company}`); // Company-wide notifications
      
      // Join department rooms if user has departments
      if (user.departments && user.departments.length > 0) {
        user.departments.forEach(dept => {
          client.join(`department-${dept}`);
        });
      }

      this.logger.log(`User ${user.email} connected: ${client.id}`);

      // Send unread notification count
      const unreadCount = await this.notificationModel.countDocuments({
        user: user._id,
        isRead: false,
        isArchived: false,
      });

      client.emit('unread-count', { count: unreadCount });

    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.activeConnections.delete(user._id.toString());
      this.logger.log(`User ${user.email} disconnected`);
    }
  }

  // ==================== NOTIFICATION EVENTS ====================

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      const user = client.data.user;
      const notification = await this.notificationModel.findOne({
        _id: data.notificationId,
        user: user._id,
      });

      if (notification) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        // Emit updated unread count
        const unreadCount = await this.notificationModel.countDocuments({
          user: user._id,
          isRead: false,
          isArchived: false,
        });

        client.emit('unread-count', { count: unreadCount });
        client.emit('notification-updated', { notificationId: data.notificationId, isRead: true });
      }
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
    }
  }

  @SubscribeMessage('mark-all-as-read')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    try {
      const user = client.data.user;
      await this.notificationModel.updateMany(
        { user: user._id, isRead: false },
        { isRead: true, readAt: new Date() },
      );

      client.emit('unread-count', { count: 0 });
      client.emit('all-notifications-read');
    } catch (error) {
      this.logger.error('Error marking all notifications as read:', error);
    }
  }

  @SubscribeMessage('get-notifications')
  async handleGetNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { page: number; limit: number },
  ) {
    try {
      const user = client.data.user;
      const { page = 1, limit = 20 } = data;

      const notifications = await this.notificationModel
        .find({ user: user._id, isArchived: false })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      client.emit('notifications-list', { notifications, page, limit });
    } catch (error) {
      this.logger.error('Error fetching notifications:', error);
    }
  }

  // ==================== SEND NOTIFICATION (CALLED BY SERVICES) ====================

  async sendToUser(userId: string, notification: any) {
    try {
      // Save to database
      const savedNotification = await this.notificationModel.create({
        ...notification,
        user: userId,
      });

      // Send via Socket.IO if user is connected
      this.server.to(`user-${userId}`).emit('new-notification', savedNotification);

      this.logger.log(`Notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error('Error sending notification to user:', error);
    }
  }

  async sendToCompany(companyId: string, notification: any, excludeUserId?: string) {
    try {
      // Find all active users in company
      const users = await this.userModel.find({
        company: companyId,
        isActive: true,
        isDeleted: false,
      });

      // Save notifications for all users
      const notifications = await Promise.all(
        users
          .filter(user => !excludeUserId || user._id.toString() !== excludeUserId)
          .map(user =>
            this.notificationModel.create({
              ...notification,
              user: user._id,
              company: companyId,
            }),
          ),
      );

      // Send via Socket.IO to company room
      this.server.to(`company-${companyId}`).emit('new-notification', notification);

      this.logger.log(`Notification sent to company ${companyId}`);
    } catch (error) {
      this.logger.error('Error sending notification to company:', error);
    }
  }

  async sendToRole(companyId: string, role: string, notification: any) {
    try {
      const users = await this.userModel.find({
        company: companyId,
        systemRoles: role,
        isActive: true,
        isDeleted: false,
      });

      await Promise.all(
        users.map(user => this.sendToUser(user._id.toString(), notification)),
      );

      this.logger.log(`Notification sent to role ${role} in company ${companyId}`);
    } catch (error) {
      this.logger.error('Error sending notification to role:', error);
    }
  }

  isUserOnline(userId: string): boolean {
    return this.activeConnections.has(userId);
  }
}

// ==================== src/modules/notifications/notifications.service.ts ====================

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '@/database/schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // ==================== CREATE NOTIFICATION ====================

  async create(data: {
    user: string;
    company: string;
    type: string;
    title: string;
    message: string;
    resourceType?: string;
    resourceId?: string;
    actionUrl?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: any;
  }) {
    // Create notification in database
    const notification = await this.notificationModel.create(data);

    // Send via Socket.IO
    await this.notificationsGateway.sendToUser(data.user, notification);

    return notification;
  }

  // ==================== DISBURSEMENT NOTIFICATIONS ====================

  async notifyDisbursementCreated(disbursement: any, deptHeads: string[]) {
    await Promise.all(
      deptHeads.map(userId =>
        this.create({
          user: userId,
          company: disbursement.company,
          type: 'disbursement_pending_validation',
          title: 'New Disbursement Pending Validation',
          message: `Disbursement ${disbursement.referenceNumber} requires your validation`,
          resourceType: 'disbursement',
          resourceId: disbursement._id,
          actionUrl: `/disbursements/${disbursement._id}`,
          priority: disbursement.isUrgent ? 'urgent' : 'medium',
          metadata: {
            amount: disbursement.amount,
            currency: disbursement.currency,
          },
        }),
      ),
    );
  }

  async notifyDisbursementValidated(disbursement: any, validators: string[]) {
    await Promise.all(
      validators.map(userId =>
        this.create({
          user: userId,
          company: disbursement.company,
          type: 'disbursement_pending_approval',
          title: 'Disbursement Pending Approval',
          message: `Disbursement ${disbursement.referenceNumber} requires your approval`,
          resourceType: 'disbursement',
          resourceId: disbursement._id,
          actionUrl: `/disbursements/${disbursement._id}`,
          priority: disbursement.isUrgent ? 'urgent' : 'medium',
        }),
      ),
    );
  }

  async notifyDisbursementApproved(disbursement: any, cashiers: string[]) {
    await Promise.all(
      cashiers.map(userId =>
        this.create({
          user: userId,
          company: disbursement.company,
          type: 'disbursement_pending_execution',
          title: 'Disbursement Pending Execution',
          message: `Disbursement ${disbursement.referenceNumber} is ready for execution`,
          resourceType: 'disbursement',
          resourceId: disbursement._id,
          actionUrl: `/disbursements/${disbursement._id}`,
          priority: disbursement.isUrgent ? 'urgent' : 'high',
        }),
      ),
    );
  }

  async notifyDisbursementCompleted(disbursement: any, involvedUsers: string[]) {
    await Promise.all(
      involvedUsers.map(userId =>
        this.create({
          user: userId,
          company: disbursement.company,
          type: 'disbursement_completed',
          title: 'Disbursement Completed',
          message: `Disbursement ${disbursement.referenceNumber} has been completed`,
          resourceType: 'disbursement',
          resourceId: disbursement._id,
          actionUrl: `/disbursements/${disbursement._id}`,
          priority: 'low',
        }),
      ),
    );
  }

  async notifyDisbursementRejected(disbursement: any, creatorId: string, reason: string) {
    await this.create({
      user: creatorId,
      company: disbursement.company,
      type: 'disbursement_rejected',
      title: 'Disbursement Rejected',
      message: `Your disbursement ${disbursement.referenceNumber} was rejected: ${reason}`,
      resourceType: 'disbursement',
      resourceId: disbursement._id,
      actionUrl: `/disbursements/${disbursement._id}`,
      priority: 'high',
    });
  }

  // ==================== REMINDER NOTIFICATIONS ====================

  async sendReminder(data: {
    user: string;
    company: string;
    title: string;
    message: string;
    resourceType: string;
    resourceId: string;
    actionUrl: string;
  }) {
    await this.create({
      ...data,
      type: 'reminder',
      priority: 'high',
    });
  }
}

// ==================== src/modules/chat/chat.gateway.ts ====================

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from '@/database/schemas/chat-message.schema';
import { User } from '@/database/schemas/user.schema';
import { AuditLogService } from '@/modules/audit-logs/audit-logs.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private typingUsers: Map<string, Set<string>> = new Map(); // roomId -> Set of userId

  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private auditLogService: AuditLogService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findById(payload.sub);

      if (!user || user.isDeleted || !user.isActive) {
        client.disconnect();
        return;
      }

      client.data.user = user;
      this.logger.log(`Chat user ${user.email} connected`);
    } catch (error) {
      this.logger.error('Chat connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`Chat user ${user.email} disconnected`);
    }
  }

  // ==================== CHAT EVENTS ====================

  @SubscribeMessage('join-disbursement-chat')
  async handleJoinDisbursementChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { disbursementId: string },
  ) {
    client.join(`disbursement-${data.disbursementId}`);
    this.logger.log(`User joined disbursement chat: ${data.disbursementId}`);
  }

  @SubscribeMessage('leave-disbursement-chat')
  async handleLeaveDisbursementChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { disbursementId: string },
  ) {
    client.leave(`disbursement-${data.disbursementId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      disbursement?: string;
      recipient?: string;
      message: string;
      chatType: string;
    },
  ) {
    try {
      const user = client.data.user;

      // Save message to database
      const chatMessage = await this.chatMessageModel.create({
        company: user.company,
        disbursement: data.disbursement,
        chatType: data.chatType,
        sender: user._id,
        recipient: data.recipient,
        message: data.message,
      });

      // Populate sender info
      await chatMessage.populate('sender', 'firstName lastName avatar');

      // Determine room to emit to
      let room: string;
      if (data.disbursement) {
        room = `disbursement-${data.disbursement}`;
      } else if (data.recipient) {
        room = `user-${data.recipient}`;
      }

      // Emit to room
      if (room) {
        this.server.to(room).emit('new-message', chatMessage);
      }

      // Log chat action (WITHOUT message content)
      await this.auditLogService.log({
        user: user._id,
        company: user.company,
        action: 'CHAT_MESSAGE_SENT',
        actionDescription: 'User sent a chat message',
        resourceType: 'chat',
        resourceId: chatMessage._id,
        metadata: {
          chatType: data.chatType,
          disbursement: data.disbursement,
          recipient: data.recipient,
          // NOTE: NO message content in audit log
        },
        severity: 'info',
        isChatAction: true,
        chatRecipient: data.recipient,
      });

      client.emit('message-sent', { messageId: chatMessage._id });
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('message-error', { error: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; isTyping: boolean },
  ) {
    const user = client.data.user;
    const userId = user._id.toString();

    if (!this.typingUsers.has(data.room)) {
      this.typingUsers.set(data.room, new Set());
    }

    const typingSet = this.typingUsers.get(data.room);

    if (data.isTyping) {
      typingSet.add(userId);
    } else {
      typingSet.delete(userId);
    }

    // Broadcast to room
    client.to(data.room).emit('user-typing', {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('get-messages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { disbursementId: string; page: number; limit: number },
  ) {
    try {
      const { disbursementId, page = 1, limit = 50 } = data;

      const messages = await this.chatMessageModel
        .find({ disbursement: disbursementId })
        .populate('sender', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      client.emit('messages-history', { messages: messages.reverse(), page, limit });
    } catch (error) {
      this.logger.error('Error fetching messages:', error);
    }
  }

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const user = client.data.user;
      const message = await this.chatMessageModel.findById(data.messageId);

      if (message && !message.readBy.includes(user._id)) {
        message.readBy.push(user._id);
        message.readAt[user._id.toString()] = new Date();
        await message.save();

        // Notify sender
        this.server.to(`user-${message.sender}`).emit('message-read', {
          messageId: data.messageId,
          readBy: user._id,
        });
      }
    } catch (error) {
      this.logger.error('Error marking message as read:', error);
    }
  }
}