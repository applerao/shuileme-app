// 睡了么 App - 打卡动画优化
// 使用原生驱动和高性能动画配置

import { Animated, Easing } from 'react-native';
import { ANIMATION_DURATION, EASING } from './animations';

/**
 * 打卡成功动画（组合动画）
 * 缩放 + 旋转 + 淡出效果
 */
export const checkinSuccess = (
  scaleValue: Animated.Value,
  rotateValue: Animated.Value,
  opacityValue: Animated.Value
) => {
  return Animated.parallel([
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.2,
        duration: ANIMATION_DURATION.FAST,
        easing: EASING.STANDARD,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: ANIMATION_DURATION.FAST,
        easing: EASING.BOUNCE,
        useNativeDriver: true,
      }),
    ]),
    Animated.timing(rotateValue, {
      toValue: 360,
      duration: ANIMATION_DURATION.NORMAL,
      easing: EASING.STANDARD,
      useNativeDriver: true,
    }),
    Animated.timing(opacityValue, {
      toValue: 0,
      duration: ANIMATION_DURATION.SLOW,
      delay: ANIMATION_DURATION.NORMAL,
      easing: EASING.STANDARD,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * 页面切换动画 - 从右滑入
 */
export const slideInRight = (
  translateXValue: Animated.Value,
  duration: number = ANIMATION_DURATION.NORMAL
) => {
  return Animated.timing(translateXValue, {
    toValue: 0,
    duration,
    easing: EASING.STANDARD,
    useNativeDriver: true,
  });
};

/**
 * 页面切换动画 - 向左滑出
 */
export const slideOutLeft = (
  translateXValue: Animated.Value,
  duration: number = ANIMATION_DURATION.NORMAL
) => {
  return Animated.timing(translateXValue, {
    toValue: -100,
    duration,
    easing: EASING.STANDARD,
    useNativeDriver: true,
  });
};

/**
 * 页面切换动画 - 淡入
 */
export const pageFadeIn = (
  opacityValue: Animated.Value,
  duration: number = ANIMATION_DURATION.NORMAL
) => {
  return Animated.timing(opacityValue, {
    toValue: 1,
    duration,
    easing: EASING.STANDARD,
    useNativeDriver: true,
  });
};

/**
 * 页面切换动画 - 淡出
 */
export const pageFadeOut = (
  opacityValue: Animated.Value,
  duration: number = ANIMATION_DURATION.NORMAL
) => {
  return Animated.timing(opacityValue, {
    toValue: 0,
    duration,
    easing: EASING.STANDARD,
    useNativeDriver: true,
  });
};

/**
 * 按钮按压动画（缩放反馈）
 */
export const buttonPress = (
  scaleValue: Animated.Value,
  onPress: () => void
) => {
  return Animated.sequence([
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: ANIMATION_DURATION.FAST,
      easing: EASING.STANDARD,
      useNativeDriver: true,
    }),
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: ANIMATION_DURATION.FAST,
      easing: EASING.BOUNCE,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * 列表项交错动画
 * 优化：使用 removeClippedSubviews 和 maxToRenderPerBatch
 */
export const staggeredList = (
  values: Animated.Value[],
  delay: number = 50
) => {
  return Animated.stagger(
    delay,
    values.map((value) =>
      Animated.timing(value, {
        toValue: 1,
        duration: ANIMATION_DURATION.NORMAL,
        easing: EASING.STANDARD,
        useNativeDriver: true,
      })
    )
  );
};

/**
 * 脉冲加载动画（优化版）
 * 用于加载状态指示器
 */
export const pulseLoading = (
  scaleValue: Animated.Value,
  opacityValue: Animated.Value
) => {
  return Animated.loop(
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: ANIMATION_DURATION.SLOW,
          easing: EASING.STANDARD,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: ANIMATION_DURATION.SLOW,
          easing: EASING.STANDARD,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 0.6,
          duration: ANIMATION_DURATION.SLOW,
          easing: EASING.STANDARD,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: ANIMATION_DURATION.SLOW,
          easing: EASING.STANDARD,
          useNativeDriver: true,
        }),
      ]),
    ])
  );
};

/**
 * 进度条动画
 */
export const progressBar = (
  widthValue: Animated.Value,
  toWidth: number,
  duration: number = ANIMATION_DURATION.SLOW
) => {
  return Animated.timing(widthValue, {
    toValue: toWidth,
    duration,
    easing: EASING.STANDARD,
    useNativeDriver: false, // 宽度变化需要使用 layout 动画
  });
};

/**
 * 数字计数动画
 */
export const countUp = (
  value: Animated.Value,
  toValue: number,
  duration: number = ANIMATION_DURATION.SLOW
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: EASING.STANDARD,
    useNativeDriver: false,
  });
};

/**
 * 优化建议：
 * 1. 所有动画使用 useNativeDriver: true 以获得最佳性能
 * 2. 避免在动画中使用 layout 属性（width/height/top/left）
 * 3. 使用 transform (scale/translate/rotate) 代替 layout 属性
 * 4. 组件卸载时确保清理所有动画
 * 5. 使用 Animated.Event 直接驱动动画以减少重渲染
 */
