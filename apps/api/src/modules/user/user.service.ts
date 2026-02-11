import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Ensure a user profile exists for the given address.
   * If it already exists, returns the existing row; otherwise creates a new one.
   */
  async ensureUser(address: string): Promise<User> {
    const normalized = address.trim();
    let user = await this.userRepo.findOne({ where: { user_address: normalized } });
    if (!user) {
      user = this.userRepo.create({
        user_address: normalized,
        username: null,
        image: null,
        x_id: null,
        x_username: null,
      });
      user = await this.userRepo.save(user);
    }
    return user;
  }

  /**
   * Fetch a user profile by wallet address.
   */
  async getByAddress(address: string): Promise<User | null> {
    const normalized = address.trim();
    return this.userRepo.findOne({ where: { user_address: normalized } });
  }
}

