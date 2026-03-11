import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { PushService } from '../push/push.service';

@Injectable()
export class PushSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(PushSchedulerService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private pushService: PushService,
  ) {}

  onModuleInit() {
    this.logger.log('Push scheduler service initialized');
  }

  /**
   * 每晚 22:30 发送睡前提醒
   * 向所有活跃用户发送睡前提醒
   */
  @Cron(CronExpression.EVERY_DAY_AT_10_30PM)
  async handleBedtimeReminder() {
    this.logger.log('Sending bedtime reminders...');

    try {
      // 获取所有活跃用户
      const users = await this.userRepository.find({
        where: { isActive: true },
        select: ['id', 'nickname'],
      });

      this.logger.log(`Sending bedtime reminders to ${users.length} users`);

      for (const user of users) {
        try {
          await this.pushService.sendBedtimeReminder(user.id);
        } catch (error) {
          this.logger.error(`Failed to send bedtime reminder to user ${user.id}`, error);
        }
      }

      this.logger.log('Bedtime reminders sent successfully');
    } catch (error) {
      this.logger.error('Failed to send bedtime reminders', error);
    }
  }

  /**
   * 每天早上 07:30 发送起床提醒
   * 向所有活跃用户发送起床提醒
   */
  @Cron(CronExpression.EVERY_DAY_AT_7_30AM)
  async handleWakeupReminder() {
    this.logger.log('Sending wakeup reminders...');

    try {
      // 获取所有活跃用户
      const users = await this.userRepository.find({
        where: { isActive: true },
        select: ['id', 'nickname'],
      });

      this.logger.log(`Sending wakeup reminders to ${users.length} users`);

      for (const user of users) {
        try {
          await this.pushService.sendWakeupReminder(user.id);
        } catch (error) {
          this.logger.error(`Failed to send wakeup reminder to user ${user.id}`, error);
        }
      }

      this.logger.log('Wakeup reminders sent successfully');
    } catch (error) {
      this.logger.error('Failed to send wakeup reminders', error);
    }
  }
}
