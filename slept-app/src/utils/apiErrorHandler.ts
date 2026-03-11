// API 错误处理工具

export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PHONE_ALREADY_REGISTERED = 'PHONE_ALREADY_REGISTERED',
  INVALID_CODE = 'INVALID_CODE',
  CODE_EXPIRED = 'CODE_EXPIRED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_PHONE = 'INVALID_PHONE',
}

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;
  details?: any;

  constructor(code: ApiErrorCode, message?: string, status?: number, details?: any) {
    super(message || getErrorMessage(code));
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = 'ApiError';
  }
}

export const getErrorMessage = (code: ApiErrorCode): string => {
  const messages: Record<ApiErrorCode, string> = {
    [ApiErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
    [ApiErrorCode.TIMEOUT]: '请求超时，请重试',
    [ApiErrorCode.SERVER_ERROR]: '服务器错误，请稍后重试',
    [ApiErrorCode.VALIDATION_ERROR]: '输入信息有误，请检查',
    [ApiErrorCode.UNAUTHORIZED]: '登录已过期，请重新登录',
    [ApiErrorCode.NOT_FOUND]: '请求的资源不存在',
    [ApiErrorCode.RATE_LIMIT]: '操作过于频繁，请稍后再试',
    [ApiErrorCode.USER_NOT_FOUND]: '该手机号未注册',
    [ApiErrorCode.INVALID_PASSWORD]: '密码错误',
    [ApiErrorCode.ACCOUNT_LOCKED]: '账号已被锁定，请联系客服',
    [ApiErrorCode.PHONE_ALREADY_REGISTERED]: '该手机号已注册，请直接登录',
    [ApiErrorCode.INVALID_CODE]: '验证码错误',
    [ApiErrorCode.CODE_EXPIRED]: '验证码已过期，请重新获取',
    [ApiErrorCode.RATE_LIMIT_EXCEEDED]: '操作过于频繁，请稍后再试',
    [ApiErrorCode.INVALID_PHONE]: '手机号格式不正确',
  };
  return messages[code] || '未知错误，请稍后重试';
};

export const getErrorTitle = (code: ApiErrorCode): string => {
  const titles: Record<ApiErrorCode, string> = {
    [ApiErrorCode.NETWORK_ERROR]: '网络错误',
    [ApiErrorCode.TIMEOUT]: '请求超时',
    [ApiErrorCode.SERVER_ERROR]: '服务器错误',
    [ApiErrorCode.VALIDATION_ERROR]: '验证失败',
    [ApiErrorCode.UNAUTHORIZED]: '未授权',
    [ApiErrorCode.NOT_FOUND]: '资源不存在',
    [ApiErrorCode.RATE_LIMIT]: '频率限制',
    [ApiErrorCode.USER_NOT_FOUND]: '提示',
    [ApiErrorCode.INVALID_PASSWORD]: '登录失败',
    [ApiErrorCode.ACCOUNT_LOCKED]: '账号锁定',
    [ApiErrorCode.PHONE_ALREADY_REGISTERED]: '提示',
    [ApiErrorCode.INVALID_CODE]: '验证失败',
    [ApiErrorCode.CODE_EXPIRED]: '验证码过期',
    [ApiErrorCode.RATE_LIMIT_EXCEEDED]: '发送频繁',
    [ApiErrorCode.INVALID_PHONE]: '发送失败',
  };
  return titles[code] || '错误';
};

/**
 * 从 HTTP 状态码映射错误码
 */
export const mapHttpStatusToErrorCode = (status: number, responseBody?: any): ApiErrorCode => {
  switch (status) {
    case 400:
      return ApiErrorCode.VALIDATION_ERROR;
    case 401:
      return ApiErrorCode.UNAUTHORIZED;
    case 403:
      return responseBody?.code === 'ACCOUNT_LOCKED' 
        ? ApiErrorCode.ACCOUNT_LOCKED 
        : ApiErrorCode.UNAUTHORIZED;
    case 404:
      return ApiErrorCode.NOT_FOUND;
    case 429:
      return ApiErrorCode.RATE_LIMIT;
    case 500:
    case 502:
    case 503:
      return ApiErrorCode.SERVER_ERROR;
    default:
      return ApiErrorCode.SERVER_ERROR;
  }
};

/**
 * 处理 API 响应错误
 */
export const handleApiError = (error: any): ApiError => {
  // 已经是 ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // 网络错误
  if (error.message === 'Network request failed' || !navigator.onLine) {
    return new ApiError(ApiErrorCode.NETWORK_ERROR, undefined, 0);
  }

  // AbortError (超时)
  if (error.name === 'AbortError') {
    return new ApiError(ApiErrorCode.TIMEOUT, undefined, 0);
  }

  // HTTP 错误
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    const code = error.code || mapHttpStatusToErrorCode(status, error.response);
    return new ApiError(code, error.message, status, error.response);
  }

  // 未知错误
  return new ApiError(ApiErrorCode.SERVER_ERROR, error.message || '未知错误');
};

/**
 * 带超时的 fetch 封装
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = 10000
): Promise<any> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(
        errorBody.code || mapHttpStatusToErrorCode(response.status, errorBody),
        errorBody.message,
        response.status,
        errorBody
      );
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(id);
    throw handleApiError(error);
  }
};

/**
 * 重试包装器
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // 不重试的错误类型
      if (
        error.code === ApiErrorCode.VALIDATION_ERROR ||
        error.code === ApiErrorCode.UNAUTHORIZED ||
        error.code === ApiErrorCode.USER_NOT_FOUND ||
        error.code === ApiErrorCode.PHONE_ALREADY_REGISTERED
      ) {
        throw error;
      }

      // 最后一次尝试
      if (i === maxRetries - 1) {
        break;
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
    }
  }

  throw lastError;
};
