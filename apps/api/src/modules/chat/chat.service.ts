import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicKey } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import { Chat } from '@/entities/chat.entity';
import { UserService } from '../user/user.service';

const MESSAGE_PREFIX = 'sperm-race-chat';
const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    private readonly userService: UserService,
  ) {}

  /**
   * Verify that the signature was produced by the given address for the message.
   */
  verifySignature(address: string, message: string, timestamp: number, signatureBase64: string): boolean {
    const messageToSign = `${MESSAGE_PREFIX}\n${address}\n${message}\n${timestamp}`;
    const messageBytes = new TextEncoder().encode(messageToSign);

    const signature = Buffer.from(signatureBase64, 'base64');
    // Ed25519 signature is 64 bytes
    if (signature.length !== 64) {
      return false;
    }

    let publicKeyBytes: Uint8Array;
    try {
      const pubkey = new PublicKey(address);
      publicKeyBytes = pubkey.toBytes();
    } catch {
      return false;
    }

    return nacl.sign.detached.verify(messageBytes, signature, publicKeyBytes);
  }

  async create(dto: { message: string; address: string; signature: string; timestamp: number }) {
    const { message, address, signature, timestamp } = dto;

    // Replay protection: reject if timestamp is too old
    const now = Date.now();
    if (Math.abs(now - timestamp) > MAX_TIMESTAMP_AGE_MS) {
      throw new BadRequestException('Signature expired. Please try again.');
    }

    const normalizedAddress = address.trim();
    if (!this.verifySignature(normalizedAddress, message, timestamp, signature)) {
      throw new BadRequestException('Invalid signature. Address does not match signer.');
    }

    // Ensure user exists (creates with null values if not)
    await this.userService.ensureUser(normalizedAddress);

    const chat = this.chatRepo.create({
      user_address: normalizedAddress,
      message: message.trim().slice(0, 500),
    });
    return this.chatRepo.save(chat);
  }

  async findAll(skip = 0, limit = 100) {
    return this.chatRepo.find({
      order: { created_at: 'DESC' },
      skip,
      take: Math.min(limit, 100),
    });
  }
}
