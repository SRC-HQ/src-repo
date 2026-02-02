import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('round_history')
@Index('UQ_round_history_round_id', ['round_id'], { unique: true })
export class RoundHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true })
  round_id: string;

  /** Winner sperm id (0–9), set when round is resolved */
  @Column({ type: 'smallint', nullable: true })
  winning_sperm_id: number | null;

  /** Total pot in lamports, updated as bets are placed */
  @Column({ type: 'bigint', default: 0 })
  total_pot: string;

  /** Count of unique addresses that bet in this round */
  @Column({ type: 'int', default: 0 })
  total_address: number;

  @Column({ type: 'boolean', default: false })
  is_babyking_hit: boolean;

  /** Hashed seed from StartRoundEvent (e.g. hex string) */
  @Column({ type: 'varchar', length: 64 })
  hashed_seed: string;

  @Column({ type: 'varchar', length: 88 })
  tx_hash: string;

  /** Block time from chain (Unix timestamp seconds), if available */
  @Column({ type: 'timestamptz', nullable: true })
  timestamp: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
