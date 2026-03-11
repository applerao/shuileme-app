/**
 * 极光推送服务
 * JPush Service for React Native
 */

import { Platform } from 'react-native';
import JPush from 'jpush-react-native';

export interface PushNotification {
  messageId: string;
  title: string;
  content: string;
  extras: Record<string, any>;
  receivedAt: Date;
}

export type NotificationHandler = (notification: PushNotification) => void;

class JPushService {
  private isInitialized = false;
  private notificationHandlers: NotificationHandler[] = [];
  private lastNotification: PushNotification | null = null;

  /**
   * 初始化 JPush
   * 必须在应用启动时调用
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[JPush] Already initialized');
      return;
    }

    try {
      // 初始化 JPush
      JPush.init({
        appKey: 'YOUR_JPUSH_APP_KEY', // 替换为实际的 AppKey
        channel: 'default',
        production: __DEV__ ? false : true,
      });

      // 获取注册 ID
      const registrationId = await JPush.getRegistrationID();
      console.log('[JPush] Registration ID:', registrationId);

      // 监听通知点击
      JPush.addNotifyListener((result) => {
        console.log('[JPush] Notification clicked:', result);
        this.handleNotification({
          messageId: result.msgId,
          title: result.notificationTitle,
          content: result.alertContent,
          extras: result.extras,
          receivedAt: new Date(),
        });
      });

      // 监听自定义消息
      JPush.addMessageListener((msg) => {
        console.log('[JPush] Custom message received:', msg);
      });

      // 监听本地通知
      JPush.addLocalNotificationListener((result) => {
        console.log('[JPush] Local notification clicked:', result);
      });

      this.isInitialized = true;
      console.log('[JPush] Initialized successfully');
    } catch (error) {
      console.error('[JPush] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * 设置推送别名（用户 ID）
   * 用于向特定用户发送推送
   */
  async setAlias(userId: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[JPush] Not initialized');
      return;
    }

    try {
      await JPush.setAlias({
        alias: `user_${userId}`,
        callback: (errorCode, result) => {
          if (errorCode === 0) {
            console.log('[JPush] Alias set successfully:', result);
          } else {
            console.error('[JPush] Failed to set alias:', errorCode);
          }
        },
      });
    } catch (error) {
      console.error('[JPush] Failed to set alias:', error);
    }
  }

  /**
   * 清除推送别名
   */
  async clearAlias(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await JPush.clearAlias({
        callback: (errorCode, result) => {
          if (errorCode === 0) {
            console.log('[JPush] Alias cleared successfully');
          } else {
            console.error('[JPush] Failed to clear alias:', errorCode);
          }
        },
      });
    } catch (error) {
      console.error('[JPush] Failed to clear alias:', error);
    }
  }

  /**
   * 设置标签
   * 用于分组推送
   */
  async setTags(tags: string[]): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await JPush.setTags({
        tags,
        callback: (errorCode, result) => {
          if (errorCode === 0) {
            console.log('[JPush] Tags set successfully:', result);
          } else {
            console.error('[JPush] Failed to set tags:', errorCode);
          }
        },
      });
    } catch (error) {
      console.error('[JPush] Failed to set tags:', error);
    }
  }

  /**
   * 获取设备 Token
   */
  async getDeviceToken(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('JPush not initialized');
    }

    try {
      return await JPush.getRegistrationID();
    } catch (error) {
      console.error('[JPush] Failed to get device token:', error);
      throw error;
    }
  }

  /**
   * 请求推送权限（iOS）
   */
  async requestPermission(): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      await JPush.requestPermission();
      console.log('[JPush] Permission requested');
    } catch (error) {
      console.error('[JPush] Failed to request permission:', error);
    }
  }

  /**
   * 检查推送权限
   */
  async checkPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return true; // Android 默认有权限
    }

    try {
      const authorized = await JPush.authStatus();
      return authorized === 1;
    } catch (error) {
      console.error('[JPush] Failed to check permission:', error);
      return false;
    }
  }

  /**
   * 添加通知处理回调
   */
  addNotificationHandler(handler: NotificationHandler): void {
    this.notificationHandlers.push(handler);
  }

  /**
   * 移除通知处理回调
   */
  removeNotificationHandler(handler: NotificationHandler): void {
    this.notificationHandlers = this.notificationHandlers.filter(
      (h) => h !== handler,
    );
  }

  /**
   * 处理通知
   */
  private handleNotification(notification: PushNotification): void {
    this.lastNotification = notification;
    this.notificationHandlers.forEach((handler) => {
      try {
        handler(notification);
      } catch (error) {
        console.error('[JPush] Notification handler error:', error);
      }
    });
  }

  /**
   * 获取最后一条通知
   */
  getLastNotification(): PushNotification | null {
    return this.lastNotification;
  }

  /**
   * 清除所有通知
   */
  clearAllNotifications(): void {
    JPush.clearAllNotifications();
  }

  /**
   * 设置通知角标（iOS）
   */
  async setBadge(badge: number): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      await JPush.setBadge({
        badge,
        callback: (errorCode, result) => {
          if (errorCode === 0) {
            console.log('[JPush] Badge set successfully');
          } else {
            console.error('[JPush] Failed to set badge:', errorCode);
          }
        },
      });
    } catch (error) {
      console.error('[JPush] Failed to set badge:', error);
    }
  }

  /**
   * 停止推送
   */
  async stopPush(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      JPush.stopPush();
      console.log('[JPush] Push stopped');
    } catch (error) {
      console.error('[JPush] Failed to stop push:', error);
    }
  }

  /**
   * 恢复推送
   */
  async resumePush(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      JPush.resumePush();
      console.log('[JPush] Push resumed');
    } catch (error) {
      console.error('[JPush] Failed to resume push:', error);
    }
  }
}

// 导出单例
export const jpushService = new JPushService();
export default jpushService;
