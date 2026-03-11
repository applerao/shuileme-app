import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { PushSchedulerService } from './push.scheduler.service';
import { PushToken } from './entities/push-token.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushToken]),
    UsersModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PushController],
  providers: [PushService, PushSchedulerService],
  exports: [PushService],
})
export class PushModule {}
