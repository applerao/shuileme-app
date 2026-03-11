import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../src/styles/theme';

interface DataCardProps {
  title: string;
  value: string;
  unit?: string;
  icon?: string;
  gradientColors?: [string, string];
  isScore?: boolean;
}

/**
 * 优化后的 DataCard 组件
 * 使用 React.memo 避免不必要的重渲染
 */
const DataCard = memo<DataCardProps>(({
  title,
  value,
  unit = '',
  icon = '📊',
  gradientColors,
  isScore = false,
}) => {
  // 使用 useMemo 缓存样式计算
  const cardStyle = useMemo(() => ([
    styles.card,
    gradientColors && {
      backgroundColor: gradientColors[0],
    },
  ]), [gradientColors]);

  const valueStyle = useMemo(() => ([
    styles.value,
    isScore && valueStyleScore,
  ]), [isScore]);

  return (
    <View style={cardStyle}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={valueStyle}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，仅在 props 真正变化时重渲染
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.unit === nextProps.unit &&
    prevProps.icon === nextProps.icon &&
    prevProps.isScore === nextProps.isScore &&
    JSON.stringify(prevProps.gradientColors) === JSON.stringify(nextProps.gradientColors)
  );
});

DataCard.displayName = 'DataCard';

/**
 * 懒加载图片组件
 * 支持占位图和渐显效果
 */
interface LazyImageProps {
  source: any;
  style?: any;
  placeholderColor?: string;
  cachePolicy?: 'memory-only' | 'memory-disk' | 'none';
}

const LazyImage = memo<LazyImageProps>(({
  source,
  style,
  placeholderColor = colors.background.card,
  cachePolicy = 'memory-disk',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageStyle = useMemo(() => ([
    style,
    !isLoaded && { opacity: 0 },
  ]), [style, isLoaded]);

  const placeholderStyle = useMemo(() => ([
    style,
    styles.placeholder,
    { backgroundColor: placeholderColor },
    isLoaded && styles.hidden,
  ]), [style, placeholderColor, isLoaded]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  if (hasError) {
    return <View style={[style, styles.errorContainer]} />;
  }

  return (
    <View style={styles.imageContainer}>
      <View style={placeholderStyle} />
      <Image
        source={source}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        cachePolicy={cachePolicy}
        fadeDuration={isLoaded ? 300 : 0}
      />
      {!isLoaded && (
        <ActivityIndicator
          size="small"
          color={colors.secondary.main}
          style={styles.loader}
        />
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.source === nextProps.source &&
    prevProps.placeholderColor === nextProps.placeholderColor &&
    prevProps.cachePolicy === nextProps.cachePolicy
  );
});

LazyImage.displayName = 'LazyImage';

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  iconContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  valueStyleScore: {
    color: colors.secondary.main,
  },
  unit: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  imageContainer: {
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hidden: {
    opacity: 0,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
  errorContainer: {
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { DataCard, LazyImage };
export default DataCard;
