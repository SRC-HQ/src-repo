import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index('UQ_users_user_address', ['user_address'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  user_address: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  /** External X/Twitter ID (for future integration). */
  @Column({ type: 'varchar', length: 64, nullable: true })
  x_id: string | null;

  /** X/Twitter username/handle. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  x_username: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}

