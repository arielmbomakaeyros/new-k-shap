import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { redisStore } from 'cache-manager-redis-yet';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const useRedis = configService.get('USE_REDIS_CACHE', 'true') === 'true';

        if (useRedis) {
          try {
            // Attempt to connect to Redis
            return {
              store: await redisStore({
                socket: {
                  host: configService.get('REDIS_HOST', 'localhost'),
                  port: parseInt(configService.get('REDIS_PORT', '6379'), 10),
                },
                password: configService.get('REDIS_PASSWORD'),
                ttl: parseInt(configService.get('REDIS_TTL', '3600'), 10),
              }),
            };
          } catch (error) {
            console.warn('Failed to connect to Redis, falling back to memory cache:', error.message);
            // Fall back to memory cache
          }
        }

        // Return memory cache as fallback
        return {
          ttl: parseInt(configService.get('CACHE_TTL', '3600'), 10),
          max: parseInt(configService.get('CACHE_MAX_ITEMS', '1000'), 10),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
