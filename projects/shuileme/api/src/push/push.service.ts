import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import JPush, { PushPayload, Audience } from 'jpush-sdk';
import { PushToken, Platform } from './entities/push-token.entity';
import { renderTemplate } from './templates/push-templates';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private jpushClient: JPush;
  private isInitialized = false;

  constructor(
    @InjectRepository(PushToken)
    private pushTokenRepository: Repository<PushToken>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const appKey = this.configService.get<string>('JPUSH_APP_KEY');
    const masterSecret = this.configService.get<string>('JPUSH_MASTER_SECRET');

    if (!appKey || !masterSecret) {
      this.logger.warn('JPush configuration not found, push notifications disabled');
      return;
    }

    try {
      this.jpushClient = JPush.build({
        appKey,
        masterSecret,
      });
      this.isInitialized = true;
      this.logger.log('JPush client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize JPush client', error);
    }
  }

  /**
   * 注册设备 Token
   */
  async registerToken(
    userId: string,
    deviceToken: string,
    platform: Platform,
    deviceId?: string,
    appVersion?: string,
  ): Promise<PushToken> {
    // 检查是否已存在
    const existing = await this.pushTokenRepository.findOne({
      where: {
        userId,
        deviceToken,
        platform,
      },
    });

    if (existing) {
      existing.isActive = true;
      existing.lastActiveAt = new Date();
      if (deviceId) existing.deviceId = deviceId;
      if (appVersion) existing.appVersion = appVersion;
      return this.pushTokenRepository.save(existing);
    }

    const pushToken = this.pushTokenRepository.create({
      userId,
      deviceToken,
      platform,
      deviceId,
      appVersion,
      isActive: true,
      lastActiveAt: new Date(),
    });

    return this.pushTokenRepository.save(pushToken);
  }

  /**
   * 注销设备 Token
   */
  async unregisterToken(userId: string, deviceToken: string): Promise<void> {
    await this.pushTokenRepository.update(
      { userId, deviceToken },
      { isActive: false },
    );
  }

  /**
   * 获取用户的活跃设备 Token
   */
  async getUserTokens(userId: string): Promise<PushToken[]> {
    return this.pushTokenRepository.find({
      where: { userId, isActive: true },
      order: { lastActiveAt: 'DESC' },
    });
  }

  /**
   * 发送推送给单个用户（所有设备）
   */
  async sendToUser(
    userId: string,
    title: string,
    content: string,
    extras?: Record<string, any>,
  ): Promise<void> {
    if (!this.isInitialized) {
      this.logger.warn('JPush not initialized, skipping push');
      return;
    }

    const tokens = await this.getUserTokens(userId);
    if (tokens.length === 0) {
      this.logger.debug(`No active push tokens for user ${userId}`);
      return;
    }

    // 使用 alias 推送（通过 user_id）
    const payload: PushPayload = {
      platform: 'all',
      audience: {
        alias: [`user_${userId}`],
      } as Audience,
      notification: {
        alert: content,
        android: {
          title,
          extras,
        },
        ios: {
          alert: content,
          sound: 'default',
          extras,
        },
      },
      options: {
        time_to_live: 86400, // 24 小时
        apns_production: this.configService.get<string>('NODE_ENV') === 'production',
      },
    };

    try {
      const result = await this.jpushClient.send(payload);
      this.logger.log(`Push sent to user ${userId}: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to send push to user ${userId}`, error);
      throw error;
    }
  }

  /**
   * 发送推送给多个用户
   */
  async sendToUsers(
    userIds: string[],
    title: string,
    content: string,
    extras?: Record<string, any>,
  ): Promise<void> {
    if (!this.isInitialized) {
      this.logger.warn('JPush not initialized, skipping push');
      return;
    }

    const payload: PushPayload = {
      platform: 'all',
      audience: {
        alias: userIds.map((id) => `user_${id}`),
      } as Audience,
      notification: {
        alert: content,
        android: {
          title,
          extras,
        },
        ios: {
          alert: content,
          sound: 'default',
          extras,
        },
      },
      options: {
        time_to_live: 86400,
        apns_production: this.configService.get<string>('NODE_ENV') === 'production',
      },
    };

    try {
      const result = await this.jpushClient.send(payload);
      this.logger.log(`Push sent to ${userIds.length} users: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to send push to users`, error);
      throw error;
    }
  }

  /**
   * 发送推送给所有用户
   */
  async sendToAll(
    title: string,
    content: string,
    extras?: Record<string, any>,
  ): Promise<void> {
    if (!this.isInitialized) {
      this.logger.warn('JPush not initialized, skipping push');
      return;
    }

    const payload: PushPayload = {
      platform: 'all',
      audience: 'all',
      notification: {
        alert: content,
        android: {
          title,
          extras,
        },
        ios: {
          alert: content,
          sound: 'default',
          extras,
        },
      },
      options: {
        time_to_live: 86400,
        apns_production: this.configService.get<string>('NODE_ENV') === 'production',
      },
    };

    try {
      const result = await this.jpushClient.send(payload);
      this.logger.log(`Push sent to all users: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to send push to all users`, error);
      throw error;
    }
  }

  /**
   * 使用模板发送推送
   */
  async sendWithTemplate(
    userId: string,
    templateId: string,
    variables?: Record<string, any>,
  ): Promise<void> {
    const { title, content, extras } = renderTemplate(templateId, variables);
    return this.sendToUser(userId, title, content, extras);
  }

  /**
   * 发送睡前提醒
   */
  async sendBedtimeReminder(userId: string): Promise<void> {
    return this.sendWithTemplate(userId, 'BEDTIME_REMINDER');
  }

  /**
   * 发送起床提醒
   */
  async sendWakeupReminder(userId: string): Promise<void> {
    return this.sendWithTemplate(userId, 'WAKEUP_REMINDER');
  }

  /**
   * 发送成就解锁通知
   */
  async sendAchievementUnlocked(
    userId: string,
    achievementName: string,
  ): Promise<void> {
    return this.sendWithTemplate(userId, 'ACHIEVEMENT_UNLOCKED', {
      achievementName,
    });
  }

  /**
   * 发送监督消息通知
   */
  async sendSupervisionMessage(
    userId: string,
    senderName: string,
  ): Promise<void> {
    return this.sendWithTemplate(userId, 'SUPERVISION_MESSAGE', {
      senderName,
    });
  }

  /**
   * 发送监督请求通知
   */
  async sendSupervisionRequest(
    userId: string,
    requesterName: string,
  ): Promise<void> {
    return this.sendWithTemplate(userId, 'SUPERVISION_REQUEST', {
      requesterName,
    });
  }
}
