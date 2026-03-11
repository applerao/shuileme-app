import { useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import jpushService, { PushNotification } from '../services/JPushService';
import { useNavigation } from '@react-navigation/native';

export interface NavigationTarget {
  screen: string;
  params?: Record<string, any>;
}

/**
 * 根据推送 extras 解析导航目标
 */
function parseNavigationTarget(extras: Record<string, any>): NavigationTarget | null {
  const action = extras?.action;
  
  if (!action) {
    return null;
  }

  switch (action) {
    case 'navigate_to_home':
      return { screen: 'Home' };
    case 'navigate_to_checkin':
      return { screen: 'Checkin' };
    case 'navigate_to_supervision':
      return { 
        screen: 'Supervision',
        params: { relationId: extras?.relationId },
      };
    case 'navigate_to_supervision_requests':
      return { screen: 'SupervisionRequests' };
    case 'navigate_to_achievements':
      return { 
        screen: 'Achievements',
        params: { achievementId: extras?.achievementId },
      };
    case 'navigate_to_stats':
      return { screen: 'Stats' };
    default:
      return null;
  }
}

/**
 * 推送通知 Hook
 * 用于在组件中处理推送通知
 */
export function usePushNotification() {
  const navigation = useNavigation();

  /**
   * 处理推送通知点击
   */
  const handleNotification = useCallback(
    (notification: PushNotification) => {
      console.log('[usePushNotification] Notification received:', notification);

      // 解析导航目标
      const target = parseNavigationTarget(notification.extras);
      
      if (target) {
        // @ts-ignore - React Navigation navigation type
        navigation.navigate(target.screen, target.params);
      }

      // 根据通知类型执行特定操作
      const type = notification.extras?.type;
      switch (type) {
        case 'bedtime_reminder':
          console.log('[Push] Bedtime reminder received');
          break;
        case 'wakeup_reminder':
          console.log('[Push] Wakeup reminder received');
          break;
        case 'achievement_unlocked':
          console.log('[Push] Achievement unlocked:', notification.extras?.achievementName);
          break;
        case 'supervision_message':
          console.log('[Push] Supervision message from:', notification.extras?.senderName);
          break;
        default:
          console.log('[Push] Unknown notification type:', type);
      }
    },
    [navigation],
  );

  /**
   * 初始化推送监听
   */
  useEffect(() => {
    // 添加通知处理回调
    jpushService.addNotificationHandler(handleNotification);

    // 检查是否有启动时点击的通知
    const lastNotification = jpushService.getLastNotification();
    if (lastNotification) {
      handleNotification(lastNotification);
    }

    // 清理
    return () => {
      jpushService.removeNotificationHandler(handleNotification);
    };
  }, [handleNotification]);

  return {
    handleNotification,
  };
}

/**
 * 推送权限 Hook
 * 用于请求和管理推送权限
 */
export function usePushPermission() {
  const [isAuthorized, setIsAuthorized] = useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      try {
        const authorized = await jpushService.checkPermission();
        if (mounted) {
          setIsAuthorized(authorized);
        }
      } catch (error) {
        console.error('[usePushPermission] Failed to check permission:', error);
      }
    };

    checkPermission();

    return () => {
      mounted = false;
    };
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      await jpushService.requestPermission();
      const authorized = await jpushService.checkPermission();
      setIsAuthorized(authorized);
      return authorized;
    } catch (error) {
      console.error('[usePushPermission] Failed to request permission:', error);
      return false;
    }
  }, [setIsAuthorized]);

  return {
    isAuthorized,
    requestPermission,
  };
}

/**
 * 推送注册 Hook
 * 用于注册设备 Token 到后端
 */
export function usePushRegistration(userId: string | null) {
  const [isRegistered, setIsRegistered] = useEffect(() => {
    let mounted = true;

    const register = async () => {
      if (!userId) {
        return;
      }

      try {
        // 设置别名
        await jpushService.setAlias(userId);
        
        // 获取设备 Token
        const deviceToken = await jpushService.getDeviceToken();
        
        // TODO: 发送到后端 API 注册
        // await api.post('/api/push/register-token', {
        //   deviceToken,
        //   platform: Platform.OS,
        // });

        if (mounted) {
          setIsRegistered(true);
        }
        console.log('[usePushRegistration] Registered successfully');
      } catch (error) {
        console.error('[usePushRegistration] Registration failed:', error);
      }
    };

    register();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const unregister = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      await jpushService.clearAlias();
      setIsRegistered(false);
      console.log('[usePushRegistration] Unregistered successfully');
    } catch (error) {
      console.error('[usePushRegistration] Unregistration failed:', error);
    }
  }, [userId]);

  return {
    isRegistered,
    unregister,
  };
}
