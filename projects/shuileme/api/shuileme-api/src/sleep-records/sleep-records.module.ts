import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepRecord } from './sleep-record.entity';
import { SleepRecordsService } from './sleep-records.service';
import { SleepRecordsController } from './sleep-records.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SleepRecord])],
  controllers: [SleepRecordsController],
  providers: [SleepRecordsService],
  exports: [SleepRecordsService],
})
export class SleepRecordsModule {}
