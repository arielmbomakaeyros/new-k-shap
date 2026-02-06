import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { User } from '../../database/schemas/user.schema';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger(ChatGateway.name);

  // Track online users: userId → Set of socketIds
  private onlineUsers: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  afterInit() {
    this.logger.log('Chat Gateway initialized');
  }

  handleConnection(client: Socket) {
    const token =
      (client.handshake.auth as any)?.token ||
      client.handshake.headers?.authorization?.toString().replace('Bearer ', '');

    if (!token) {
      this.logger.warn(`Socket ${client.id} missing token`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }) as { sub: string; company?: string };

      client.data.userId = payload.sub;
      client.data.companyId = payload.company;

      // Join personal and company rooms
      client.join(`user:${payload.sub}`);
      if (payload.company) {
        client.join(`company:${payload.company}`);
      }

      // Track online status
      if (!this.onlineUsers.has(payload.sub)) {
        this.onlineUsers.set(payload.sub, new Set());
      }
      this.onlineUsers.get(payload.sub)!.add(client.id);

      // Notify company members this user is online
      if (payload.company) {
        this.server.to(`company:${payload.company}`).emit('chat:user_online', {
          userId: payload.sub,
          timestamp: new Date(),
        });
      }

      this.logger.log(`Client connected: ${client.id} (user ${payload.sub})`);
    } catch (error) {
      this.logger.warn(`Socket ${client.id} auth failed`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    const companyId = client.data?.companyId;

    if (userId) {
      const userSockets = this.onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.onlineUsers.delete(userId);
          // Notify company that user went offline
          if (companyId) {
            this.server.to(`company:${companyId}`).emit('chat:user_offline', {
              userId,
              timestamp: new Date(),
            });
          }
        }
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Validate that a target user belongs to the same company as the requesting user.
   */
  private async validateSameCompany(
    targetUserId: string,
    callerCompanyId: string | undefined,
  ): Promise<boolean> {
    if (!callerCompanyId) return false;

    const targetUser = await this.userModel
      .findOne({
        _id: new Types.ObjectId(targetUserId),
        company: new Types.ObjectId(callerCompanyId),
        isDeleted: false,
      } as any)
      .select('company')
      .lean();

    return !!targetUser;
  }

  /**
   * Build a company-scoped group room name to prevent cross-tenant access.
   */
  private buildGroupRoom(roomId: string, companyId: string | undefined): string | null {
    if (!companyId) return null;
    // Prefix with companyId to guarantee tenant isolation
    return `chat:room:${companyId}:${roomId}`;
  }

  @SubscribeMessage('chat:join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId?: string; targetUserId?: string },
  ) {
    const userId = client.data?.userId;
    const companyId = client.data?.companyId;
    if (!userId) return;

    let room: string | null = null;

    if (data.targetUserId) {
      // DM room: validate target is in same company
      const sameCompany = await this.validateSameCompany(data.targetUserId, companyId);
      if (!sameCompany) {
        this.logger.warn(
          `Blocked cross-company room join: user ${userId} → target ${data.targetUserId}`,
        );
        client.emit('chat:error', { message: 'Cannot join room: user not in your company' });
        return;
      }
      const sorted = [userId, data.targetUserId].sort();
      room = `chat:dm:${sorted[0]}_${sorted[1]}`;
    } else if (data.roomId) {
      // Group room: scope to company
      room = this.buildGroupRoom(data.roomId, companyId);
      if (!room) {
        client.emit('chat:error', { message: 'Cannot join room: no company context' });
        return;
      }
    }

    if (!room) return;

    client.join(room);
    this.logger.log(`User ${userId} joined room ${room}`);
  }

  @SubscribeMessage('chat:leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId?: string; targetUserId?: string },
  ) {
    const userId = client.data?.userId;
    const companyId = client.data?.companyId;
    if (!userId) return;

    let room: string | null = null;

    if (data.targetUserId) {
      const sorted = [userId, data.targetUserId].sort();
      room = `chat:dm:${sorted[0]}_${sorted[1]}`;
    } else if (data.roomId) {
      room = this.buildGroupRoom(data.roomId, companyId);
    }

    if (!room) return;

    client.leave(room);
    this.logger.log(`User ${userId} left room ${room}`);
  }

  @SubscribeMessage('chat:send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      message: string;
      recipientId?: string;
      chatType?: string;
      disbursementId?: string;
      roomId?: string;
      replyTo?: string;
      attachments?: string[];
    },
  ) {
    const userId = client.data?.userId;
    const companyId = client.data?.companyId;
    if (!userId) return;

    // Validate DM recipient belongs to same company
    if (data.recipientId) {
      const sameCompany = await this.validateSameCompany(data.recipientId, companyId);
      if (!sameCompany) {
        this.logger.warn(
          `Blocked cross-company message: user ${userId} → recipient ${data.recipientId}`,
        );
        client.emit('chat:error', { message: 'Cannot message users outside your company' });
        return;
      }
    }

    // Persist message via ChatService (company-scoped)
    const chatMessage = await this.chatService.create(
      {
        sender: userId,
        recipient: data.recipientId || null,
        message: data.message,
        chatType: data.chatType || 'general',
        disbursement: data.disbursementId || null,
        replyTo: data.replyTo || null,
        attachments: data.attachments || [],
      },
      companyId,
    );

    // Determine room to emit to
    let room: string;
    if (data.recipientId) {
      const sorted = [userId, data.recipientId].sort();
      room = `chat:dm:${sorted[0]}_${sorted[1]}`;
    } else if (data.roomId) {
      // Company-scoped group room
      const scopedRoom = this.buildGroupRoom(data.roomId, companyId);
      if (!scopedRoom) {
        client.emit('chat:error', { message: 'Cannot send: no company context' });
        return;
      }
      room = scopedRoom;
    } else {
      room = `company:${companyId}`;
    }

    this.server.to(room).emit('chat:new_message', chatMessage);

    // Also notify the recipient directly if it's a DM (already validated same company)
    if (data.recipientId) {
      this.server.to(`user:${data.recipientId}`).emit('chat:new_message', chatMessage);
    }
  }

  @SubscribeMessage('chat:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId?: string; targetUserId?: string; isTyping: boolean },
  ) {
    const userId = client.data?.userId;
    const companyId = client.data?.companyId;
    if (!userId) return;

    let room: string | null = null;

    if (data.targetUserId) {
      // Validate same company before sending typing indicator
      const sameCompany = await this.validateSameCompany(data.targetUserId, companyId);
      if (!sameCompany) return;

      const sorted = [userId, data.targetUserId].sort();
      room = `chat:dm:${sorted[0]}_${sorted[1]}`;
    } else if (data.roomId) {
      room = this.buildGroupRoom(data.roomId, companyId);
    }

    if (!room) return;

    client.to(room).emit('chat:typing', {
      userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('chat:read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageIds: string[] },
  ) {
    const userId = client.data?.userId;
    const companyId = client.data?.companyId;
    if (!userId || !data.messageIds?.length) return;

    // Mark messages as read (ChatService enforces company scoping)
    const processedIds: string[] = [];
    for (const messageId of data.messageIds) {
      const msg = await this.chatService.findOne(messageId, companyId);
      if (msg) {
        await this.chatService.update(
          messageId,
          {
            $addToSet: { readBy: userId },
            $set: { [`readAt.${userId}`]: new Date() },
          },
          companyId,
        );
        processedIds.push(messageId);
      }
    }

    // Emit read receipt only to the user's company, not to all sockets
    if (processedIds.length > 0 && companyId) {
      this.server.to(`company:${companyId}`).emit('chat:read_receipt', {
        messageIds: processedIds,
        readBy: userId,
        readAt: new Date(),
      });
    }
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }
}
