import { Animated, Easing } from 'react-native';
import { colors } from './theme';

// 优化：统一动画时长配置
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 400,
};

// 优化：统一缓动函数配置
export const EASING = {
  STANDARD: Easing.out(Easing.cubic),
  BOUNCE: Easing.out(Easing.back(1.5)),
  ELASTIC: Easing.out(Easing.elastic(1)),
};

/**
 * 淡入动画（优化版）
 */
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.NORMAL,
  delay: number = 0
) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: EASING.STANDARD,
    useNativeDriver: true,  // ✅ 使用原生驱动
  });
};

/**
 * 淡出动画（优化版）
 */
export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.NORMAL,
  delay: number = 0
) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: EASING.STANDARD,
    useNativeDriver: true,
  });
};

/**
 * 滑入动画（从底部，优化版）
 */
export const slideInUp = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.NORMAL,
  delay: number = 0
) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: EASING.STANDARD,
    useNativeDriver: true,
  });
};

/**
 * 滑出动画（向底部，优化版）
 */
export const slideOutDown = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.NORMAL,
  delay: number = 0
) => {
  return Animated.timing(animatedValue, {
    toValue: 100,
    duration,
    delay,
    easing: EASING.STANDARD,
    useNativeDriver: true,
  });
};

/**
 * 缩放动画（优化版）
 */
export const scaleIn = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_DURATION.NORMAL,
  delay: number = 0
) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: EASING.BOUNCE,
    useNativeDriver: true,
  });
};

/**
 * 弹跳动画（优化版）
 */
export const bounce = (
  animatedValue: Animated.Value,
  duration: number = 500,
  delay: number = 0
) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.2,
      duration: duration * 0.4,
      delay,
      easing: EASING.STANDARD,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration * 0.6,
      easing: EASING.ELASTIC,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * 摇晃动画（用于错误提示，优化版）
 */
export const shake = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: 80,  // 优化：加快摇晃速度
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: 80,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: 80,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * 脉冲动画（优化版）
 */
export const pulse = (animatedValue: Animated.Value, duration: number = 1000) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: duration / 2,
        easing: EASING.STANDARD,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 2,
        easing: EASING.STANDARD,
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * 旋转动画（优化版）
 */
export const rotate = (
  animatedValue: Animated.Value,
  duration: number = 1000,
  loops: boolean = true
) => {
  const rotateAnim = Animated.timing(animatedValue, {
    toValue: 360,
    duration,
    easing: Easing.linear,
    useNativeDriver: true,
  });

  return loops ? Animated.loop(rotateAnim) : rotateAnim;
};

/**
 * 组合动画：淡入 + 上滑
 */
export const fadeInSlideUp = (
  fadeValue: Animated.Value,
  slideValue: Animated.Value,
  duration: number = 400,
  delay: number = 0
) => {
  return Animated.parallel([
    fadeIn(fadeValue, duration, delay),
    slideInUp(slideValue, duration, delay),
  ]);
};

/**
 * 交错动画（用于列表项）
 */
export const stagger = (
  animatedValues: Animated.Value[],
  duration: number = 300,
  staggerDelay: number = 100
) => {
  return Animated.stagger(
    staggerDelay,
    animatedValues.map((value) => fadeIn(value, duration))
  );
};

/**
 * 颜色渐变动画
 */
export const colorTransition = (
  animatedValue: Animated.Value,
  fromColor: string,
  toColor: string,
  duration: number = 300
) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.ease,
    useNativeDriver: false,
  });
};

/**
 * 获取插值颜色
 */
export const getInterpolatedColor = (
  animatedValue: Animated.Value,
  fromColor: string,
  toColor: string
) => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [fromColor, toColor],
  });
};
