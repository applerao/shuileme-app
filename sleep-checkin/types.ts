// Sleep Data Types
export interface SleepRecord {
  id: string;
  date: string; // ISO date string
  bedtime: string; // Time string (HH:mm)
  wakeupTime: string; // Time string (HH:mm)
  duration: number; // Duration in minutes
  quality: number; // 0-100 score
  notes?: string;
}

export interface SleepData {
  consecutiveDays: number;
  lastSleepTime: string;
  lastWakeTime: string;
  avgSleepTime: string;
  avgWakeTime: string;
  sleepScore: number;
  weeklyCheckins: boolean[];
  totalRecords: number;
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  checkins: boolean[];
  avgSleepDuration: number;
  avgSleepQuality: number;
  bestNight: SleepRecord | null;
}

// Component Props
export interface CheckinButtonProps {
  type: 'bedtime' | 'wakeup';
  onPress: () => void;
  disabled?: boolean;
  longPressDuration?: number;
  onLongPressStart?: () => void;
  onLongPressCancel?: () => void;
  onLongPressComplete?: () => void;
}

export interface SleepCalendarProps {
  weeklyCheckins: boolean[];
  onDayPress?: (index: number) => void;
  showLegend?: boolean;
}

export interface HomeScreenProps {
  userId?: string;
  onCheckinComplete?: (type: 'bedtime' | 'wakeup') => void;
}

// Storage Types
export interface SleepStorage {
  records: SleepRecord[];
  settings: UserSettings;
  stats: SleepStats;
}

export interface UserSettings {
  reminderEnabled: boolean;
  reminderTime: string;
  wakeUpGoal: string;
  bedtimeGoal: string;
  notificationsEnabled: boolean;
}

export interface SleepStats {
  totalDays: number;
  consecutiveDays: number;
  maxConsecutiveDays: number;
  avgSleepDuration: number;
  avgSleepQuality: number;
  bestStreak: number;
  lastCheckin: string | null;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing?: (value: number) => number;
  useNativeDriver: boolean;
}

export interface VibrationPattern {
  pattern: number[];
  repeat?: boolean;
}

// Encouragement Messages
export const ENCOURAGEMENTS: string[] = [
  '太棒了！继续保持！🌟',
  '好习惯成就好睡眠！💪',
  '你离健康睡眠又近了一步！✨',
  '坚持就是胜利！🏆',
  '优质睡眠从打卡开始！😴',
  '早睡早起身体好！🌈',
  '今天的你很棒！👏',
  '睡眠质量提升中！📈',
  '自律给你自由！🎯',
  '美好的一天从好睡眠开始！🌅',
];

export const BEDTIME_ENCOURAGEMENTS: string[] = [
  '晚安！好梦！🌙',
  '准备休息啦！😴',
  '放松身心，准备入睡！💤',
  '明天会更好！✨',
  '优质睡眠进行中！🌟',
];

export const WAKEUP_ENCOURAGEMENTS: string[] = [
  '早安！新的一天！☀️',
  '起床打卡成功！💪',
  '精神满满的一天！🌈',
  '又是元气满满的一天！🎉',
  '恭喜你完成打卡！🏆',
];

// Utility Types
export type CheckinStatus = 'none' | 'bedtime' | 'wakeup' | 'completed';
export type DayStatus = 'completed' | 'missed' | 'future' | 'today';

export interface DayData {
  date: Date;
  dayOfWeek: number;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  status: DayStatus;
}
