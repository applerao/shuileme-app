import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { SleepRecord } from '../sleep-records/sleep-record.entity';
import { Checkin } from '../checkins/checkin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SleepRecord, Checkin])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
