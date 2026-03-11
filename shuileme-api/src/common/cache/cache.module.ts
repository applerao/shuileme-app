import { Module, Global, DynamicModule } from '@nestjs/common';
import { CacheService } from './cache.service';
import { Redis } from 'ioredis';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {
  static forRoot(config?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  }): DynamicModule {
    const redisProvider = {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisConfig = {
          host: config?.host || process.env.REDIS_HOST || 'localhost',
          port: config?.port || parseInt(process.env.REDIS_PORT, 10) || 6379,
          password: config?.password || process.env.REDIS_PASSWORD || undefined,
          db: config?.db || parseInt(process.env.REDIS_DB, 10) || 0,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        };

        return new Redis(redisConfig);
      },
    };

    return {
      module: CacheModule,
      providers: [redisProvider, CacheService],
      exports: [redisProvider, CacheService],
    };
  }
}
