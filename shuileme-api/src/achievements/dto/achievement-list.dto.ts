import { ApiProperty } from '@nestjs/swagger';
import { AchievementType, AchievementLevel } from '../achievement.entity';

export class AchievementListDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ enum: AchievementType })
  type: AchievementType;

  @ApiProperty({ enum: AchievementLevel })
  level: AchievementLevel;

  @ApiProperty({ example: '早睡达人' })
  name: string;

  @ApiProperty({ example: '连续 7 天在 23:00 前入睡', required: false })
  description?: string;

  @ApiProperty({ example: 5 })
  progress: number;

  @ApiProperty({ example: 10 })
  target: number;

  @ApiProperty({ example: 50 })
  progressPercent: number;

  @ApiProperty({ example: false })
  isUnlocked: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  unlockedAt?: Date;

  @ApiProperty({ example: 0 })
  sort: number;
}

export class AchievementListResponseDto {
  @ApiProperty({ type: [AchievementListDto] })
  achievements: AchievementListDto[];

  @ApiProperty({ example: 8 })
  total: number;

  @ApiProperty({ example: 3 })
  unlockedCount: number;
}
