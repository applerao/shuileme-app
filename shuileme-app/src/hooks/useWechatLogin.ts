import { useState, useCallback, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { wechatLogin as wechatLoginSdk, initWeChat, isWeChatInstalled } from '../utils/wechat';
import { authApi, saveToken, saveUserInfo } from '../services/auth';

interface UseWechatLoginReturn {
  isLoading: boolean;
  isWeChatAvailable: boolean;
  wechatLogin: () => Promise<void>;
  checkWeChatAvailability: () => Promise<void>;
}

/**
 * 微信登录自定义 Hook
 * 封装微信登录的完整流程
 */
export const useWechatLogin = (): UseWechatLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWeChatAvailable, setIsWeChatAvailable] = useState(false);

  // 初始化微信 SDK
  useEffect(() => {
    const init = async () => {
      try {
        await initWeChat();
        await checkWeChatAvailability();
      } catch (error) {
        console.error('微信 SDK 初始化失败:', error);
      }
    };

    init();
  }, []);

  // 检查微信是否可用
  const checkWeChatAvailability = useCallback(async () => {
    try {
      const installed = await isWeChatInstalled();
      setIsWeChatAvailable(installed);
      
      if (!installed) {
        console.log('微信未安装，将使用备用登录方式');
      }
    } catch (error) {
      console.error('检查微信安装状态失败:', error);
      setIsWeChatAvailable(false);
    }
  }, []);

  // 执行微信登录
  const wechatLogin = useCallback(async () => {
    if (!isWeChatAvailable) {
      Alert.alert(
        '提示',
        '未检测到微信应用，请先安装微信',
        [{ text: '确定' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      // 1. 调用微信 SDK 获取授权码
      const wechatCode = await wechatLoginSdk();
      console.log('获取到微信授权码:', wechatCode.substring(0, 8) + '...');

      // 2. 使用授权码调用后端 API
      const response = await authApi.wechatLogin(wechatCode);
      
      // 3. 保存 token 和用户信息
      saveToken(response.token);
      saveUserInfo(response.userInfo);

      console.log('微信登录成功:', response.userInfo.nickname);
      
      // 4. 登录成功后的回调（由父组件处理导航等）
      Alert.alert('登录成功', `欢迎回来，${response.userInfo.nickname || '微信用户'}`);
      
    } catch (error: any) {
      console.error('微信登录失败:', error);
      
      // 错误处理
      let message = '微信登录失败，请重试';
      
      if (error.message?.includes('用户取消')) {
        message = '您已取消微信授权';
      } else if (error.message?.includes('请先安装微信')) {
        message = '请先安装微信应用';
      } else if (error.status === 400) {
        message = '微信授权码无效，请重试';
      } else if (error.status === 401) {
        message = '账户已被禁用，请联系客服';
      } else if (error.code === 'NETWORK_ERROR') {
        message = '网络错误，请检查网络连接';
      }

      Alert.alert('登录失败', message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isWeChatAvailable]);

  return {
    isLoading,
    isWeChatAvailable,
    wechatLogin,
    checkWeChatAvailability,
  };
};

export default useWechatLogin;
