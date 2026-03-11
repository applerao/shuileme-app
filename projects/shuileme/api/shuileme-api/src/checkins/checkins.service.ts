import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, SelectQueryBuilder } from 'typeorm';
import { Checkin, CheckinStatus } from './checkin.entity';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UsersService } from '../users/users.service';
import { CacheService } from '../common/cache/cache.service';

/**
 * 优化后的打卡服务
 * - 使用 QueryBuilder 优化查询
 * - 添加 Redis 缓存
 * - 批量操作优化
 */
@Injectable()
export class CheckinsService {
  private readonly CACHE_TTL = 300; // 5 分钟
  private readonly STATS_CACHE_TTL = 600; // 10 分钟

  constructor(
    @InjectRepository(Checkin)
    private checkinsRepository: Repository<Checkin>,
    private usersService: UsersService,
    private cacheService: CacheService,
  ) {}

  async create(userId: string, createCheckinDto: CreateCheckinDto): Promise<Checkin> {
    const checkinDate = createCheckinDto.checkinDate || new Date();
    const dateStr = checkinDate.toISOString().split('T')[0];

    // 使用缓存防止重复打卡
    const duplicateKey = `checkin:duplicate:${userId}:${dateStr}`;
    const isDuplicate = await this.cacheService.get<boolean>(duplicateKey);
    
    if (isDuplicate) {
      throw new ConflictException('Already checked in today');
    }

    // Check if already checked in today - 使用优化的查询
    const existingCheckin = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .select('checkin.id')
      .where('checkin.userId = :userId', { userId })
      .andWhere('DATE(checkin.checkinDate) = :date', { date: dateStr })
      .getOne();

    if (existingCheckin) {
      await this.cacheService.set(duplicateKey, true, 3600); // 缓存 1 小时
      throw new ConflictException('Already checked in today');
    }

    const checkin = this.checkinsRepository.create({
      ...createCheckinDto,
      user: { id: userId },
      userId,
      checkinDate,
      checkinTime: new Date().toTimeString().split(' ')[0],
      status: CheckinStatus.COMPLETED,
    });

    const savedCheckin = await this.checkinsRepository.save(checkin);

    // 清除统计缓存
    await this.cacheService.delPattern(`checkin:stats:${userId}:*`);
    await this.cacheService.del(`checkin:user:${userId}`);

    // 异步更新用户统计（不阻塞响应）
    this.updateUserStats(userId).catch(console.error);

    return savedCheckin;
  }

  async findAll(userId: string, startDate?: Date, endDate?: Date): Promise<Checkin[]> {
    const cacheKey = `checkin:user:${userId}:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'all'}`;
    const cached = await this.cacheService.get<Checkin[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // 使用 QueryBuilder 优化查询
    const queryBuilder = this.checkinsRepository
      .createQueryBuilder('checkin')
      .select([
        'checkin.id',
        'checkin.checkinDate',
        'checkin.checkinTime',
        'checkin.status',
        'checkin.note',
        'checkin.sleepQuality',
        'checkin.createdAt',
      ])
      .where('checkin.userId = :userId', { userId });

    if (startDate && endDate) {
      queryBuilder.andWhere('checkin.checkinDate BETWEEN :start AND :end', {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      });
    }

    const checkins = await queryBuilder
      .orderBy('checkin.checkinDate', 'DESC')
      .getMany();

    await this.cacheService.set(cacheKey, checkins, this.CACHE_TTL);
    return checkins;
  }

  async findOne(id: string): Promise<Checkin> {
    const cacheKey = `checkin:${id}`;
    const cached = await this.cacheService.get<Checkin>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const checkin = await this.checkinsRepository.findOne({ 
      where: { id },
      select: ['id', 'checkinDate', 'checkinTime', 'status', 'note', 'sleepQuality', 'createdAt'],
    });
    
    if (!checkin) {
      throw new NotFoundException(`Checkin with ID ${id} not found`);
    }

    await this.cacheService.set(cacheKey, checkin, this.CACHE_TTL);
    return checkin;
  }

  async updateStatus(id: string, status: CheckinStatus): Promise<Checkin> {
    const checkin = await this.findOne(id);
    checkin.status = status;
    const updated = await this.checkinsRepository.save(checkin);

    // 清除缓存
    await this.cacheService.del(`checkin:${id}`);
    await this.cacheService.delPattern(`checkin:stats:${checkin.userId}:*`);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const checkin = await this.findOne(id);
    await this.checkinsRepository.remove(checkin);

    // 清除缓存
    await this.cacheService.del(`checkin:${id}`);
    await this.cacheService.delPattern(`checkin:stats:${checkin.userId}:*`);
  }

  async getStats(userId: string, startDate: Date, endDate: Date) {
    const cacheKey = `checkin:stats:${userId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // 使用聚合查询优化
    const result = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .select('COUNT(checkin.id)', 'total')
      .addSelect('SUM(CASE WHEN checkin.status = :completed THEN 1 ELSE 0 END)', 'completed')
      .addSelect('SUM(CASE WHEN checkin.status = :missed THEN 1 ELSE 0 END)', 'missed')
      .where('checkin.userId = :userId', { userId })
      .andWhere('checkin.checkinDate BETWEEN :start AND :end', {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      })
      .setParameter('completed', CheckinStatus.COMPLETED)
      .setParameter('missed', CheckinStatus.MISSED)
      .getRawOne();

    const total = parseInt(result.total, 10) || 0;
    const completed = parseInt(result.completed, 10) || 0;
    const missed = parseInt(result.missed, 10) || 0;

    const stats = {
      total,
      completed,
      missed,
      rate: total > 0 ? ((completed / total) * 100).toFixed(2) + '%' : '0%',
    };

    await this.cacheService.set(cacheKey, stats, this.STATS_CACHE_TTL);
    return stats;
  }

  /**
   * 批量获取打卡记录（优化 N+1 查询）
   */
  async findByUserIds(userIds: string[], limit = 10): Promise<Map<string, Checkin[]>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const checkins = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .select([
        'checkin.id',
        'checkin.checkinDate',
        'checkin.checkinTime',
        'checkin.status',
        'checkin.userId',
      ])
      .where('checkin.userId IN (:...userIds)', { userIds })
      .orderBy('checkin.checkinDate', 'DESC')
      .limit(limit * userIds.length)
      .getMany();

    const result = new Map<string, Checkin[]>();
    for (const userId of userIds) {
      result.set(
        userId,
        checkins.filter(c => c.userId === userId).slice(0, limit),
      );
    }

    return result;
  }

  private async updateUserStats(userId: string) {
    const allCheckins = await this.checkinsRepository.find({
      where: { user: { id: userId } },
      select: ['checkinDate', 'status'],
      order: { checkinDate: 'DESC' },
    });

    const completedCheckins = allCheckins.filter(
      (c) => c.status === CheckinStatus.COMPLETED,
    );

    let continuousDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < completedCheckins.length; i++) {
      const checkinDate = new Date(completedCheckins[i].checkinDate);
      checkinDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (checkinDate.getTime() === expectedDate.getTime()) {
        continuousDays++;
      } else {
        break;
      }
    }

    await this.usersService.updateCheckinStats(
      userId,
      completedCheckins.length,
      continuousDays,
    );
  }

  /**
   * 获取连续打卡天数（优化版）
   */
  async getContinuousDays(userId: string): Promise<number> {
    const cacheKey = `checkin:continuous:${userId}`;
    const cached = await this.cacheService.get<number>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const checkins = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .select('checkin.checkinDate')
      .where('checkin.userId = :userId', { userId })
      .andWhere('checkin.status = :status', { status: CheckinStatus.COMPLETED })
      .orderBy('checkin.checkinDate', 'DESC')
      .limit(365)
      .getMany();

    let continuousDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < checkins.length; i++) {
      const checkinDate = new Date(checkins[i].checkinDate);
      checkinDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (checkinDate.getTime() === expectedDate.getTime()) {
        continuousDays++;
      } else {
        break;
      }
    }

    await this.cacheService.set(cacheKey, continuousDays, 300);
    return continuousDays;
  }

  /**
   * 获取日期范围内的打卡数量
   */
  async getDateRangeCount(startDate: Date, endDate: Date): Promise<number> {
    const cacheKey = `checkin:count:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await this.cacheService.get<number>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const count = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .select('COUNT(checkin.id)', 'count')
      .where('checkin.checkinDate BETWEEN :start AND :end', {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      })
      .andWhere('checkin.status = :status', { status: CheckinStatus.COMPLETED })
      .getRawOne();

    const result = parseInt(count?.count, 10) || 0;
    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }

  /**
   * 获取每日打卡统计（最近 N 天）
   */
  async getDailyStats(days: number = 7) {
    const cacheKey = `checkin:daily:stats:${days}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .select('DATE(checkin.checkinDate)', 'date')
      .addSelect('COUNT(checkin.id)', 'count')
      .where('checkin.checkinDate >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
      .andWhere('checkin.status = :status', { status: CheckinStatus.COMPLETED })
      .groupBy('DATE(checkin.checkinDate)')
      .orderBy('DATE(checkin.checkinDate)', 'ASC')
      .getRawMany();

    const result = dailyStats.map((stat: any) => ({
      date: stat.date,
      count: parseInt(stat.count, 10),
    }));

    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }

  /**
   * 获取周打卡率
   */
  async getWeeklyCheckinRate() {
    const cacheKey = 'checkin:weekly:rate';
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalCheckins, totalUsers] = await Promise.all([
      this.getDateRangeCount(weekAgo, new Date()),
      this.usersService.getTotalCount(),
    ]);

    const rate = totalUsers > 0 ? ((totalCheckins / (totalUsers * 7)) * 100) : 0;
    const result = { rate: parseFloat(rate.toFixed(2)), totalCheckins, avgDaily: parseFloat((totalCheckins / 7).toFixed(2)) };
    
    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }

  /**
   * 获取月打卡率
   */
  async getMonthlyCheckinRate() {
    const cacheKey = 'checkin:monthly:rate';
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [totalCheckins, totalUsers] = await Promise.all([
      this.getDateRangeCount(monthAgo, new Date()),
      this.usersService.getTotalCount(),
    ]);

    const rate = totalUsers > 0 ? ((totalCheckins / (totalUsers * 30)) * 100) : 0;
    const result = { rate: parseFloat(rate.toFixed(2)), totalCheckins, avgDaily: parseFloat((totalCheckins / 30).toFixed(2)) };
    
    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }

  /**
   * 获取用户打卡历史
   */
  async getUserCheckins(userId: string, limit: number = 30) {
    const cacheKey = `checkin:user:${userId}:list:${limit}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const checkins = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .select(['checkin.checkinDate', 'checkin.status', 'checkin.note'])
      .where('checkin.userId = :userId', { userId })
      .orderBy('checkin.checkinDate', 'DESC')
      .limit(limit)
      .getMany();

    await this.cacheService.set(cacheKey, checkins, 60);
    return checkins;
  }
}
