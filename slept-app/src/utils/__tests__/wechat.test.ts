/**
 * 微信登录功能测试
 * 
 * 测试用例涵盖：
 * 1. 微信 SDK 初始化
 * 2. 微信安装检测
 * 3. 微信授权流程
 * 4. 后端接口调用
 * 5. 完整登录流程
 */

import { initWeChat, isWeChatInstalled, wechatAuth, loginWithWeChatCode, wechatLogin } from '../utils/wechat';

// Mock react-native-wechat
jest.mock('react-native-wechat', () => ({
  default: {
    registerApp: jest.fn(),
    isWXAppInstalled: jest.fn(),
    sendAuthRequest: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('WeChat Login Utils', () => {
  const WeChat = require('react-native-wechat').default;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initWeChat', () => {
    it('should initialize WeChat SDK successfully', async () => {
      WeChat.registerApp.mockResolvedValue(true);
      
      const result = await initWeChat();
      
      expect(result).toBe(true);
      expect(WeChat.registerApp).toHaveBeenCalledWith('wxXXXXXXXXXXXXXXXX');
    });

    it('should return false when initialization fails', async () => {
      WeChat.registerApp.mockRejectedValue(new Error('Initialization failed'));
      
      const result = await initWeChat();
      
      expect(result).toBe(false);
    });
  });

  describe('isWeChatInstalled', () => {
    it('should return true when WeChat is installed', async () => {
      WeChat.isWXAppInstalled.mockResolvedValue(true);
      
      const result = await isWeChatInstalled();
      
      expect(result).toBe(true);
    });

    it('should return false when WeChat is not installed', async () => {
      WeChat.isWXAppInstalled.mockResolvedValue(false);
      
      const result = await isWeChatInstalled();
      
      expect(result).toBe(false);
    });

    it('should return false when check fails', async () => {
      WeChat.isWXAppInstalled.mockRejectedValue(new Error('Check failed'));
      
      const result = await isWeChatInstalled();
      
      expect(result).toBe(false);
    });
  });

  describe('wechatAuth', () => {
    it('should return auth code on success', async () => {
      WeChat.isWXAppInstalled.mockResolvedValue(true);
      WeChat.sendAuthRequest.mockResolvedValue({
        errCode: 0,
        code: 'test_auth_code_123',
      });
      
      const result = await wechatAuth();
      
      expect(result).toBe('test_auth_code_123');
      expect(WeChat.sendAuthRequest).toHaveBeenCalledWith(
        'snsapi_userinfo',
        'slept_app_wechat_login'
      );
    });

    it('should throw error when user cancels', async () => {
      WeChat.isWXAppInstalled.mockResolvedValue(true);
      WeChat.sendAuthRequest.mockResolvedValue({
        errCode: -2,
        errMsg: 'user cancel',
      });
      
      await expect(wechatAuth()).rejects.toThrow('用户取消授权');
    });

    it('should throw error when auth fails', async () => {
      WeChat.isWXAppInstalled.mockResolvedValue(true);
      WeChat.sendAuthRequest.mockResolvedValue({
        errCode: -1,
        errMsg: 'auth failed',
      });
      
      await expect(wechatAuth()).rejects.toThrow('微信授权失败');
    });
  });

  describe('loginWithWeChatCode', () => {
    it('should return token and userInfo on success', async () => {
      const mockResponse = {
        token: 'test_jwt_token',
        userInfo: {
          id: 'user_123',
          nickname: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
        },
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });
      
      const result = await loginWithWeChatCode('test_code');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.shuileme.com/api/v1/auth/wechat',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wechatCode: 'test_code',
          }),
        })
      );
    });

    it('should throw error when API returns error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          message: 'Invalid wechat code',
        }),
      });
      
      await expect(loginWithWeChatCode('invalid_code'))
        .rejects.toThrow('Invalid wechat code');
    });

    it('should throw error when network fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      await expect(loginWithWeChatCode('test_code'))
        .rejects.toThrow('Network error');
    });
  });

  describe('wechatLogin', () => {
    it('should complete full login flow', async () => {
      const mockAuthCode = 'test_auth_code';
      const mockLoginResult = {
        token: 'test_jwt_token',
        userInfo: {
          id: 'user_123',
          nickname: 'Test User',
        },
      };
      
      WeChat.isWXAppInstalled.mockResolvedValue(true);
      WeChat.sendAuthRequest.mockResolvedValue({
        errCode: 0,
        code: mockAuthCode,
      });
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLoginResult),
      });
      
      const result = await wechatLogin();
      
      expect(result).toEqual(mockLoginResult);
    });
  });
});
