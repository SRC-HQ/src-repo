import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Called after a user connects their wallet in the frontend.
   * Creates a new profile if it does not exist yet; otherwise returns the existing one.
   *
   * Body: { address: string }
   */
  @Post()
  async createOrGetUser(@Body('address') address: string) {
    const user = await this.userService.ensureUser(address);
    return user;
  }

  /**
   * Fetch a user profile by wallet address.
   */
  @Get(':address')
  async getUser(@Param('address') address: string) {
    const user = await this.userService.getByAddress(address);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

