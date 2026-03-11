import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UsersModule } from '../users/users.module';
import { CheckinsModule } from '../checkins/checkins.module';
import { SleepRecordsModule } from '../sleep-records/sleep-records.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { CacheModule } from '../common/cache/cache.module';

@Module({
  imports: [
    UsersModule,
    CheckinsModule,
    SleepRecordsModule,
    AchievementsModule,
    CacheModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
