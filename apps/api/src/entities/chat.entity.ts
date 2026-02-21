import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('chats')
@Index('IX_chats_created_at', ['created_at'])
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 44 })
  user_address: string;

  @Column({ type: 'varchar', length: 500 })
  message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
