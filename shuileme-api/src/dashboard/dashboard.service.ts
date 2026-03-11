import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CheckinsService } from '../checkins/checkins.service';
import { SleepRecordsService } from '../sleep-records/sleep-records.service';
import { AchievementsService } from '../achievements/achievements.service';
import { CacheService } from '../common/cache/cache.service';

/**
 * 聚合仪表板服务
 * 将多个 API 请求合并为一个，减少网络往返
 * 优化目标：首页数据加载 < 150ms
 */
@Injectable()
export class DashboardService {
  private readonly CACHE_TTL = 180; // 3 分钟

  constructor(
    private usersService: UsersService,
    private checkinsService: CheckinsService,
    private sleepRecordsService: SleepRecordsService,
    private achievementsService: AchievementsService,
    private cacheService: CacheService,
  ) {}

  /**
   * 获取完整仪表板数据
   * 并行查询所有数据，减少总响应时间
   */
  async getDashboard(userId: string) {
    const cacheKey = `dashboard:${userId}`;
    
    // 使用 getOrSet 防止缓存穿透
    return this.cacheService.getOrSet(cacheKey, async () => {
      // 并行查询所有数据
      const [user, checkinStats, sleepScore, achievements] = await Promise.all([
        this.getUserInfo(userId),
        this.getCheckinStats(userId),
        this.getSleepScore(userId),
        this.getAchievements(userId),
      ]);

      return {
        success: true,
        data: {
          user,
          checkinStats,
          sleepScore,
          achievements,
          updatedAt: new Date().toISOString(),
        },
      };
    }, this.CACHE_TTL);
  }

  /**
   * 获取用户信息（精简版）
   */
  private async getUserInfo(userId: string) {
    const user = await this.usersService.findOne(userId);
    
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      totalCheckinDays: user.totalCheckinDays,
      continuousCheckinDays: user.continuousCheckinDays,
      createdAt: user.createdAt,
    };
  }

  /**
   * 获取打卡统计
   */
  private async getCheckinStats(userId: string) {
    const { start, end } = this.getDateRange(7); // 最近 7 天
    
    const stats = await this.checkinsService.getStats(userId, start, end);
    const continuousDays = await this.checkinsService.getContinuousDays(userId);

    return {
      ...stats,
      continuousDays,
      period: '7days',
    };
  }

  /**
   * 获取睡眠评分
   */
  private async getSleepScore(userId: string) {
    const today = new Date();
    const score = await this.sleepRecordsService.getScore(userId, today);
    
    return {
      score: score || 0,
      date: today.toISOString().split('T')[0],
      level: this.getScoreLevel(score || 0),
    };
  }

  /**
   * 获取成就徽章
   */
  private async getAchievements(userId: string) {
    const achievements = await this.achievementsService.findAll(userId);
    
    return {
      total: achievements.length,
      latest: achievements.slice(0, 5).map(a => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        unlockedAt: a.unlockedAt,
      })),
    };
  }

  /**
   * 获取日期范围
   */
  private getDateRange(days: number): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
  }

  /**
   * 根据分数返回等级
   */
  private getScoreLevel(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'very_poor';
  }

  /**
   * 清除用户仪表板缓存
   */
  async clearCache(userId: string): Promise<void> {
    await this.cacheService.del(`dashboard:${userId}`);
  }

  /**
   * 获取简化版仪表板（用于推送通知）
   */
  async getMiniDashboard(userId: string) {
    const cacheKey = `dashboard:mini:${userId}`;
    
    return this.cacheService.getOrSet(cacheKey, async () => {
      const [checkinStats, sleepScore] = await Promise.all([
        this.getCheckinStats(userId),
        this.getSleepScore(userId),
      ]);

      return {
        success: true,
        data: {
          continuousDays: checkinStats.continuousDays,
          checkinRate: checkinStats.rate,
          sleepScore: sleepScore.score,
          sleepLevel: sleepScore.level,
        },
      };
    }, 300);
  }
}
