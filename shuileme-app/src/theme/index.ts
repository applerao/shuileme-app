/**
 * 睡了么 App 主题配置
 * Theme Configuration for ShuiLeMe App
 */

export const colors = {
  // 主色调 - 深夜色系
  primary: {
    midnightBlue: '#1a2332',      // 深夜蓝 - 主背景
    starryPurple: '#6b4c9a',      // 星空紫 - 主强调色
    dawnPurple: '#9b7ebd',        // 晨曦紫 - 次强调色
    nightSky: '#0f141f',          // 夜空黑 - 深色背景
  },
  
  // 辅助色
  secondary: {
    softWhite: '#f5f5f7',         // 柔和白 - 文字
    warmGray: '#8e8e93',          // 暖灰 - 次要文字
    lightPurple: '#e8dff5',       // 淡紫 - 背景点缀
    moonlight: '#c4b5fd',         // 月光色 - 高亮
  },
  
  // 功能色
  functional: {
    success: '#34c759',           // 成功 - 绿色
    warning: '#ff9500',           // 警告 - 橙色
    error: '#ff3b30',             // 错误 - 红色
    info: '#007aff',              // 信息 - 蓝色
  },
  
  // 渐变色
  gradients: {
    midnight: ['#1a2332', '#0f141f'],
    starry: ['#6b4c9a', '#9b7ebd'],
    dawn: ['#9b7ebd', '#c4b5fd'],
    night: ['#0f141f', '#1a2332', '#2d3748'],
  },
  
  // 透明度变体
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  families: {
    primary: 'System',
    secondary: 'System',
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;
export type Colors = typeof colors;
