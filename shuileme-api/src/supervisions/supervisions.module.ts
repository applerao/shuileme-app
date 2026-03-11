import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supervision } from './supervision.entity';
import { SupervisionMessage } from './supervision-message.entity';
import { SupervisionsService } from './supervisions.service';
import { SupervisionsController } from './supervisions.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Supervision, SupervisionMessage]), UsersModule],
  controllers: [SupervisionsController],
  providers: [SupervisionsService],
  exports: [SupervisionsService],
})
export class SupervisionsModule {}
