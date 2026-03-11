// 表单验证工具

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ValidationRules {
  required?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: string) => ValidationResult;
}

export interface PasswordStrength {
  strength: 'weak' | 'medium' | 'strong';
  message: string;
  score: number;
}

/**
 * 验证手机号（增强版 - 支持所有运营商）
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: '请输入手机号' };
  }

  // 更精确的中国手机号正则（支持所有运营商）
  // 移动：134-139, 147, 148, 150-152, 157-159, 172, 178, 182-184, 187, 188, 195, 197, 198
  // 联通：130-132, 145, 146, 155, 156, 166, 171, 175, 176, 185, 186, 196
  // 电信：133, 149, 153, 173, 174, 177, 180, 181, 189, 191, 193, 199
  // 虚拟运营商：162, 165, 167, 170, 171
  const phoneRegex = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: '请输入有效的手机号' };
  }

  return { isValid: true };
};

/**
 * 获取密码强度
 */
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (password.length < 6) {
    return { strength: 'weak', message: '密码太短', score: 0 };
  }
  
  let score = 0;
  
  // 长度评分
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // 字符类型评分
  if (/[a-z]/.test(password)) score += 1;  // 小写字母
  if (/[A-Z]/.test(password)) score += 1;  // 大写字母
  if (/\d/.test(password)) score += 1;     // 数字
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;  // 特殊字符
  
  // 判定强度
  let strength: 'weak' | 'medium' | 'strong';
  let message: string;
  
  if (score <= 2) {
    strength = 'weak';
    message = '密码强度：弱';
  } else if (score <= 4) {
    strength = 'medium';
    message = '密码强度：中';
  } else {
    strength = 'strong';
    message = '密码强度：强';
  }
  
  return { strength, message, score };
};

/**
 * 验证密码
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: '请输入密码' };
  }

  if (password.length < 6) {
    return { isValid: false, message: '密码长度至少 6 位' };
  }

  if (password.length > 20) {
    return { isValid: false, message: '密码长度不能超过 20 位' };
  }

  return { isValid: true };
};

/**
 * 验证验证码
 */
export const validateCode = (code: string): ValidationResult => {
  if (!code || code.trim() === '') {
    return { isValid: false, message: '请输入验证码' };
  }

  const codeRegex = /^\d{6}$/;
  if (!codeRegex.test(code)) {
    return { isValid: false, message: '验证码为 6 位数字' };
  }

  return { isValid: true };
};

/**
 * 验证确认密码
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, message: '请确认密码' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: '两次输入的密码不一致' };
  }

  return { isValid: true };
};

/**
 * 验证用户协议
 */
export const validateAgreement = (agreed: boolean): ValidationResult => {
  if (!agreed) {
    return { isValid: false, message: '请阅读并同意用户协议' };
  }
  return { isValid: true };
};

/**
 * 通用验证函数
 */
export const validateField = (
  value: string,
  rules: ValidationRules
): ValidationResult => {
  // 必填验证
  if (rules.required && (!value || value.trim() === '')) {
    return { isValid: false, message: rules.required };
  }

  // 最小长度
  if (rules.minLength && value.length < rules.minLength) {
    return {
      isValid: false,
      message: `长度至少为${rules.minLength}个字符`,
    };
  }

  // 最大长度
  if (rules.maxLength && value.length > rules.maxLength) {
    return {
      isValid: false,
      message: `长度不能超过${rules.maxLength}个字符`,
    };
  }

  // 正则匹配
  if (rules.pattern && !rules.pattern.test(value)) {
    return {
      isValid: false,
      message: rules.patternMessage || '格式不正确',
    };
  }

  // 自定义验证
  if (rules.custom) {
    return rules.custom(value);
  }

  return { isValid: true };
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
