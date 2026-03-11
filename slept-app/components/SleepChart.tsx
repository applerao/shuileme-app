import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius } from '../src/styles/theme';

interface SleepDataPoint {
  date: string;
  duration: number;
  score: number;
  deepSleep: number;
}

interface SleepChartProps {
  data: SleepDataPoint[];
  period: 'week' | 'month';
}

const SleepChart: React.FC<SleepChartProps> = ({ data, period }) => {
  const durationData = data.map(item => item.duration);
  const scoreData = data.map(item => item.score);
  const labels = data.map(item => item.date);

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border.main,
      strokeWidth: 1,
    },
  };

  const lineChartData = {
    labels,
    datasets: [
      {
        data: scoreData,
        color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const barChartData = {
    labels,
    datasets: [
      {
        data: durationData,
        colors: [
          (opacity = 1) => `rgba(74, 0, 224, ${opacity})`,
          (opacity = 1) => `rgba(142, 45, 226, ${opacity})`,
        ],
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Sleep Duration Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>睡眠时长 (小时)</Text>
        <BarChart
          data={barChartData}
          width={undefined}
          height={220}
          yAxisLabel=""
          yAxisSuffix="h"
          chartConfig={{
            ...chartConfig,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(74, 0, 224, ${opacity})`,
            barPercentage: 0.6,
            propsForBackgroundLines: {
              stroke: colors.border,
              strokeWidth: 0.5,
            },
          }}
          style={styles.chart}
          fromZero
          showBarTops={false}
          showValuesOnTopOfBars={true}
        />
      </View>

      {/* Sleep Score Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>睡眠质量评分</Text>
        <LineChart
          data={lineChartData}
          width={undefined}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          yAxisInterval={20}
          chartConfig={{
            ...chartConfig,
            decimalPlaces: 0,
            propsForBackgroundLines: {
              stroke: colors.border,
              strokeWidth: 0.5,
            },
          }}
          style={styles.chart}
          bezier
          withDots={true}
          withShadow={true}
          withInnerLines={true}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>睡眠评分</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendBar,
              { backgroundColor: 'rgba(74, 0, 224, 0.8)' },
            ]}
          />
          <Text style={styles.legendText}>睡眠时长</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.main,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendBar: {
    width: 20,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});

export default SleepChart;
