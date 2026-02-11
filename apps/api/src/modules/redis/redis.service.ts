import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

/**
 * Manages three dedicated ioredis connections:
 *   - client:     general-purpose reads/writes (GET, SET, INCRBY, SADD, …)
 *   - publisher:  Pub/Sub PUBLISH only (never enters subscriber mode)
 *   - subscriber: Pub/Sub SUBSCRIBE only (enters subscriber mode on first subscribe)
 *
 * ioredis requires separate connections for Pub/Sub because a client in
 * subscriber mode cannot execute regular commands.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  private client!: Redis;
  private publisher!: Redis;
  private subscriber!: Redis;

  /** channel → handler[] dispatch map for the subscriber connection */
  private readonly channelHandlers = new Map<string, ((data: any) => void)[]>();

  constructor(private readonly configService: ConfigService) {}

  // ─── Lifecycle ───────────────────────────────────────────────────────

  async onModuleInit() {
    this.client = this.createClient('client');
    this.publisher = this.createClient('publisher');
    this.subscriber = this.createClient('subscriber');

    await Promise.all([
      this.waitForReady(this.client, 'client'),
      this.waitForReady(this.publisher, 'publisher'),
      this.waitForReady(this.subscriber, 'subscriber'),
    ]);

    // Central message dispatcher
    this.subscriber.on('message', (channel: string, message: string) => {
      const handlers = this.channelHandlers.get(channel);
      if (!handlers?.length) return;
      try {
        const data = JSON.parse(message);
        for (const handler of handlers) {
          handler(data);
        }
      } catch (err) {
        this.logger.error(
          `Failed to process message on channel "${channel}"`,
          err,
        );
      }
    });

    this.logger.log('✅ Redis connections established');
  }

  async onModuleDestroy() {
    await Promise.allSettled([
      this.client?.quit(),
      this.publisher?.quit(),
      this.subscriber?.quit(),
    ]);
    this.logger.log('Redis connections closed');
  }

  // ─── Public API ──────────────────────────────────────────────────────

  /** General-purpose Redis client (reads/writes) */
  getClient(): Redis {
    return this.client;
  }

  /** Publisher client — also usable for the Socket.io Redis adapter */
  getPublisher(): Redis {
    return this.publisher;
  }

  /** Subscriber client */
  getSubscriber(): Redis {
    return this.subscriber;
  }

  /** Publish a JSON payload to a Redis Pub/Sub channel */
  async publish(channel: string, data: Record<string, any>): Promise<void> {
    try {
      await this.publisher.publish(channel, JSON.stringify(data));
    } catch (err: any) {
      this.logger.error(`Failed to publish to "${channel}": ${err.message}`);
    }
  }

  /**
   * Subscribe to a Redis Pub/Sub channel.
   * Multiple handlers per channel are supported (additive).
   */
  async subscribe(
    channel: string,
    handler: (data: any) => void,
  ): Promise<void> {
    if (!this.channelHandlers.has(channel)) {
      this.channelHandlers.set(channel, []);
      await this.subscriber.subscribe(channel);
      this.logger.debug(`Subscribed to channel: ${channel}`);
    }
    this.channelHandlers.get(channel)!.push(handler);
  }

  /** Build Redis connection options from env (supports REDIS_URL or host/port/password) */
  getRedisOptions(): RedisOptions {
    const url = this.configService.get<string>('REDIS_URL');
    if (url) {
      try {
        const parsed = new URL(url);
        return {
          host: parsed.hostname || 'localhost',
          port: Number(parsed.port) || 6379,
          password: parsed.password || undefined,
        };
      } catch {
        this.logger.warn('Invalid REDIS_URL, falling back to host/port/password');
      }
    }

    return {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
    };
  }

  // ─── Internals ───────────────────────────────────────────────────────

  private createClient(name: string): Redis {
    const options = this.getRedisOptions();
    const client = new Redis({
      ...options,
      retryStrategy: (times: number) => Math.min(times * 200, 5000),
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });

    client.on('error', (err: Error) => {
      this.logger.error(`Redis ${name} error: ${err.message}`);
    });

    return client;
  }

  private waitForReady(client: Redis, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (client.status === 'ready') {
        resolve();
        return;
      }
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        client.removeListener('ready', onReady);
        client.removeListener('error', onError);
      };
      client.once('ready', onReady);
      client.once('error', onError);
    });
  }
}
