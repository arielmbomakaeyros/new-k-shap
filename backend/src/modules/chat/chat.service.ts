import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessage } from '../../database/schemas/chat-message.schema';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createChatDto: any, companyId?: string | null) {
    const createdChatMessage = new this.chatMessageModel({
      ...createChatDto,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    });
    return createdChatMessage.save();
  }

  async findAll(companyId?: string | null) {
    const filter = {
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.chatMessageModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.chatMessageModel.findOne(filter as any);
  }

  async update(id: string, updateChatDto: any, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.chatMessageModel.findOneAndUpdate(filter as any, updateChatDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = {
      _id: new Types.ObjectId(id),
      isDeleted: false,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    };
    return this.chatMessageModel.findOneAndDelete(filter as any);
  }

  async listParticipants(companyId?: string | null) {
    if (!companyId) return [];
    const filter = {
      company: new Types.ObjectId(companyId),
      isDeleted: false,
      isActive: true,
    } as unknown as Record<string, any>;
    return this.userModel
      .find(filter)
      .select('firstName lastName email avatar departments offices systemRoles')
      .lean();
  }
}
