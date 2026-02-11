import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ServerOptions } from 'socket.io';

/**
 * Custom Socket.io adapter backed by Redis Pub/Sub.
 *
 * This ensures that events emitted on one NestJS instance (emit, join, leave)
 * are propagated to every other instance connected to the same Redis.
 * Required for horizontal scaling behind a load balancer.
 *
 * The adapter uses its own dedicated pair of Redis connections, separate from
 * the application-level RedisService, to avoid interfering with the
 * subscriber-mode restriction.
 */
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor!: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplication,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const url = this.configService.get<string>('REDIS_URL');

    let pubClient: Redis;
    if (url) {
      pubClient = new Redis(url);
    } else {
      pubClient = new Redis({ host, port, password: password || undefined });
    }
    const subClient = pubClient.duplicate();

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        if (pubClient.status === 'ready') return resolve();
        pubClient.once('ready', resolve);
        pubClient.once('error', reject);
      }),
      new Promise<void>((resolve, reject) => {
        if (subClient.status === 'ready') return resolve();
        subClient.once('ready', resolve);
        subClient.once('error', reject);
      }),
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      transports: ['websocket'],
    });
    server.adapter(this.adapterConstructor);
    return server;
  }
}
