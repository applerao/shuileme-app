import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum AchievementType {
  EARLY_BIRD = 'early_bird', // 早睡达人
  CONTINUOUS_CHECKIN = 'continuous_checkin', // 连续打卡
  SLEEP_IMPROVEMENT = 'sleep_improvement', // 睡眠改善
  GOAL_ACHIEVEMENT = 'goal_achievement', // 目标达成
  INSTANT_SLEEP = 'instant_sleep', // 秒睡王者
  DEEP_SLEEP_MASTER = 'deep_sleep_master', // 深睡大师
  REGULAR_SCHEDULE = 'regular_schedule', // 规律作息
  BEST_SUPERVISION = 'best_supervision', // 最佳监督
}

export enum AchievementLevel {
  BRONZE = 'bronze', // 青铜
  SILVER = 'silver', // 白银
  GOLD = 'gold', // 黄金
  PLATINUM = 'platinum', // 铂金
}

@Entity('achievements')
@Unique(['userId', 'type', 'level'])
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: AchievementType,
  })
  type: AchievementType;

  @Column({
    type: 'enum',
    enum: AchievementLevel,
    default: AchievementLevel.BRONZE,
  })
  level: AchievementLevel;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'int' })
  target: number;

  @Column({ default: false })
  isUnlocked: boolean;

  @Column({ nullable: true })
  unlockedAt: Date;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('user_achievements')
@Unique(['userId', 'achievementId'])
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  achievementId: string;

  @Column({ default: false })
  isUnlocked: boolean;

  @Column({ nullable: true })
  unlockedAt: Date;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'int' })
  target: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
