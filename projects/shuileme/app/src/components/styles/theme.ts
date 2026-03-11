// 深夜蓝/星空紫主题配置
// Late Night Blue / Starry Purple Theme

export const theme = {
  colors: {
    // 背景色
    background: '#0D0D1A',
    backgroundGradient: ['#0D0D1A', '#1A1A2E', '#2D2D44'],
    
    // 卡片色
    cardBackground: '#1A1A2E',
    cardBorder: '#2D2D44',
    cardHover: '#252540',
    
    // 主色调 - 星空紫
    primary: '#7B68EE',
    primaryDark: '#6A5ACD',
    primaryLight: '#9370DB',
    primaryGradient: ['#6A5ACD', '#7B68EE', '#9370DB'],
    
    // 强调色 - 深夜蓝
    accent: '#4B3F72',
    accentLight: '#5D5085',
    
    // 文字色
    text: '#FFFFFF',
    textSecondary: '#B8B8D0',
    textMuted: '#6B5B9F',
    textDisabled: '#3D3D5C',
    
    // 功能色
    success: '#4ECDC4',
    warning: '#FFD93D',
    danger: '#FF6B6B',
    info: '#4D96FF',
    
    // 状态色
    online: '#4ECDC4',
    offline: '#6B5B9F',
    away: '#FFD93D',
    busy: '#FF6B6B',
    
    // 通知色
    notification: '#FF6B6B',
    notificationBadge: '#FF4757',
    
    // 输入框
    inputBackground: '#252540',
    inputBorder: '#3D3D5C',
    inputPlaceholder: '#4B3F72',
    
    // 阴影
    shadow: {
      color: '#000000',
      opacity: 0.3,
    },
    
    // 渐变色
    gradients: {
      primary: ['#6A5ACD', '#7B68EE'],
      secondary: ['#4B3F72', '#6A5ACD'],
      success: ['#4ECDC4', '#44A08D'],
      danger: ['#FF6B6B', '#FF4757'],
      night: ['#0D0D1A', '#1A1A2E', '#2D2D44'],
      starry: ['#0D0D1A', '#16213E', '#1A1A2E'],
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    title: 28,
  },
  
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    large: {
      shadowColor: '#7B68EE',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    glow: {
      shadowColor: '#7B68EE',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    },
  },
};

export type Theme = typeof theme;
export default theme;
