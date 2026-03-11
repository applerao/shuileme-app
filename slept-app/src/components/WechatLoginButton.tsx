import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme';
import { isWeChatInstalled } from '../utils/wechat';

interface WechatLoginButtonProps {
  onPress: () => Promise<void>;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

const WechatLoginButton: React.FC<WechatLoginButtonProps> = ({
  onPress,
  disabled = false,
  size = 'medium',
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [wechatInstalled, setWechatInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    // 检查微信是否已安装
    const checkWeChat = async () => {
      const installed = await isWeChatInstalled();
      setWechatInstalled(installed);
    };
    checkWeChat();
  }, []);

  const handlePress = async () => {
    if (disabled || isLoading) {
      return;
    }

    if (wechatInstalled === false) {
      Alert.alert(
        '提示',
        '检测到您未安装微信 App，请先安装微信后再使用微信登录功能',
        [{ text: '知道了' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      await onPress();
    } catch (error: any) {
      console.error('微信登录失败:', error);
      // 错误由父组件处理，这里只重置状态
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyles = [
    styles.button,
    styles[size],
    disabled && styles.disabled,
    isLoading && styles.loading,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || isLoading || wechatInstalled === false}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <View style={styles.content}>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.text}>
            {wechatInstalled === false ? '未安装微信' : '微信登录'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  small: {
    height: 40,
    paddingHorizontal: spacing.lg,
  },
  medium: {
    height: 50,
    paddingHorizontal: spacing.xl,
  },
  large: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.border,
  },
  loading: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  text: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
  },
});

export default WechatLoginButton;
