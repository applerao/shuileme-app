/**
 * 微信登录工具模块
 * 
 * 提供微信 SDK 初始化和登录功能
 */

import { Alert, Linking, Platform } from 'react-native';

// 微信 AppID - 从环境变量或配置获取
export const WECHAT_APP_ID = 'wxXXXXXXXXXXXXXXXX';

/**
 * 初始化微信 SDK
 * 在应用启动时调用
 */
export const initWeChat = async (): Promise<boolean> => {
  try {
    // 动态导入 react-native-wechat
    const WeChat = require('react-native-wechat').default;
    
    if (!WECHAT_APP_ID) {
      console.error('微信 AppID 未配置');
      return false;
    }

    await WeChat.registerApp(WECHAT_APP_ID);
    console.log('✅ 微信 SDK 初始化成功');
    return true;
  } catch (error) {
    console.error('❌ 微信 SDK 初始化失败:', error);
    return false;
  }
};

/**
 * 检查微信是否已安装
 */
export const isWeChatInstalled = async (): Promise<boolean> => {
  try {
    const WeChat = require('react-native-wechat').default;
    return await WeChat.isWXAppInstalled();
  } catch (error) {
    console.error('检查微信安装状态失败:', error);
    return false;
  }
};

/**
 * 发起微信授权登录
 * 
 * @returns Promise<string> 微信授权 code
 */
export const wechatAuth = async (): Promise<string> => {
  try {
    const WeChat = require('react-native-wechat').default;
    
    // 检查微信是否已安装
    const installed = await isWeChatInstalled();
    if (!installed) {
      // 如果未安装微信，尝试打开微信下载页面
      const url = Platform.OS === 'ios' 
        ? 'https://itunes.apple.com/cn/app/wechat/id414478124?mt=8'
        : 'market://details?id=com.tencent.mm';
      
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('提示', '请先安装微信 App');
        }
      });
      
      throw new Error('未安装微信');
    }

    // 发起微信授权
    const result = await WeChat.sendAuthRequest('snsapi_userinfo', 'slept_app_wechat_login');
    
    if (result.errCode === 0) {
      // 授权成功，返回 code
      return result.code;
    } else if (result.errCode === -2) {
      // 用户取消
      throw new Error('用户取消授权');
    } else {
      // 其他错误
      throw new Error(`微信授权失败：${result.errMsg || '未知错误'}`);
    }
  } catch (error: any) {
    console.error('微信授权失败:', error);
    throw error;
  }
};

/**
 * 调用后端微信登录接口
 * 
 * @param code 微信授权 code
 * @returns Promise<{token: string, userInfo: any}> 登录结果
 */
export const loginWithWeChatCode = async (code: string): Promise<{token: string, userInfo: any}> => {
  try {
    // TODO: 替换为实际的后端 API 地址
    const API_URL = 'https://api.shuileme.com/api/v1/auth/wechat';
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wechatCode: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('微信登录接口调用失败:', error);
    throw error;
  }
};

/**
 * 完整的微信登录流程
 * 
 * @returns Promise<{token: string, userInfo: any}> 登录结果
 */
export const wechatLogin = async (): Promise<{token: string, userInfo: any}> => {
  // Step 1: 获取微信授权 code
  const code = await wechatAuth();
  
  // Step 2: 使用 code 调用后端接口换取 token 和用户信息
  const result = await loginWithWeChatCode(code);
  
  return result;
};

export default {
  initWeChat,
  isWeChatInstalled,
  wechatAuth,
  loginWithWeChatCode,
  wechatLogin,
};
