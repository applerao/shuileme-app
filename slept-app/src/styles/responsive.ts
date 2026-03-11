import { Dimensions, Platform, StatusBar } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from './theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 常见设备尺寸
const IPHONE_SE_WIDTH = 375;
const IPHONE_PRO_MAX_WIDTH = 428;
const IPAD_WIDTH = 768;

// 响应式尺寸计算
export const responsive = {
  // 根据屏幕宽度缩放
  width: (size: number) => {
    return (SCREEN_WIDTH / IPHONE_SE_WIDTH) * size;
  },
  
  // 根据屏幕高度缩放
  height: (size: number) => {
    return (SCREEN_HEIGHT / 812) * size;
  },
  
  // 字体缩放
  font: (size: number) => {
    const scale = SCREEN_WIDTH / IPHONE_SE_WIDTH;
    const newSize = size * scale;
    // 限制字体大小变化范围
    return Math.max(size * 0.9, Math.min(size * 1.2, newSize));
  },
  
  // 间距缩放
  spacing: (size: number) => {
    const scale = SCREEN_WIDTH / IPHONE_SE_WIDTH;
    return Math.round(size * scale);
  },
};

// 安全区域处理
export const safeArea = {
  paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  paddingBottom: Platform.OS === 'ios' ? 34 : 0,
};

// 判断设备类型
export const deviceType = {
  isSmall: SCREEN_WIDTH < IPHONE_SE_WIDTH,
  isMedium: SCREEN_WIDTH >= IPHONE_SE_WIDTH && SCREEN_WIDTH < IPHONE_PRO_MAX_WIDTH,
  isLarge: SCREEN_WIDTH >= IPHONE_PRO_MAX_WIDTH,
  isTablet: SCREEN_WIDTH >= IPAD_WIDTH,
};

// 断点
export const breakpoints = {
  xs: 320,
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
};

// 常用布局样式
export const layoutStyles = {
  // 居中容器
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 全屏容器
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // 卡片样式
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  
  // 分隔线
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  
  // 阴影
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// 动画配置
export const animationConfig = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  spring: {
    damping: 0.8,
    mass: 1,
    stiffness: 100,
  },
};

// 键盘处理
export const keyboardConfig = {
  keyboardShouldPersistTaps: 'handled' as const,
  keyboardDismissMode: Platform.OS === 'ios' ? 'interactive' : 'on-drag',
};

// 辅助函数：获取合适的输入框高度
export const getInputHeight = () => {
  return deviceType.isSmall ? 44 : 50;
};

// 辅助函数：获取合适的按钮高度
export const getButtonHeight = () => {
  return deviceType.isSmall ? 44 : 50;
};
