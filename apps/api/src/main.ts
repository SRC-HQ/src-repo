import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './modules/redis/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const dbUrl = configService.get<string>('DB_URL');
  if (!dbUrl?.trim()) {
    console.error('Fatal: DB_URL is required. Set DB_URL in your .env (e.g. postgresql://user:password@localhost:5432/spermrace)');
    process.exit(1);
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // Redis-backed Socket.io adapter for horizontal scaling
  const redisIoAdapter = new RedisIoAdapter(app, configService);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const port = configService.get<number>('API_PORT', 4000);
  const host = configService.get<string>('API_HOST', '0.0.0.0');

  await app.listen(port, host);
  console.log(`🚀 Sperm Race API running on http://${host}:${port}`);
}

bootstrap();
