import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessage } from '../../database/schemas/chat-message.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>) {}

  async create(createChatDto: any, companyId?: string | null) {
    const createdChatMessage = new this.chatMessageModel({
      ...createChatDto,
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
    });
    return createdChatMessage.save();
  }

  async findAll(companyId?: string | null) {
    const filter = companyId ? { company: new Types.ObjectId(companyId) } : {};
    return this.chatMessageModel.find(filter as any);
  }

  async findOne(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.chatMessageModel.findOne(filter as any);
  }

  async update(id: string, updateChatDto: any, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.chatMessageModel.findOneAndUpdate(filter as any, updateChatDto, { new: true });
  }

  async remove(id: string, companyId?: string | null) {
    const filter = companyId
      ? { _id: new Types.ObjectId(id), company: new Types.ObjectId(companyId) }
      : { _id: new Types.ObjectId(id) };
    return this.chatMessageModel.findOneAndDelete(filter as any);
  }
}
