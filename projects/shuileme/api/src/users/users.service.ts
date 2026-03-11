import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CacheService } from '../common/cache/cache.service';

/**
 * 优化后的用户服务
 * 添加 Redis 缓存支持，减少数据库查询
 */
@Injectable()
export class UsersService {
  private readonly CACHE_TTL = 300; // 5 分钟

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cacheService: CacheService,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Check if phone already exists
    if (userData.phone) {
      const existingUser = await this.findByPhone(userData.phone);
      if (existingUser) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Check if wechatId already exists
    if (userData.wechatId) {
      const existingUser = await this.findByWechatId(userData.wechatId);
      if (existingUser) {
        throw new ConflictException('WeChat account already registered');
      }
    }

    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);

    // 清除相关缓存
    await this.cacheService.delPattern('user:*');

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    const cacheKey = 'users:all';
    const cached = await this.cacheService.get<User[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const users = await this.usersRepository.find({
      select: ['id', 'phone', 'nickname', 'avatar', 'wechatId', 'totalCheckinDays', 'continuousCheckinDays', 'createdAt'],
    });
    
    await this.cacheService.set(cacheKey, users, 60); // 1 分钟缓存
    return users;
  }

  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    const cached = await this.cacheService.get<User>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const user = await this.usersRepository.findOne({ 
      where: { id },
      select: [
        'id', 'phone', 'nickname', 'avatar', 'wechatId',
        'totalCheckinDays', 'continuousCheckinDays', 'isActive',
        'lastCheckinDate', 'createdAt', 'updatedAt'
      ],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.cacheService.set(cacheKey, user, this.CACHE_TTL);
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const cacheKey = `user:phone:${phone}`;
    const cached = await this.cacheService.get<User>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const user = await this.usersRepository.findOne({ 
      where: { phone },
      select: [
        'id', 'phone', 'nickname', 'avatar', 'wechatId',
        'totalCheckinDays', 'continuousCheckinDays', 'isActive',
        'createdAt'
      ],
    });
    
    if (user) {
      await this.cacheService.set(cacheKey, user, this.CACHE_TTL);
    }
    
    return user;
  }

  async findByWechatId(wechatId: string): Promise<User | null> {
    const cacheKey = `user:wechat:${wechatId}`;
    const cached = await this.cacheService.get<User>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const user = await this.usersRepository.findOne({ 
      where: { wechatId },
      select: [
        'id', 'phone', 'nickname', 'avatar', 'wechatId',
        'totalCheckinDays', 'continuousCheckinDays', 'isActive',
        'createdAt'
      ],
    });
    
    if (user) {
      await this.cacheService.set(cacheKey, user, this.CACHE_TTL);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUser = await this.findByPhone(updateUserDto.phone);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Phone number already exists');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    // 清除相关缓存
    await this.cacheService.del(`user:${id}`);
    await this.cacheService.del(`user:phone:${user.phone}`);
    if (user.wechatId) {
      await this.cacheService.del(`user:wechat:${user.wechatId}`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);

    // 清除相关缓存
    await this.cacheService.del(`user:${id}`);
    await this.cacheService.del(`user:phone:${user.phone}`);
    if (user.wechatId) {
      await this.cacheService.del(`user:wechat:${user.wechatId}`);
    }
  }

  async updateCheckinStats(
    userId: string,
    totalDays: number,
    continuousDays: number,
  ): Promise<User> {
    await this.usersRepository.update(userId, {
      totalCheckinDays: totalDays,
      continuousCheckinDays: continuousDays,
      lastCheckinDate: new Date(),
    });

    // 清除用户缓存，下次读取时会更新
    await this.cacheService.del(`user:${userId}`);

    return this.findOne(userId);
  }

  /**
   * 批量获取用户信息（优化 N+1 查询）
   */
  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }

    const users = await this.usersRepository.findByIds(ids, {
      select: [
        'id', 'phone', 'nickname', 'avatar', 'wechatId',
        'totalCheckinDays', 'continuousCheckinDays', 'isActive',
        'createdAt'
      ],
    });

    return users;
  }

  /**
   * 获取用户总数
   */
  async getTotalCount(): Promise<number> {
    const cacheKey = 'users:total:count';
    const cached = await this.cacheService.get<number>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const count = await this.usersRepository.count();
    await this.cacheService.set(cacheKey, count, 60);
    return count;
  }

  /**
   * 获取活跃用户数
   */
  async getActiveCount(): Promise<number> {
    const cacheKey = 'users:active:count';
    const cached = await this.cacheService.get<number>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const count = await this.usersRepository.count({ where: { isActive: true } });
    await this.cacheService.set(cacheKey, count, 60);
    return count;
  }

  /**
   * 获取指定时间之后的新用户数
   */
  async getNewUsersCount(since: Date): Promise<number> {
    const cacheKey = `users:new:count:${since.toISOString()}`;
    const cached = await this.cacheService.get<number>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const count = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :since', { since })
      .getCount();
    
    await this.cacheService.set(cacheKey, count, 60);
    return count;
  }

  /**
   * 获取查询构建器（用于管理员筛选）
   */
  getQueryBuilder() {
    return this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.nickname',
        'user.phone',
        'user.avatar',
        'user.isActive',
        'user.totalCheckinDays',
        'user.continuousCheckinDays',
        'user.createdAt',
      ]);
  }

  /**
   * 更新用户状态
   */
  async updateStatus(userId: string, isActive: boolean): Promise<void> {
    await this.usersRepository.update(userId, { isActive });
    await this.cacheService.del(`user:${userId}`);
  }
}
