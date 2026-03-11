import { ApiProperty } from '@nestjs/swagger';
import { AchievementType, AchievementLevel } from '../achievement.entity';

export class CheckAchievementRequestDto {
  @ApiProperty({ required: false, description: '连续打卡天数' })
  continuousCheckinDays?: number;

  @ApiProperty({ required: false, description: '累计打卡天数' })
  totalCheckinDays?: number;

  @ApiProperty({ required: false, description: '平均睡眠质量 (1-10)' })
  avgSleepQuality?: number;

  @ApiProperty({ required: false, description: '平均入睡时长 (分钟)' })
  avgSleepOnsetMinutes?: number;

  @ApiProperty({ required: false, description: '平均深睡时长 (分钟)' })
  avgDeepSleepMinutes?: number;

  @ApiProperty({ required: false, description: '作息规律度 (0-100)' })
  scheduleRegularity?: number;

  @ApiProperty({ required: false, description: '监督次数' })
  supervisionCount?: number;

  @ApiProperty({ required: false, description: '睡眠改善度 (百分比)' })
  sleepImprovement?: number;

  @ApiProperty({ required: false, description: '目标达成率 (百分比)' })
  goalAchievementRate?: number;
}

export class UnlockedAchievementDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ enum: AchievementType })
  type: AchievementType;

  @ApiProperty({ enum: AchievementLevel })
  level: AchievementLevel;

  @ApiProperty({ example: '早睡达人' })
  name: string;

  @ApiProperty({ example: 'bronze' })
  levelName: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  unlockedAt: Date;
}

export class CheckAchievementResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [UnlockedAchievementDto] })
  newlyUnlocked: UnlockedAchievementDto[];

  @ApiProperty({ example: 1 })
  newlyUnlockedCount: number;

  @ApiProperty({ example: '恭喜解锁新徽章！' })
  message?: string;
}
