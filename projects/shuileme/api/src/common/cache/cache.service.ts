import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Redis 缓存服务
 * 提供统一的缓存操作接口
 */
@Injectable()
export class CacheService {
  private readonly DEFAULT_TTL = 300; // 5 分钟
  private readonly PREFIX = 'shuileme:';

  constructor(@Inject('REDIS_CLIENT') private redisClient: Redis) {}

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(this.PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const fullKey = this.PREFIX + key;
      await this.redisClient.setex(fullKey, ttl || this.DEFAULT_TTL, serialized);
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(this.PREFIX + key);
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  /**
   * 批量删除匹配模式的缓存
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisClient.keys(this.PREFIX + pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } catch (error) {
      console.error(`Cache DEL pattern error for pattern ${pattern}:`, error);
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.redisClient.exists(this.PREFIX + key);
      return exists === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * 获取缓存或执行回调（缓存穿透保护）
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await callback();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * 自增计数器
   */
  async incr(key: string, ttl?: number): Promise<number> {
    const fullKey = this.PREFIX + key;
    const result = await this.redisClient.incr(fullKey);
    
    if (ttl && result === 1) {
      await this.redisClient.expire(fullKey, ttl);
    }
    
    return result;
  }

  /**
   * 获取并自增计数器
   */
  async getCounter(key: string): Promise<number> {
    const value = await this.redisClient.get(this.PREFIX + key);
    return value ? parseInt(value, 10) : 0;
  }
}
