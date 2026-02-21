import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(@Body() dto: CreateChatDto) {
    return this.chatService.create({
      message: dto.message,
      address: dto.address,
      signature: dto.signature,
      timestamp: dto.timestamp,
    });
  }

  @Get()
  async list(
    @Query('skip') skipParam?: string,
    @Query('limit') limitParam?: string,
  ) {
    const skip = Math.max(0, parseInt(skipParam ?? '0', 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(limitParam ?? '100', 10) || 100));
    const chats = await this.chatService.findAll(skip, limit);
    return { data: chats };
  }
}
