import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('bet_history')
@Index('UQ_bet_history_tx_user_round_sperm', [
  'tx_hash',
  'user_address',
  'round_id',
  'sperm_id',
], { unique: true })
export class BetHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 44 })
  user_address: string;

  @Column({ type: 'bigint' })
  round_id: string;

  @Column({ type: 'smallint' })
  sperm_id: number;

  /** Amount in lamports */
  @Column({ type: 'bigint' })
  amount: string;

  @Column({ type: 'varchar', length: 88 })
  tx_hash: string;

  /** Slot when the tx was confirmed (for ordering and dedup) */
  @Column({ type: 'bigint', nullable: true })
  slot: string | null;

  /** Block time from chain (Unix timestamp seconds), if available */
  @Column({ type: 'timestamptz', nullable: true })
  timestamp: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
