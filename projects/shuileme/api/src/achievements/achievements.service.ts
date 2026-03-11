import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement, AchievementType } from './achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementsRepository: Repository<Achievement>,
  ) {}

  async findAll(userId: string): Promise<Achievement[]> {
    return this.achievementsRepository.find({
      where: { user: { id: userId } },
      order: { type: 'ASC', level: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Achievement> {
    return this.achievementsRepository.findOne({ where: { id } });
  }

  async getUnlocked(userId: string): Promise<Achievement[]> {
    return this.achievementsRepository.find({
      where: { user: { id: userId }, isUnlocked: true },
    });
  }

  async checkAndUnlockAchievements(
    userId: string,
    stats: {
      continuousCheckinDays?: number;
      totalCheckinDays?: number;
      avgSleepQuality?: number;
    },
  ): Promise<Achievement[]> {
    const unlocked: Achievement[] = [];

    // Check continuous checkin achievements
    if (stats.continuousCheckinDays) {
      const streakTargets = [3, 7, 14, 30, 100];
      for (const target of streakTargets) {
        if (stats.continuousCheckinDays >= target) {
          await this.tryUnlockAchievement(userId, {
            type: AchievementType.CHECKIN_STREAK,
            name: `连续打卡${target}天`,
            description: `连续打卡达到${target}天`,
            level: target,
            target,
          });
        }
      }
    }

    // Check total checkin achievements
    if (stats.totalCheckinDays) {
      const totalTargets = [7, 30, 100, 365];
      for (const target of totalTargets) {
        if (stats.totalCheckinDays >= target) {
          await this.tryUnlockAchievement(userId, {
            type: AchievementType.TOTAL_CHECKINS,
            name: `累计打卡${target}天`,
            description: `累计打卡达到${target}天`,
            level: target,
            target,
          });
        }
      }
    }

    // Check sleep quality achievements
    if (stats.avgSleepQuality && stats.avgSleepQuality >= 8) {
      await this.tryUnlockAchievement(userId, {
        type: AchievementType.QUALITY_SLEEP,
        name: '优质睡眠',
        description: '平均睡眠质量达到 8 分以上',
        level: 1,
        target: 8,
      });
    }

    return unlocked;
  }

  private async tryUnlockAchievement(
    userId: string,
    achievementData: {
      type: AchievementType;
      name: string;
      description: string;
      level: number;
      target: number;
    },
  ): Promise<Achievement | null> {
    let achievement = await this.achievementsRepository.findOne({
      where: {
        user: { id: userId },
        type: achievementData.type,
        level: achievementData.level,
      },
    });

    if (!achievement) {
      achievement = this.achievementsRepository.create({
        user: { id: userId },
        userId,
        ...achievementData,
        progress: achievementData.target,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      await this.achievementsRepository.save(achievement);
      return achievement;
    }

    if (!achievement.isUnlocked) {
      achievement.progress = achievementData.target;
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date();
      await this.achievementsRepository.save(achievement);
      return achievement;
    }

    return null;
  }
}
