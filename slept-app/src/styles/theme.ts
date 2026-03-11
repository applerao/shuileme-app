// 睡了么 App - 设计主题
// 深夜蓝/星空紫主题

export const colors = {
  // 主色调 - 星空紫
  primary: '#667eea',
  primaryDark: '#5A67D8',
  primaryLight: '#7F9CF5',
  
  // 辅助色 - 深夜蓝
  secondary: '#4389A2',
  secondaryDark: '#2C5F72',
  secondaryLight: '#5FA8C3',
  
  // 背景色 - 深蓝渐变
  background: '#0B0F19',
  backgroundSecondary: '#121826',
  card: '#151B2B',
  input: 'rgba(255, 255, 255, 0.08)',
  
  // 文本颜色
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textTertiary: '#718096',
  text: {
    primary: '#FFFFFF',
    secondary: '#A0AEC0',
    disabled: '#718096',
    error: '#F56565',
    success: '#48BB78',
  },
  
  // 功能色
  success: '#48BB78',
  warning: '#ECC94B',
  error: '#F56565',
  info: '#4299E1',
  
  // 边框颜色
  border: {
    light: '#4A5568',
    main: '#2D3748',
    focus: '#667eea',
    error: '#F56565',
  },
  
  // 渐变背景
  gradient: {
    start: '#0B0F19',
    middle: '#121826',
    end: '#151B2B',
  },
  
  // 白色
  white: '#FFFFFF',
  black: '#000000',
  
  // 微信品牌色
  wechat: '#07C160',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floating: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};
