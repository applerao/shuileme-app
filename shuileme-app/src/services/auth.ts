import axios from 'axios';

// API 基础 URL - 根据环境配置
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 服务器返回错误响应
      const { status, data } = error.response;
      
      if (status === 401) {
        // Token 过期，清除本地 token
        removeToken();
      }
      
      return Promise.reject({
        status,
        message: data?.message || '请求失败',
        code: data?.code,
      });
    } else if (error.request) {
      // 网络错误
      return Promise.reject({
        status: 0,
        message: '网络错误，请检查网络连接',
        code: 'NETWORK_ERROR',
      });
    } else {
      return Promise.reject({
        status: 0,
        message: error.message || '未知错误',
        code: 'UNKNOWN_ERROR',
      });
    }
  }
);

// Token 管理
const TOKEN_KEY = 'shuileme_token';
const USER_INFO_KEY = 'shuileme_user_info';

export const saveToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('保存 token 失败:', error);
  }
};

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('读取 token 失败:', error);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  } catch (error) {
    console.error('删除 token 失败:', error);
  }
};

export const saveUserInfo = (userInfo: any) => {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error('保存用户信息失败:', error);
  }
};

export const getUserInfo = () => {
  try {
    const info = localStorage.getItem(USER_INFO_KEY);
    return info ? JSON.parse(info) : null;
  } catch (error) {
    console.error('读取用户信息失败:', error);
    return null;
  }
};

// 认证相关 API
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  code: string;
  nickname?: string;
}

export interface WechatLoginRequest {
  wechatCode: string;
}

export interface AuthResponse {
  token: string;
  userInfo: {
    id: string;
    phone: string;
    nickname: string;
    avatar?: string;
    wechatId?: string;
    createdAt: string;
  };
}

export interface SendCodeRequest {
  phone: string;
}

export const authApi = {
  /**
   * 手机号密码登录
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * 用户注册
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * 发送验证码
   */
  sendCode: async (data: SendCodeRequest): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/auth/send-code', data);
    return response.data;
  },

  /**
   * 微信登录
   */
  wechatLogin: async (wechatCode: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/wechat', {
      wechatCode,
    });
    return response.data;
  },

  /**
   * 退出登录
   */
  logout: () => {
    removeToken();
  },
};

export default api;
