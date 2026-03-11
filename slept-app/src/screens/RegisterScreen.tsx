import React, { useState, useEffect, useCallback } from 'react';
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
import {
  validatePhone,
  validatePassword,
  validateCode,
  validateConfirmPassword,
  validateAgreement,
  getPasswordStrength,
} from '../utils/validation';
import { ApiError, ApiErrorCode, handleApiError, getErrorTitle } from '../utils/apiErrorHandler';

interface RegisterScreenProps {
  onRegister?: (
    phone: string,
    code: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  onNavigateToLogin?: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onNavigateToLogin,
}) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const [phoneError, setPhoneError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [agreementError, setAgreementError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  // 新增：密码强度
  const [passwordStrength, setPasswordStrength] = useState<{ strength: 'weak' | 'medium' | 'strong', message: string } | null>(null);

  // 倒计时逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // 优化：使用 useCallback 避免不必要的重渲染
  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text);
    // 用户开始修改时，立即清除错误提示
    if (phoneError) {
      setPhoneError('');
    }
  }, [phoneError]);

  const handleCodeChange = useCallback((text: string) => {
    setCode(text);
    // 用户开始修改时，立即清除错误提示
    if (codeError) {
      setCodeError('');
    }
  }, [codeError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    // 更新密码强度
    if (text) {
      const strength = getPasswordStrength(text);
      setPasswordStrength({ strength: strength.strength, message: strength.message });
    } else {
      setPasswordStrength(null);
    }
    
    // 用户开始修改时，立即清除错误提示
    if (passwordError) {
      setPasswordError('');
    }
    
    // 如果确认密码已输入，重新验证
    if (confirmPassword && confirmPasswordError) {
      const result = validateConfirmPassword(text, confirmPassword);
      setConfirmPasswordError(result.isValid ? '' : result.message || '');
    }
  }, [passwordError, confirmPassword, confirmPasswordError]);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    // 实时验证密码一致性
    if (text && password) {
      const result = validateConfirmPassword(password, text);
      setConfirmPasswordError(result.isValid ? '' : result.message || '');
    } else {
      setConfirmPasswordError('');
    }
  }, [password]);

  const handleAgreementToggle = useCallback(() => {
    setAgreementAccepted(!agreementAccepted);
    if (agreementError) {
      setAgreementError('');
    }
  }, [agreementAccepted, agreementError]);

  // 优化：增强的验证码发送错误处理
  const sendVerificationCode = async () => {
    const phoneResult = validatePhone(phone);
    if (!phoneResult.isValid) {
      setPhoneError(phoneResult.message || '');
      return;
    }

    setIsSendingCode(true);
    try {
      // TODO: 调用发送验证码 API
      console.log('Sending verification code to:', phone);
      
      // 模拟发送成功
      Alert.alert('验证码已发送', '验证码已发送到您的手机，请注意查收', [
        { text: '知道了', style: 'default' },
      ]);
      
      // 开始倒计时
      setCountdown(60);
    } catch (error: any) {
      console.error('Failed to send code:', error);
      
      // 使用统一的错误处理
      const apiError = handleApiError(error);
      
      if (apiError.code === ApiErrorCode.RATE_LIMIT_EXCEEDED) {
        Alert.alert('发送频繁', '操作过于频繁，请 60 秒后再试');
      } else if (apiError.code === ApiErrorCode.INVALID_PHONE) {
        setPhoneError('手机号格式不正确');
        Alert.alert('发送失败', '请检查手机号格式');
      } else {
        Alert.alert(getErrorTitle(apiError.code), apiError.message || '请稍后重试');
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const validateForm = (): boolean => {
    const phoneResult = validatePhone(phone);
    const codeResult = validateCode(code);
    const passwordResult = validatePassword(password);
    const confirmPasswordResult = validateConfirmPassword(password, confirmPassword);
    const agreementResult = validateAgreement(agreementAccepted);

    setPhoneError(phoneResult.isValid ? '' : phoneResult.message || '');
    setCodeError(codeResult.isValid ? '' : codeResult.message || '');
    setPasswordError(passwordResult.isValid ? '' : passwordResult.message || '');
    setConfirmPasswordError(confirmPasswordResult.isValid ? '' : confirmPasswordResult.message || '');
    setAgreementError(agreementResult.isValid ? '' : agreementResult.message || '');

    return (
      phoneResult.isValid &&
      codeResult.isValid &&
      passwordResult.isValid &&
      confirmPasswordResult.isValid &&
      agreementResult.isValid
    );
  };

  // 优化：增强的注册错误处理
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onRegister?.(phone, code, password, confirmPassword);
    } catch (error: any) {
      console.error('Register failed:', error);
      
      // 使用统一的错误处理
      const apiError = handleApiError(error);
      
      // 根据错误类型提供精确提示
      switch (apiError.code) {
        case ApiErrorCode.PHONE_ALREADY_REGISTERED:
          Alert.alert('提示', '该手机号已注册，请直接登录', [
            { text: '取消', style: 'cancel' },
            { text: '去登录', onPress: onNavigateToLogin },
          ]);
          break;
        case ApiErrorCode.INVALID_CODE:
          setCodeError('验证码错误');
          Alert.alert('注册失败', '验证码错误，请重试');
          break;
        case ApiErrorCode.CODE_EXPIRED:
          setCodeError('验证码已过期');
          Alert.alert('验证码过期', '请重新获取验证码');
          setCountdown(0);  // 重置倒计时
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
          {/* 头部 */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>🌙</Text>
              </View>
              <Text style={styles.appName}>睡了么</Text>
              <Text style={styles.tagline}>创建新账号</Text>
            </View>
          </View>

          {/* 注册表单 */}
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
                  keyboardType="phone-pad"
                  maxLength={11}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={countdown === 0}
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>

            {/* 验证码输入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>验证码</Text>
              <View style={[styles.codeInputWrapper, codeError && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="请输入验证码"
                  placeholderTextColor={colors.text.secondary}
                  value={code}
                  onChangeText={handleCodeChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[
                    styles.getCodeButton,
                    (isSendingCode || countdown > 0) && styles.getCodeButtonDisabled,
                  ]}
                  onPress={sendVerificationCode}
                  disabled={isSendingCode || countdown > 0}
                >
                  {isSendingCode ? (
                    <ActivityIndicator size="small" color={colors.secondary.main} />
                  ) : (
                    <Text
                      style={[
                        styles.getCodeButtonText,
                        (isSendingCode || countdown > 0) && styles.getCodeButtonTextDisabled,
                      ]}
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}
            </View>

            {/* 密码输入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>密码</Text>
              <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="请设置密码"
                  placeholderTextColor={colors.text.secondary}
                  value={password}
                  onChangeText={handlePasswordChange}
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
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : passwordStrength ? (
                <Text
                  style={[
                    styles.passwordHint,
                    passwordStrength.strength === 'weak' && styles.hintError,
                    passwordStrength.strength === 'medium' && styles.hintMedium,
                    passwordStrength.strength === 'strong' && styles.hintSuccess,
                  ]}
                >
                  {passwordStrength.message}
                </Text>
              ) : null}
            </View>

            {/* 确认密码 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>确认密码</Text>
              <View style={[styles.inputWrapper, confirmPasswordError && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="请再次输入密码"
                  placeholderTextColor={colors.text.secondary}
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={!isConfirmPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.visibilityIcon}
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                >
                  <Text style={styles.visibilityIconText}>
                    {isConfirmPasswordVisible ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            {/* 用户协议 */}
            <View style={styles.agreementGroup}>
              <TouchableOpacity
                style={styles.agreementCheckbox}
                onPress={handleAgreementToggle}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreementAccepted && styles.checkboxChecked]}>
                  {agreementAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
              <Text style={styles.agreementText}>
                我已阅读并同意
                <Text style={styles.agreementLink}>《用户协议》</Text>
                和
                <Text style={styles.agreementLink}>《隐私政策》</Text>
              </Text>
            </View>
            {agreementError ? <Text style={styles.errorText}>{agreementError}</Text> : null}

            {/* 注册按钮 */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.primary} size="small" />
              ) : (
                <Text style={styles.registerButtonText}>注册</Text>
              )}
            </TouchableOpacity>

            {/* 登录链接 */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>已有账号？</Text>
              <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
                <Text style={styles.loginLink}>立即登录</Text>
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
    marginBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  logoText: {
    fontSize: 36,
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
  codeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.main,
    paddingHorizontal: spacing.md,
    ...shadows.small,
  },
  codeInput: {
    flex: 1,
  },
  getCodeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginLeft: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
  },
  getCodeButtonDisabled: {
    opacity: 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  getCodeButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  getCodeButtonTextDisabled: {
    color: colors.text.disabled,
  },
  errorText: {
    color: colors.text.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    fontWeight: fontWeight.medium,
  },
  passwordHint: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    fontWeight: fontWeight.medium,
  },
  hintError: {
    color: colors.text.error,
  },
  hintMedium: {
    color: colors.text.secondary,
  },
  hintSuccess: {
    color: colors.text.success,
  },
  agreementGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  agreementCheckbox: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: fontWeight.bold,
  },
  agreementText: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  agreementLink: {
    color: colors.primaryLight,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
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
  loginLink: {
    color: colors.secondary.light,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
});

export default RegisterScreen;
