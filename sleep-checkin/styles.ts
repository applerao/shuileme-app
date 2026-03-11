import { StyleSheet } from 'react-native';

// Color Palette
export const colors = {
  // Background colors
  background: '#1a1a2e',
  card: '#16213e',
  cardLight: '#1f2f54',
  
  // Primary colors
  primary: '#3498db',
  primaryDark: '#2980b9',
  primaryLight: '#5dade2',
  
  // Success colors
  success: '#4CAF50',
  successDark: '#388E3C',
  successLight: '#81C784',
  
  // Warning colors
  warning: '#FF9800',
  warningDark: '#F57C00',
  warningLight: '#FFB74D',
  
  // Error colors
  error: '#F44336',
  errorDark: '#D32F2F',
  errorLight: '#EF5350',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textDisabled: '#666666',
  
  // Special colors
  bedtime: '#2c3e50',
  bedtimeActive: '#3498db',
  wakeup: '#f39c12',
  wakeupActive: '#e74c3c',
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Border Radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  circle: 9999,
};

// Typography
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Common Styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPrimary: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonDisabled: {
    backgroundColor: colors.textDisabled,
    opacity: 0.5,
  },
});

// Animation Configs
export const animations = {
  timing: {
    duration: 300,
    useNativeDriver: true,
  },
  spring: {
    tension: 50,
    friction: 7,
    useNativeDriver: true,
  },
  longPress: {
    duration: 2000,
  },
  vibration: {
    pattern: [0, 100, 50, 100],
    success: [0, 200],
    error: [0, 100, 100, 100],
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  commonStyles,
  animations,
};
