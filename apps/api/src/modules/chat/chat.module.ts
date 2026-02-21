import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '@/entities/chat.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat]), UserModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
