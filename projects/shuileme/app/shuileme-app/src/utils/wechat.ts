import WeChat from 'react-native-wechat';
import { Platform } from 'react-native';

// 微信 AppID - 从环境变量或配置文件读取
export const WECHAT_APP_ID = 'wxXXXXXXXXXXXXXXXX';

/**
 * 初始化微信 SDK
 * 应在应用启动时调用
 */
export const initWeChat = async (): Promise<boolean> => {
  try {
    const result = await WeChat.registerApp(WECHAT_APP_ID);
    console.log('微信 SDK 初始化成功:', result);
    return result;
  } catch (error) {
    console.error('微信 SDK 初始化失败:', error);
    return false;
  }
};

/**
 * 检查是否安装了微信
 */
export const isWeChatInstalled = async (): Promise<boolean> => {
  try {
    return await WeChat.isWXAppInstalled();
  } catch (error) {
    console.error('检查微信安装状态失败:', error);
    return false;
  }
};

/**
 * 发起微信登录授权
 * @returns Promise<string> 微信授权码
 */
export const wechatLogin = async (): Promise<string> => {
  try {
    // 检查微信是否已安装
    const installed = await isWeChatInstalled();
    if (!installed) {
      throw new Error('请先安装微信应用');
    }

    // 发起授权请求
    const result = await WeChat.sendAuthRequest([
      'snsapi_userinfo', // 获取用户信息
      'snsapi_login',     // 微信登录
    ]);

    if (result.errCode === 0) {
      // 授权成功，返回授权码
      return result.code;
    } else {
      // 用户取消或其他错误
      throw new Error(getWeChatErrorMessage(result.errCode));
    }
  } catch (error: any) {
    console.error('微信登录失败:', error);
    throw error;
  }
};

/**
 * 获取微信错误信息
 */
const getWeChatErrorMessage = (errCode: number): string => {
  const errorMessages: Record<number, string> = {
    -1: '授权失败，请重试',
    -2: '用户取消授权',
    0: '授权成功',
    400: '请求错误',
    401: '签名错误',
    402: '客户端版本过旧',
    403: '权限不足',
    404: '网络错误',
  };

  return errorMessages[errCode] || `未知错误 (code: ${errCode})`;
};

/**
 * 监听微信授权响应
 * 用于处理从微信返回的授权结果
 */
export const onWeChatAuthResponse = (
  onSuccess: (code: string) => void,
  onError: (error: Error) => void,
) => {
  // 注意：实际使用中需要在全局设置监听器
  // 这里提供一个示例接口
  console.log('微信授权响应监听器已设置');
};

export default {
  initWeChat,
  isWeChatInstalled,
  wechatLogin,
  WECHAT_APP_ID,
};
