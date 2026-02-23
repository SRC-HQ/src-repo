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
@Index('IDX_bet_history_user_address', ['user_address'])
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

  /**
   * Transaction hash of RentClaimedEvent when user reclaimed the PDA rent.
   * Null means rent has not been reclaimed yet (eligible for "Bet Cashback").
   */
  @Column({ type: 'varchar', length: 88, nullable: true })
  rent_claim_tx_hash: string | null;

  /** Slot when the tx was confirmed (for ordering and dedup) */
  @Column({ type: 'bigint', nullable: true })
  slot: string | null;

  /** Block time from chain (Unix timestamp seconds), if available */
  @Column({ type: 'timestamptz', nullable: true })
  timestamp: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
