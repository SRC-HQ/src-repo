import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('distribution_history')
@Index('UQ_distribution_history_round_user_sperm', [
  'round_id',
  'user_address',
  'winning_sperm_id',
], { unique: true })
export class DistributionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  round_id: string;

  @Column({ type: 'smallint' })
  winning_sperm_id: number;

  @Column({ type: 'varchar', length: 44 })
  user_address: string;

  /** User's total bet on the winning sperm for this round (lamports). */
  @Column({ type: 'bigint' })
  bet_amount: string;

  /** Payout amount (lamports) — matches claim_winnings: net_winnings + jackpot_share. */
  @Column({ type: 'bigint' })
  winning_amount: string;

  /** Transaction hash when user claimed; null if not yet claimed. */
  @Column({ type: 'varchar', length: 88, nullable: true })
  claim_tx_hash: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
