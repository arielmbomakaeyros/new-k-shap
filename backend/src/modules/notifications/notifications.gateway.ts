import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SOCKET_EVENTS } from '../../common/constants';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('Initialized');
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
      client.join(`user:${payload.sub}`);
      if (payload.company) {
        client.join(`company:${payload.company}`);
      }

      this.logger.log(`Client connected: ${client.id} (user ${payload.sub})`);
    } catch (error) {
      this.logger.warn(`Socket ${client.id} auth failed`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitToUser(userId: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, payload);
  }
}
