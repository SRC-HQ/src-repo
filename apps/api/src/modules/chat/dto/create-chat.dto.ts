import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  /** Base64-encoded signature from wallet.signMessage */
  @IsString()
  @IsNotEmpty()
  signature: string;

  /** Timestamp (ms) used in the signed message - for replay prevention */
  @Type(() => Number)
  @IsNumber()
  timestamp: number;
}
