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
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme';
import { validatePhone, validatePassword } from '../utils/validation';
import { ApiError, ApiErrorCode, handleApiError, getErrorTitle } from '../utils/apiErrorHandler';
import WechatLoginButton from '../components/WechatLoginButton';
import { wechatLogin, initWeChat } from '../utils/wechat';

interface LoginScreenProps {
  onLogin?: (phone: string, password: string) => Promise<void>;
  onWechatLogin?: () => Promise<void>;
  onNavigateToRegister?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onWechatLogin,
  onNavigateToRegister,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 优化：使用 useCallback 避免不必要的重渲染
  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text);
    // 用户开始修改时，立即清除错误提示
    if (phoneError) {
      setPhoneError('');
    }
  }, [phoneError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    // 用户开始修改时，立即清除错误提示
    if (passwordError) {
      setPasswordError('');
    }
  }, [passwordError]);

  // 新增：失焦时验证
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

  // 优化：增强的错误处理
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onLogin?.(phone, password);
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // 使用统一的错误处理
      const apiError = handleApiError(error);
      
      // 根据错误类型提供精确提示
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

  const handleWechatLogin = async () => {
    try {
      // 初始化微信 SDK（如果尚未初始化）
      await initWeChat();
      
      // 调用微信登录流程
      const result = await wechatLogin();
      
      // 登录成功，通知父组件
      if (onWechatLogin) {
        await onWechatLogin();
      }
      
      Alert.alert('登录成功', `欢迎回来，${result.userInfo.nickname || '微信用户'}`);
    } catch (error: any) {
      console.error('Wechat login failed:', error);
      
      // 用户取消授权不显示错误
      if (error.message?.includes('用户取消')) {
        return;
      }
      
      // 未安装微信的提示已在组件中处理
      if (error.message?.includes('未安装微信')) {
        return;
      }
      
      const apiError = handleApiError(error);
      Alert.alert(getErrorTitle(apiError.code), apiError.message || '微信登录失败，请重试');
    }
  };

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
                <TouchableOpacity
                  style={styles.visibilityIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Text style={styles.visibilityIconText}>
                    {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* 登录按钮 */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
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
            <WechatLoginButton
              onPress={handleWechatLogin}
              size="medium"
              style={styles.wechatButtonContainer}
            />

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
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.main,
    paddingHorizontal: spacing.md,
    ...shadows.small,
  },
  inputError: {
    borderColor: colors.border.error,
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
  },
  inputPrefix: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginRight: spacing.md,
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border.main,
  },
  input: {
    flex: 1,
    height: 52,
    color: colors.text.primary,
    fontSize: fontSize.md,
    paddingVertical: 0,
    letterSpacing: 0.3,
  },
  inputWithIcon: {
    paddingRight: spacing.md,
  },
  visibilityIcon: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  visibilityIconText: {
    fontSize: fontSize.lg,
  },
  errorText: {
    color: colors.text.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    fontWeight: fontWeight.medium,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
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
  wechatButtonContainer: {
    marginTop: spacing.md,
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
