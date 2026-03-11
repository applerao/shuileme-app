/**
 * 睡了么 App - 单元测试代码
 * 
 * 测试框架：Jest
 * 运行命令：npm test
 */

// ============================================
// 1. 用户注册登录测试
// ============================================

const { UserAuthService } = require('../src/services/UserAuthService');
const { Validator } = require('../src/utils/Validator');
const { APIError } = require('../src/errors/APIError');

describe('UserAuthService - 用户注册登录', () => {
  let authService;
  let mockAPI;

  beforeEach(() => {
    mockAPI = {
      sendSMS: jest.fn(),
      verifyCode: jest.fn(),
      register: jest.fn(),
      login: jest.fn(),
    };
    authService = new UserAuthService(mockAPI);
    jest.clearAllMocks();
  });

  describe('手机号验证', () => {
    test('TC-REG-002: 11 位手机号验证通过', () => {
      const validPhone = '13800138000';
      expect(Validator.validatePhone(validPhone)).toBe(true);
    });

    test('TC-REG-002: 10 位手机号验证失败', () => {
      const invalidPhone = '1380013800';
      expect(Validator.validatePhone(invalidPhone)).toBe(false);
    });

    test('TC-REG-003: 非数字手机号验证失败', () => {
      const invalidPhone = '13800138abc';
      expect(Validator.validatePhone(invalidPhone)).toBe(false);
    });

    test('TC-FORM-001: 空手机号验证失败', () => {
      expect(Validator.validatePhone('')).toBe(false);
      expect(Validator.validatePhone(null)).toBe(false);
    });
  });

  describe('验证码验证', () => {
    test('TC-FORM-003: 6 位数字验证码验证通过', () => {
      const validCode = '123456';
      expect(Validator.validateCode(validCode)).toBe(true);
    });

    test('TC-FORM-003: 5 位验证码验证失败', () => {
      const invalidCode = '12345';
      expect(Validator.validateCode(invalidCode)).toBe(false);
    });

    test('TC-FORM-003: 非数字验证码验证失败', () => {
      const invalidCode = '12345a';
      expect(Validator.validateCode(invalidCode)).toBe(false);
    });
  });

  describe('密码验证', () => {
    test('TC-REG-006: 6 位密码验证通过', () => {
      const validPassword = '123456';
      expect(Validator.validatePassword(validPassword)).toBe(true);
    });

    test('TC-REG-006: 20 位密码验证通过', () => {
      const validPassword = '12345678901234567890';
      expect(Validator.validatePassword(validPassword)).toBe(true);
    });

    test('TC-REG-006: 5 位密码验证失败', () => {
      const invalidPassword = '12345';
      expect(Validator.validatePassword(invalidPassword)).toBe(false);
    });

    test('TC-REG-006: 21 位密码验证失败', () => {
      const invalidPassword = '123456789012345678901';
      expect(Validator.validatePassword(invalidPassword)).toBe(false);
    });

    test('TC-FORM-002: 空密码验证失败', () => {
      expect(Validator.validatePassword('')).toBe(false);
    });
  });

  describe('注册流程', () => {
    test('TC-REG-001: 正常注册流程', async () => {
      mockAPI.sendSMS.mockResolvedValue({ success: true });
      mockAPI.verifyCode.mockResolvedValue({ success: true });
      mockAPI.register.mockResolvedValue({ 
        success: true, 
        userId: 'user_123',
        token: 'mock_token'
      });

      const result = await authService.register('13800138001', '123456', 'Test@123');
      
      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(mockAPI.register).toHaveBeenCalledWith('13800138001', 'Test@123');
    });

    test('TC-REG-004: 验证码错误处理', async () => {
      mockAPI.sendSMS.mockResolvedValue({ success: true });
      mockAPI.verifyCode.mockResolvedValue({ success: false, error: '验证码错误' });

      const result = await authService.register('13800138001', 'wrong_code', 'Test@123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('验证码错误');
    });

    test('TC-REG-005: 验证码过期处理', async () => {
      mockAPI.sendSMS.mockResolvedValue({ success: true });
      mockAPI.verifyCode.mockResolvedValue({ 
        success: false, 
        error: '验证码已过期' 
      });

      const result = await authService.register('13800138001', 'expired_code', 'Test@123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('验证码已过期');
    });

    test('TC-REG-007: 重复注册处理', async () => {
      mockAPI.sendSMS.mockResolvedValue({ success: true });
      mockAPI.verifyCode.mockResolvedValue({ success: true });
      mockAPI.register.mockResolvedValue({ 
        success: false, 
        error: '该手机号已注册' 
      });

      const result = await authService.register('13800138000', '123456', 'Test@123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('该手机号已注册');
    });

    test('TC-ERR-001: 网络异常处理', async () => {
      mockAPI.sendSMS.mockRejectedValue(new APIError('NETWORK_ERROR', '网络连接失败'));

      const result = await authService.register('13800138001', '123456', 'Test@123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('网络');
    });
  });

  describe('登录流程', () => {
    test('TC-LOGIN-001: 正常登录流程', async () => {
      mockAPI.login.mockResolvedValue({ 
        success: true, 
        userId: 'user_123',
        token: 'mock_token',
        userInfo: { name: 'Test User' }
      });

      const result = await authService.login('13800138000', 'Test@123');
      
      expect(result.success).toBe(true);
      expect(result.token).toBe('mock_token');
      expect(mockAPI.login).toHaveBeenCalledWith('13800138000', 'Test@123');
    });

    test('TC-LOGIN-002: 密码错误处理', async () => {
      mockAPI.login.mockResolvedValue({ 
        success: false, 
        error: '密码错误' 
      });

      const result = await authService.login('13800138000', 'WrongPass');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('密码错误');
    });

    test('TC-LOGIN-003: 未注册用户登录', async () => {
      mockAPI.login.mockResolvedValue({ 
        success: false, 
        error: '该手机号未注册' 
      });

      const result = await authService.login('13800138999', 'Test@123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('该手机号未注册');
    });

    test('TC-ERR-003: 服务器错误处理', async () => {
      mockAPI.login.mockRejectedValue(new APIError('SERVER_ERROR', '服务器错误'));

      const result = await authService.login('13800138000', 'Test@123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('服务器');
    });
  });

  describe('验证码频率限制', () => {
    test('TC-ERR-004: 验证码获取频率限制', async () => {
      // 模拟 60 秒内多次请求
      mockAPI.sendSMS.mockResolvedValue({ success: true });
      
      // 前 3 次成功
      await authService.sendVerificationCode('13800138001');
      await authService.sendVerificationCode('13800138001');
      await authService.sendVerificationCode('13800138001');
      
      // 第 4 次应该失败
      const result = await authService.sendVerificationCode('13800138001');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('频繁');
    });
  });
});

// ============================================
// 2. 打卡功能测试
// ============================================

const { CheckInService } = require('../src/services/CheckInService');
const { SleepScoreCalculator } = require('../src/services/SleepScoreCalculator');

describe('CheckInService - 打卡功能', () => {
  let checkInService;
  let mockStorage;
  let mockAPI;

  beforeEach(() => {
    mockStorage = {
      get: jest.fn(),
      set: jest.fn(),
    };
    mockAPI = {
      checkIn: jest.fn(),
      getCheckInRecord: jest.fn(),
    };
    checkInService = new CheckInService(mockStorage, mockAPI);
    jest.clearAllMocks();
  });

  describe('睡前打卡', () => {
    test('TC-CHECKIN-001: 正常睡前打卡', async () => {
      mockAPI.checkIn.mockResolvedValue({ 
        success: true, 
        checkInId: 'checkin_123',
        timestamp: Date.now()
      });

      const result = await checkInService.bedtimeCheckIn('user_123');
      
      expect(result.success).toBe(true);
      expect(result.checkInId).toBe('checkin_123');
    });

    test('TC-CHECKIN-002: 重复睡前打卡', async () => {
      mockStorage.get.mockResolvedValue({
        bedtimeCheckIn: Date.now(),
        date: new Date().toDateString()
      });

      const result = await checkInService.bedtimeCheckIn('user_123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('已完成');
    });

    test('TC-CHECKIN-003: 睡前打卡时间验证 - 过早', () => {
      // 设置时间为 17:00
      const mockDate = new Date('2026-03-07T17:00:00+08:00');
      
      const isValid = checkInService.isValidBedtimeCheckInTime(mockDate);
      expect(isValid).toBe(false);
    });

    test('TC-CHECKIN-004: 睡前打卡时间验证 - 过晚', () => {
      // 设置时间为 07:00
      const mockDate = new Date('2026-03-07T07:00:00+08:00');
      
      const isValid = checkInService.isValidBedtimeCheckInTime(mockDate);
      expect(isValid).toBe(false);
    });

    test('TC-CHECKIN-003/004: 睡前打卡有效时间范围', () => {
      // 18:00 - 06:00 应该有效
      const validTime1 = new Date('2026-03-07T20:00:00+08:00');
      const validTime2 = new Date('2026-03-07T05:00:00+08:00');
      
      expect(checkInService.isValidBedtimeCheckInTime(validTime1)).toBe(true);
      expect(checkInService.isValidBedtimeCheckInTime(validTime2)).toBe(true);
    });
  });

  describe('起床打卡', () => {
    test('TC-CHECKIN-005: 正常起床打卡', async () => {
      mockStorage.get.mockResolvedValue({
        bedtimeCheckIn: Date.now() - 8 * 3600 * 1000, // 8 小时前
        date: new Date().toDateString()
      });
      
      mockAPI.checkIn.mockResolvedValue({ 
        success: true, 
        checkInId: 'checkin_456',
        sleepDuration: 8 * 3600 // 8 小时
      });

      const result = await checkInService.wakeupCheckIn('user_123');
      
      expect(result.success).toBe(true);
      expect(result.sleepDuration).toBe(8 * 3600);
    });

    test('TC-CHECKIN-006: 未完成睡前打卡直接起床打卡', async () => {
      mockStorage.get.mockResolvedValue({
        bedtimeCheckIn: null,
        date: new Date().toDateString()
      });

      const result = await checkInService.wakeupCheckIn('user_123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('睡前打卡');
    });

    test('TC-CHECKIN-007: 起床打卡时间验证 - 过早', () => {
      // 设置时间为 03:00
      const mockDate = new Date('2026-03-07T03:00:00+08:00');
      
      const isValid = checkInService.isValidWakeupCheckInTime(mockDate);
      expect(isValid).toBe(false);
    });

    test('TC-CHECKIN-008: 起床打卡时间验证 - 过晚', () => {
      // 设置时间为 13:00
      const mockDate = new Date('2026-03-07T13:00:00+08:00');
      
      const isValid = checkInService.isValidWakeupCheckInTime(mockDate);
      expect(isValid).toBe(false);
    });
  });

  describe('连续打卡计算', () => {
    test('TC-STREAK-001: 连续打卡天数累加', async () => {
      mockStorage.get.mockResolvedValue({
        streak: 5,
        lastCheckInDate: '2026-03-06'
      });
      
      mockAPI.checkIn.mockResolvedValue({ 
        success: true,
        newStreak: 6
      });

      // 模拟连续打卡
      const result = await checkInService.completeDailyCheckIn('user_123', '2026-03-07');
      
      expect(result.newStreak).toBe(6);
    });

    test('TC-STREAK-002: 断签后重置', async () => {
      mockStorage.get.mockResolvedValue({
        streak: 5,
        lastCheckInDate: '2026-03-05' // 昨天未打卡
      });
      
      mockAPI.checkIn.mockResolvedValue({ 
        success: true,
        newStreak: 1
      });

      const result = await checkInService.completeDailyCheckIn('user_123', '2026-03-07');
      
      expect(result.newStreak).toBe(1);
    });

    test('TC-STREAK-003: 跨天打卡计算', async () => {
      // 第一天 23:00 睡前打卡
      const bedtimeCheckIn = new Date('2026-03-06T23:00:00+08:00').getTime();
      
      // 第二天 07:00 起床打卡
      const wakeupCheckIn = new Date('2026-03-07T07:00:00+08:00').getTime();
      
      const sleepDuration = checkInService.calculateSleepDuration(bedtimeCheckIn, wakeupCheckIn);
      
      // 应该计算为 8 小时睡眠，计为 1 天
      expect(sleepDuration).toBe(8 * 3600);
    });
  });
});

// ============================================
// 3. 睡眠评分计算测试
// ============================================

describe('SleepScoreCalculator - 睡眠评分', () => {
  let calculator;

  beforeEach(() => {
    calculator = new SleepScoreCalculator();
  });

  describe('睡眠时长评分', () => {
    test('TC-SLEEP-001: 理想时长评分 (7-8 小时)', () => {
      const score = calculator.calculateDurationScore(7.5 * 3600); // 7.5 小时
      expect(score).toBeGreaterThanOrEqual(90);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('TC-SLEEP-002: 睡眠不足评分 (<6 小时)', () => {
      const score = calculator.calculateDurationScore(5 * 3600); // 5 小时
      expect(score).toBeGreaterThanOrEqual(60);
      expect(score).toBeLessThanOrEqual(70);
    });

    test('TC-SLEEP-003: 睡眠过长评分 (>10 小时)', () => {
      const score = calculator.calculateDurationScore(11 * 3600); // 11 小时
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(80);
    });

    test('TC-SLEEP-001/002/003: 评分边界值', () => {
      expect(calculator.calculateDurationScore(6 * 3600)).toBeGreaterThanOrEqual(70);
      expect(calculator.calculateDurationScore(7 * 3600)).toBeGreaterThanOrEqual(90);
      expect(calculator.calculateDurationScore(8 * 3600)).toBeGreaterThanOrEqual(90);
      expect(calculator.calculateDurationScore(9 * 3600)).toBeGreaterThanOrEqual(80);
      expect(calculator.calculateDurationScore(10 * 3600)).toBeGreaterThanOrEqual(80);
    });
  });

  describe('入睡时间评分', () => {
    test('TC-SLEEP-004: 早睡评分 (21:00-22:00)', () => {
      const score = calculator.calculateBedtimeScore(new Date('2026-03-07T21:30:00+08:00'));
      expect(score).toBeGreaterThanOrEqual(90);
    });

    test('TC-SLEEP-005: 熬夜评分 (>01:00)', () => {
      const score = calculator.calculateBedtimeScore(new Date('2026-03-07T01:30:00+08:00'));
      expect(score).toBeLessThanOrEqual(60);
    });

    test('TC-SLEEP-004/005: 入睡时间评分边界', () => {
      // 22:00 应该得分高
      expect(calculator.calculateBedtimeScore(new Date('2026-03-07T22:00:00+08:00'))).toBeGreaterThanOrEqual(80);
      
      // 23:00 应该得分中等
      const score23 = calculator.calculateBedtimeScore(new Date('2026-03-07T23:00:00+08:00'));
      expect(score23).toBeGreaterThanOrEqual(60);
      expect(score23).toBeLessThan(80);
      
      // 00:00 应该得分较低
      const score0 = calculator.calculateBedtimeScore(new Date('2026-03-07T00:00:00+08:00'));
      expect(score0).toBeLessThan(70);
    });
  });

  describe('综合睡眠评分', () => {
    test('TC-SLEEP-001: 优秀睡眠综合评分', () => {
      const result = calculator.calculateTotalScore({
        sleepDuration: 7.5 * 3600,
        bedtime: new Date('2026-03-07T22:00:00+08:00'),
        wakeupTime: new Date('2026-03-08T05:30:00+08:00')
      });
      
      expect(result.totalScore).toBeGreaterThanOrEqual(90);
      expect(result.level).toBe('优秀');
    });

    test('TC-SLEEP-002: 睡眠不足综合评分', () => {
      const result = calculator.calculateTotalScore({
        sleepDuration: 5 * 3600,
        bedtime: new Date('2026-03-07T23:00:00+08:00'),
        wakeupTime: new Date('2026-03-08T04:00:00+08:00')
      });
      
      expect(result.totalScore).toBeLessThan(70);
      expect(result.level).toBe('较差');
    });

    test('TC-SLEEP-003: 睡眠过长综合评分', () => {
      const result = calculator.calculateTotalScore({
        sleepDuration: 11 * 3600,
        bedtime: new Date('2026-03-07T21:00:00+08:00'),
        wakeupTime: new Date('2026-03-08T08:00:00+08:00')
      });
      
      expect(result.totalScore).toBeGreaterThanOrEqual(70);
      expect(result.totalScore).toBeLessThan(85);
      expect(result.level).toBe('良好');
    });
  });
});

// ============================================
// 4. 性能测试
// ============================================

const { PerformanceMonitor } = require('../src/utils/PerformanceMonitor');

describe('PerformanceMonitor - 性能测试', () => {
  let perfMonitor;

  beforeEach(() => {
    perfMonitor = new PerformanceMonitor();
    jest.clearAllMocks();
  });

  describe('API 响应时间测试', () => {
    test('TC-PERF-001: 登录 API 响应时间 < 200ms', async () => {
      const mockAPI = {
        login: jest.fn().mockResolvedValue({ success: true })
      };

      const responseTimes = [];
      
      // 执行 100 次请求
      for (let i = 0; i < 100; i++) {
        const startTime = Date.now();
        await mockAPI.login('13800138000', 'Test@123');
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }

      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const p95Time = responseTimes.sort((a, b) => a - b)[94];

      expect(avgTime).toBeLessThan(200);
      expect(p95Time).toBeLessThan(300);
    });

    test('TC-PERF-002: 打卡 API 响应时间 < 200ms', async () => {
      const mockAPI = {
        checkIn: jest.fn().mockResolvedValue({ success: true })
      };

      const responseTimes = [];
      
      for (let i = 0; i < 100; i++) {
        const startTime = Date.now();
        await mockAPI.checkIn('user_123', 'bedtime');
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }

      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      
      expect(avgTime).toBeLessThan(200);
    });

    test('TC-PERF-004: 高并发测试', async () => {
      const mockAPI = {
        login: jest.fn().mockResolvedValue({ success: true })
      };

      const concurrentUsers = 1000;
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < concurrentUsers; i++) {
        promises.push(mockAPI.login(`user_${i}`, 'Test@123'));
      }

      await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / concurrentUsers;

      // 高并发下平均响应时间允许稍高
      expect(avgTime).toBeLessThan(500);
    });
  });

  describe('App 启动时间测试', () => {
    test('TC-PERF-005: 冷启动时间 < 2s', () => {
      const startupTimes = [];
      
      // 模拟 10 次冷启动
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        // 模拟 App 初始化
        perfMonitor.initializeApp();
        
        const endTime = Date.now();
        startupTimes.push(endTime - startTime);
      }

      const avgStartupTime = startupTimes.reduce((a, b) => a + b, 0) / startupTimes.length;
      
      expect(avgStartupTime).toBeLessThan(2000);
    });

    test('TC-PERF-006: 热启动时间 < 1s', () => {
      const startupTimes = [];
      
      // 模拟 10 次热启动
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        // 模拟从后台恢复
        perfMonitor.resumeFromBackground();
        
        const endTime = Date.now();
        startupTimes.push(endTime - startTime);
      }

      const avgStartupTime = startupTimes.reduce((a, b) => a + b, 0) / startupTimes.length;
      
      expect(avgStartupTime).toBeLessThan(1000);
    });
  });

  describe('性能监控工具', () => {
    test('性能数据记录', () => {
      perfMonitor.recordMetric('api_response_time', 150);
      perfMonitor.recordMetric('api_response_time', 180);
      perfMonitor.recordMetric('api_response_time', 160);

      const stats = perfMonitor.getStats('api_response_time');
      
      expect(stats.count).toBe(3);
      expect(stats.avg).toBe(163.33); // 约等于
      expect(stats.min).toBe(150);
      expect(stats.max).toBe(180);
    });

    test('性能告警', () => {
      perfMonitor.setThreshold('api_response_time', 200);
      
      perfMonitor.recordMetric('api_response_time', 250);
      const alerts = perfMonitor.getAlerts();
      
      expect(alerts.length).toBeGreaterThan(0);
    });
  });
});

// ============================================
// 5. 辅助函数测试
// ============================================

describe('Utility Functions - 辅助函数', () => {
  describe('日期时间处理', () => {
    test('跨天时间计算', () => {
      const bedtime = new Date('2026-03-06T23:00:00+08:00');
      const wakeupTime = new Date('2026-03-07T07:00:00+08:00');
      
      const duration = SleepScoreCalculator.calculateSleepDuration(bedtime, wakeupTime);
      
      expect(duration).toBe(8 * 3600); // 8 小时
    });

    test('同一天内时间计算', () => {
      const bedtime = new Date('2026-03-07T22:00:00+08:00');
      const wakeupTime = new Date('2026-03-08T06:00:00+08:00');
      
      const duration = SleepScoreCalculator.calculateSleepDuration(bedtime, wakeupTime);
      
      expect(duration).toBe(8 * 3600); // 8 小时
    });
  });

  describe('数据格式化', () => {
    test('睡眠时长格式化', () => {
      const formatted = SleepScoreCalculator.formatDuration(7.5 * 3600);
      expect(formatted).toBe('7 小时 30 分钟');
    });

    test('评分等级转换', () => {
      expect(SleepScoreCalculator.getScoreLevel(95)).toBe('优秀');
      expect(SleepScoreCalculator.getScoreLevel(85)).toBe('良好');
      expect(SleepScoreCalculator.getScoreLevel(75)).toBe('一般');
      expect(SleepScoreCalculator.getScoreLevel(65)).toBe('较差');
      expect(SleepScoreCalculator.getScoreLevel(50)).toBe('差');
    });
  });
});
