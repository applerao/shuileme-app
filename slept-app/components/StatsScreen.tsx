import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DataCard from './DataCard';
import SleepChart from './SleepChart';
import AchievementWall from './AchievementWall';
import { colors, spacing, borderRadius } from '../styles/theme';

const { width } = Dimensions.get('window');

interface StatsScreenProps {
  sleepData?: {
    avgSleepTime: string;
    avgDuration: string;
    sleepScore: number;
    weeklyData: Array<{
      date: string;
      duration: number;
      score: number;
      deepSleep: number;
    }>;
  };
}

const StatsScreen: React.FC<StatsScreenProps> = ({ sleepData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const defaultData = {
    avgSleepTime: '23:45',
    avgDuration: '7h 32m',
    sleepScore: 85,
    weeklyData: [
      { date: '周一', duration: 7.5, score: 82, deepSleep: 1.8 },
      { date: '周二', duration: 8.2, score: 88, deepSleep: 2.1 },
      { date: '周三', duration: 6.8, score: 75, deepSleep: 1.5 },
      { date: '周四', duration: 7.9, score: 86, deepSleep: 2.0 },
      { date: '周五', duration: 8.5, score: 90, deepSleep: 2.3 },
      { date: '周六', duration: 9.1, score: 92, deepSleep: 2.5 },
      { date: '周日', duration: 8.0, score: 87, deepSleep: 2.0 },
    ],
  };

  const data = sleepData || defaultData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>睡眠统计</Text>
        <Text style={styles.subtitle}>追踪你的睡眠质量</Text>
      </View>

      {/* Core Data Cards */}
      <View style={styles.cardsContainer}>
        <DataCard
          title="平均入睡时间"
          value={data.avgSleepTime}
          unit=""
          icon="🌙"
          gradientColors={['#4A00E0', '#8E2DE2']}
        />
        <DataCard
          title="平均睡眠时长"
          value={data.avgDuration}
          unit=""
          icon="⏰"
          gradientColors={['#5C258D', '#4389A2']}
        />
        <DataCard
          title="睡眠评分"
          value={data.sleepScore.toString()}
          unit="分"
          icon="⭐"
          gradientColors={['#667eea', '#764ba2']}
          isScore
        />
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text
            style={[
              styles.periodText,
              selectedPeriod === 'week' && styles.periodTextActive,
            ]}
          >
            周
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'month' && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text
            style={[
              styles.periodText,
              selectedPeriod === 'month' && styles.periodTextActive,
            ]}
          >
            月
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sleep Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>睡眠趋势</Text>
        <SleepChart
          data={data.weeklyData}
          period={selectedPeriod}
        />
      </View>

      {/* Weekly Comparison */}
      <View style={styles.comparisonContainer}>
        <Text style={styles.sectionTitle}>周对比分析</Text>
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>本周平均</Text>
              <Text style={styles.comparisonValue}>7.9h</Text>
              <Text style={[styles.comparisonTrend, styles.trendPositive]}>
                ↑ 12%
              </Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>上周平均</Text>
              <Text style={styles.comparisonValue}>7.1h</Text>
              <Text style={[styles.comparisonTrend, styles.trendNeutral]}>
                -
              </Text>
            </View>
          </View>
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>深睡比例</Text>
              <Text style={styles.comparisonValue}>26%</Text>
              <Text style={[styles.comparisonTrend, styles.trendPositive]}>
                ↑ 5%
              </Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>入睡速度</Text>
              <Text style={styles.comparisonValue}>18min</Text>
              <Text style={[styles.comparisonTrend, styles.trendPositive]}>
                ↑ 8%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Achievement Wall */}
      <View style={styles.achievementContainer}>
        <Text style={styles.sectionTitle}>成就徽章</Text>
        <AchievementWall />
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  periodButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.main,
    marginRight: spacing.sm,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  periodTextActive: {
    color: colors.white,
  },
  comparisonContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  comparisonCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
  },
  comparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonDivider: {
    width: 1,
    backgroundColor: colors.border.main,
    marginHorizontal: spacing.md,
  },
  comparisonLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  comparisonValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  comparisonTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendPositive: {
    color: colors.success,
  },
  trendNeutral: {
    color: colors.text.secondary,
  },
  achievementContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  footer: {
    height: spacing.xl,
  },
});

export default StatsScreen;
