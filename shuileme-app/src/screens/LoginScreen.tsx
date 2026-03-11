import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme';
import { validatePhone, validatePassword } from '../utils/validation';
import { ApiError, ApiErrorCode, handleApiError, getErrorTitle } from '../utils/apiErrorHandler';
import useWechatLogin from '../hooks/useWechatLogin';

interface LoginScreenProps {
  onLogin?: (phone: string, password: string) => Promise<void>;
  onNavigateToRegister?: () => void;
  onLoginSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 使用微信登录 Hook
  const {
    isLoading: isWechatLoading,
    isWeChatAvailable,
    wechatLogin,
  } = useWechatLogin();

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text);
    if (phoneError) {
      setPhoneError('');
    }
  }, [phoneError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError('');
    }
  }, [passwordError]);

  const handlePhoneBlur = useCallback(() => {
    if (phone && phone.trim() !== '') {
      const result = validatePhone(phone);
      setPhoneError(result.isValid ? '' : result.message || '');
    }
  }, [phone]);

  const handlePasswordBlur = useCallback(() => {
    if (password && password.trim() !== '') {
      const result = validatePassword(password);
      setPasswordError(result.isValid ? '' : result.message || '');
    }
  }, [password]);

  const validateForm = (): boolean => {
    const phoneResult = validatePhone(phone);
    const passwordResult = validatePassword(password);

    setPhoneError(phoneResult.isValid ? '' : phoneResult.message || '');
    setPasswordError(passwordResult.isValid ? '' : passwordResult.message || '');

    return phoneResult.isValid && passwordResult.isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onLogin?.(phone, password);
      onLoginSuccess?.();
    } catch (error: any) {
      console.error('Login failed:', error);
      
      const apiError = handleApiError(error);
      
      switch (apiError.code) {
        case ApiErrorCode.USER_NOT_FOUND:
          Alert.alert('提示', '该手机号未注册', [
            { text: '取消', style: 'cancel' },
            { text: '去注册', onPress: onNavigateToRegister },
          ]);
          break;
        case ApiErrorCode.INVALID_PASSWORD:
          setPasswordError('密码错误');
          Alert.alert('登录失败', '密码错误，请重试');
          break;
        case ApiErrorCode.ACCOUNT_LOCKED:
          Alert.alert('账号锁定', '账号已被锁定，请联系客服');
          break;
        case ApiErrorCode.UNAUTHORIZED:
          Alert.alert('登录失败', '账号或密码错误');
          break;
        case ApiErrorCode.NETWORK_ERROR:
          Alert.alert('网络错误', '请检查网络连接后重试');
          break;
        case ApiErrorCode.TIMEOUT:
          Alert.alert('请求超时', '请检查网络后重试');
          break;
        default:
          Alert.alert(getErrorTitle(apiError.code), apiError.message || '请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWechatLoginPress = async () => {
    try {
      await wechatLogin();
      onLoginSuccess?.();
    } catch (error: any) {
      console.error('Wechat login failed:', error);
      // 错误已在 hook 中处理
    }
  };

  const isLoadingState = isLoading || isWechatLoading;

  return (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo 区域 */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>🌙</Text>
              </View>
              <Text style={styles.appName}>睡了么</Text>
              <Text style={styles.tagline}>晚安，好梦</Text>
            </View>
          </View>

          {/* 登录表单 */}
          <View style={styles.formContainer}>
            {/* 手机号输入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>手机号</Text>
              <View style={[styles.inputWrapper, phoneError && styles.inputError]}>
                <Text style={styles.inputPrefix}>+86</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入手机号"
                  placeholderTextColor={colors.text.secondary}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  keyboardType="phone-pad"
                  maxLength={11}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>

            {/* 密码输入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>密码</Text>
              <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="请输入密码"
                  placeholderTextColor={colors.text.secondary}
                  value={password}
                  onChangeText={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* 登录按钮 */}
            <TouchableOpacity
              style={[styles.loginButton, isLoadingState && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoadingState}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.primary} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>登录</Text>
              )}
            </TouchableOpacity>

            {/* 分割线 */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>其他登录方式</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 微信登录按钮 */}
            <TouchableOpacity
              style={[
                styles.wechatButton,
                !isWeChatAvailable && styles.wechatButtonDisabled,
              ]}
              onPress={handleWechatLoginPress}
              disabled={!isWeChatAvailable || isWechatLoading}
              activeOpacity={0.8}
            >
              {isWechatLoading ? (
                <ActivityIndicator color={colors.text.primary} size="small" />
              ) : (
                <>
                  <Text style={styles.wechatIcon}>💬</Text>
                  <Text style={styles.wechatButtonText}>
                    {isWeChatAvailable ? '微信登录' : '未安装微信'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* 注册链接 */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>还没有账号？</Text>
              <TouchableOpacity onPress={onNavigateToRegister} activeOpacity={0.7}>
                <Text style={styles.registerLink}>立即注册</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.regular,
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.md,
    ...shadows.small,
  },
  inputError: {
    borderColor: colors.border.error,
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
  },
  inputPrefix: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginRight: spacing.sm,
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.border.light,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.text.primary,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  inputWithIcon: {
    paddingRight: spacing.md,
  },
  errorText: {
    color: colors.text.error,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  loginButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.lg,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.medium,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    marginHorizontal: spacing.md,
  },
  wechatButton: {
    flexDirection: 'row',
    backgroundColor: colors.wechat,
    borderRadius: borderRadius.lg,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  wechatButtonDisabled: {
    backgroundColor: colors.border.light,
  },
  wechatIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  wechatButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  registerLink: {
    color: colors.secondary.light,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
});

export default LoginScreen;
