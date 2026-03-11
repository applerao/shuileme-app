import { ApiProperty } from '@nestjs/swagger';
import { AchievementType } from '../achievement.entity';

export class AchievementResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'uuid-string' })
  userId: string;

  @ApiProperty({ enum: ['checkin_streak', 'total_checkins', 'early_bird', 'night_owl', 'quality_sleep', 'supervision'] })
  type: AchievementType;

  @ApiProperty({ example: '连续打卡 7 天' })
  name: string;

  @ApiProperty({ example: '连续打卡达到 7 天', required: false })
  description?: string;

  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({ example: false })
  isUnlocked: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  unlockedAt?: Date;

  @ApiProperty({ example: 5 })
  progress: number;

  @ApiProperty({ example: 7 })
  target: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
