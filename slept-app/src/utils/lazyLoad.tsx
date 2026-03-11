import React, { Suspense, ComponentType, useMemo } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

interface LazyLoadProps {
  fallback?: React.ReactNode;
}

/**
 * 懒加载组件工厂函数
 * 用于按需加载组件，减少初始包体积
 * 
 * @usage
 * const LoginScreen = lazyLoad(() => import('./screens/LoginScreen'));
 * const StatsScreen = lazyLoad(() => import('./components/StatsScreen'));
 */
export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
) {
  const LazyComponent = React.lazy(importFunc);
  
  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * 默认加载占位符
 */
function LoadingFallback() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.secondary.main} />
    </View>
  );
}

/**
 * 自定义加载占位符
 */
export function LoadingPlaceholder({ 
  message = '加载中...',
  size = 'large'
}: { 
  message?: string;
  size?: 'small' | 'large';
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.secondary.main} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  message: {
    marginTop: 16,
    color: colors.text.secondary,
    fontSize: 14,
  },
});

export default lazyLoad;
