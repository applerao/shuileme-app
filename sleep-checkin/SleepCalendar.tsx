import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SleepCalendarProps {
  weeklyCheckins: boolean[];
}

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];

const SleepCalendar: React.FC<SleepCalendarProps> = ({ weeklyCheckins }) => {
  const getTodayIndex = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // Convert to Monday=0 format
  };

  const todayIndex = getTodayIndex();

  const getDayStatus = (index: number) => {
    if (index > todayIndex) return 'future';
    if (weeklyCheckins[index]) return 'completed';
    return 'missed';
  };

  const getDayStyle = (index: number) => {
    const status = getDayStatus(index);
    switch (status) {
      case 'completed':
        return styles.dayCompleted;
      case 'missed':
        return styles.dayMissed;
      default:
        return styles.dayFuture;
    }
  };

  const getDayIcon = (index: number) => {
    const status = getDayStatus(index);
    switch (status) {
      case 'completed':
        return '✅';
      case 'missed':
        return '❌';
      default:
        return '⚪';
    }
  };

  const completedCount = weeklyCheckins.filter((v, i) => i <= todayIndex && v).length;
  const totalCount = todayIndex + 1;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>本周打卡</Text>
        <Text style={styles.completionRate}>{completionRate}%</Text>
      </View>
      
      <View style={styles.calendarGrid}>
        {WEEK_DAYS.map((day, index) => (
          <View key={day} style={styles.dayColumn}>
            <Text
              style={[
                styles.dayLabel,
                index === todayIndex && styles.todayLabel,
              ]}
            >
              {day}
            </Text>
            <View style={[styles.dayCircle, getDayStyle(index)]}>
              <Text style={styles.dayIcon}>{getDayIcon(index)}</Text>
            </View>
            {index === todayIndex && (
              <View style={styles.todayIndicator}>
                <Text style={styles.todayText}>今天</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendCompleted]} />
          <Text style={styles.legendText}>完成</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendMissed]} />
          <Text style={styles.legendText}>未完成</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendFuture]} />
          <Text style={styles.legendText}>待打卡</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  completionRate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  todayLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayCompleted: {
    backgroundColor: '#4CAF50',
  },
  dayMissed: {
    backgroundColor: '#F44336',
  },
  dayFuture: {
    backgroundColor: '#3a3a5c',
  },
  dayIcon: {
    fontSize: 18,
  },
  todayIndicator: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayText: {
    fontSize: 10,
    color: '#ffffff',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#3a3a5c',
    paddingTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendCompleted: {
    backgroundColor: '#4CAF50',
  },
  legendMissed: {
    backgroundColor: '#F44336',
  },
  legendFuture: {
    backgroundColor: '#3a3a5c',
  },
  legendText: {
    fontSize: 12,
    color: '#a0a0a0',
  },
});

export default SleepCalendar;
