import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Vibration } from 'react-native';
import CheckinButton from './CheckinButton';
import SleepCalendar from './SleepCalendar';

interface SleepData {
  consecutiveDays: number;
  lastSleepTime: string;
  lastWakeTime: string;
  avgSleepTime: string;
  avgWakeTime: string;
  sleepScore: number;
  weeklyCheckins: boolean[];
}

const ENCOURAGEMENTS = [
  '太棒了！继续保持！🌟',
  '好习惯成就好睡眠！💪',
  '你离健康睡眠又近了一步！✨',
  '坚持就是胜利！🏆',
  '优质睡眠从打卡开始！😴',
];

const HomeScreen: React.FC = () => {
  const [todayStatus, setTodayStatus] = useState<'none' | 'bedtime' | 'wakeup'>('none');
  const [sleepData, setSleepData] = useState<SleepData>({
    consecutiveDays: 5,
    lastSleepTime: '23:30',
    lastWakeTime: '07:00',
    avgSleepTime: '23:45',
    avgWakeTime: '07:15',
    sleepScore: 85,
    weeklyCheckins: [true, true, false, true, true, false, false],
  });
  
  const [encouragement, setEncouragement] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Load sleep data from storage
    loadSleepData();
  }, []);

  const loadSleepData = async () => {
    // TODO: Implement data loading from storage
    console.log('Loading sleep data...');
  };

  const handleBedtimeCheckin = () => {
    Vibration.vibrate([0, 100, 50, 100]); // Vibration feedback
    setTodayStatus('bedtime');
    triggerSuccessAnimation();
  };

  const handleWakeupCheckin = () => {
    Vibration.vibrate([0, 100, 50, 100]); // Vibration feedback
    setTodayStatus('wakeup');
    triggerSuccessAnimation();
  };

  const triggerSuccessAnimation = () => {
    setShowAnimation(true);
    const randomEncouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    setEncouragement(randomEncouragement);
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAnimation(false);
      setEncouragement('');
    });
  };

  const getSleepScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>睡了么</Text>
        <Text style={styles.subtitle}>睡眠打卡</Text>
      </View>

      {/* Today Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>今日状态</Text>
        <Text style={styles.statusText}>
          {todayStatus === 'none' && '未打卡'}
          {todayStatus === 'bedtime' && '✅ 已记录入睡'}
          {todayStatus === 'wakeup' && '✅ 已完成打卡'}
        </Text>
      </View>

      {/* Checkin Buttons */}
      <View style={styles.buttonContainer}>
        <CheckinButton
          type="bedtime"
          onPress={handleBedtimeCheckin}
          disabled={todayStatus === 'wakeup'}
          longPressDuration={2000}
        />
        <CheckinButton
          type="wakeup"
          onPress={handleWakeupCheckin}
          disabled={todayStatus === 'none'}
          longPressDuration={2000}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>连续打卡</Text>
          <Text style={styles.statValue}>{sleepData.consecutiveDays}天</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>上次睡眠</Text>
          <Text style={styles.statValue}>{sleepData.lastSleepTime} - {sleepData.lastWakeTime}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>睡眠评分</Text>
          <Text style={[styles.statValue, { color: getSleepScoreColor(sleepData.sleepScore) }]}>
            {sleepData.sleepScore}分
          </Text>
        </View>
      </View>

      {/* Weekly Calendar */}
      <SleepCalendar weeklyCheckins={sleepData.weeklyCheckins} />

      {/* Average Times */}
      <View style={styles.avgContainer}>
        <View style={styles.avgItem}>
          <Text style={styles.avgLabel}>平均入睡</Text>
          <Text style={styles.avgValue}>{sleepData.avgSleepTime}</Text>
        </View>
        <View style={styles.avgItem}>
          <Text style={styles.avgLabel}>平均起床</Text>
          <Text style={styles.avgValue}>{sleepData.avgWakeTime}</Text>
        </View>
      </View>

      {/* Success Animation Overlay */}
      {showAnimation && (
        <Animated.View style={[styles.animationOverlay, { opacity: fadeAnim }]}>
          <Text style={styles.animationText}>🎉 {encouragement}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  avgContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  avgItem: {
    alignItems: 'center',
    flex: 1,
  },
  avgLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 5,
  },
  avgValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 100,
  },
  animationText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default HomeScreen;
