// 深夜蓝/星空紫主题配色
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
  
  // 文字色
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textTertiary: '#718096',
  
  // 功能色
  success: '#48BB78',
  warning: '#ECC94B',
  error: '#F56565',
  info: '#4299E1',
  
  // 微信品牌色
  wechat: '#07C160',
  
  // 边框和分隔
  border: '#2D3748',
  borderLight: '#4A5568',
  
  // 渐变紫色系
  gradientPurple1: '#4A00E0',
  gradientPurple2: '#8E2DE2',
  gradientPurple3: '#667eea',
  gradientPurple4: '#764ba2',
  gradientBlue1: '#5C258D',
  gradientBlue2: '#4389A2',
  
  // 白色
  white: '#FFFFFF',
  black: '#000000',
  
  // 透明色
  transparent: 'transparent',
};

// 间距系统
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 圆角系统
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// 阴影
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floating: {
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
};

// 字体
export const typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// 动画
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

// 图表配置
export const chartConfig = {
  gradientFrom: colors.gradientPurple1,
  gradientTo: colors.gradientPurple2,
  lineColor: colors.primary,
  barColor: colors.secondary,
  gridColor: colors.border,
  textColor: colors.textSecondary,
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  animations,
  chartConfig,
};
