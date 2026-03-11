import React, { useEffect, createContext, useContext, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import jpushService from '../services/JPushService';
import { useAuth } from './AuthContext'; // 假设已有 AuthContext

interface PushContextType {
  isInitialized: boolean;
  isAuthorized: boolean;
  requestPermission: () => Promise<boolean>;
}

const PushContext = createContext<PushContextType | undefined>(undefined);

interface PushProviderProps {
  children: ReactNode;
}

export function PushProvider({ children }: PushProviderProps) {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  /**
   * 初始化 JPush
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        await jpushService.initialize();
        setIsInitialized(true);

        // 检查权限
        const authorized = await jpushService.checkPermission();
        setIsAuthorized(authorized);

        console.log('[PushProvider] JPush initialized');
      } catch (error) {
        console.error('[PushProvider] Failed to initialize JPush:', error);
      }
    };

    initialize();
  }, []);

  /**
   * 用户登录后注册推送
   */
  useEffect(() => {
    if (!isInitialized || !user) {
      return;
    }

    const register = async () => {
      try {
        // 设置用户别名
        await jpushService.setAlias(user.id);
        
        // 获取设备 Token
        const deviceToken = await jpushService.getDeviceToken();
        
        // 注册到后端
        // TODO: 实现 API 调用
        // await api.post('/api/push/register-token', {
        //   deviceToken,
        //   platform: Platform.OS as 'ios' | 'android',
        //   deviceId: await getDeviceId(),
        //   appVersion: getAppBundleId(),
        // });

        console.log('[PushProvider] User registered for push notifications');
      } catch (error) {
        console.error('[PushProvider] Failed to register user:', error);
      }
    };

    register();

    // 用户登出时清除
    return () => {
      if (user) {
        jpushService.clearAlias();
      }
    };
  }, [isInitialized, user]);

  /**
   * 请求推送权限
   */
  const requestPermission = React.useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      setIsAuthorized(true);
      return true;
    }

    try {
      await jpushService.requestPermission();
      const authorized = await jpushService.checkPermission();
      setIsAuthorized(authorized);

      if (!authorized) {
        Alert.alert(
          '推送权限',
          '您已拒绝推送权限，无法接收通知。请在系统设置中开启通知权限。',
          [
            { text: '取消', style: 'cancel' },
            { text: '去设置', onPress: () => Linking.openURL('app-settings:') },
          ],
        );
      }

      return authorized;
    } catch (error) {
      console.error('[PushProvider] Failed to request permission:', error);
      return false;
    }
  }, []);

  const value = React.useMemo(
    () => ({
      isInitialized,
      isAuthorized,
      requestPermission,
    }),
    [isInitialized, isAuthorized, requestPermission],
  );

  return (
    <PushContext.Provider value={value}>
      {children}
    </PushContext.Provider>
  );
}

/**
 * 使用推送上下文
 */
export function usePush(): PushContextType {
  const context = useContext(PushContext);
  if (context === undefined) {
    throw new Error('usePush must be used within a PushProvider');
  }
  return context;
}

export default PushProvider;
