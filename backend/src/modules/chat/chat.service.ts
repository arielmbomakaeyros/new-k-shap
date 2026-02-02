import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from '../../database/schemas/chat-message.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>) {}

  async create(createChatDto: any) {
    const createdChatMessage = new this.chatMessageModel(createChatDto);
    return createdChatMessage.save();
  }

  async findAll() {
    return this.chatMessageModel.find();
  }

  async findOne(id: string) {
    return this.chatMessageModel.findById(id);
  }

  async update(id: string, updateChatDto: any) {
    return this.chatMessageModel.findByIdAndUpdate(id, updateChatDto, { new: true });
  }

  async remove(id: string) {
    return this.chatMessageModel.findByIdAndDelete(id);
  }
}
