import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../theme';

/**
 * 统计页 - 睡眠数据分析
 */
export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📊 统计</Text>
        <Text style={styles.subtitle}>你的睡眠数据洞察</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            统计功能开发中...
          </Text>
          <Text style={styles.placeholderHint}>
            这里将展示睡眠时长、质量趋势和周报月报
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.midnightBlue,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary.dawnPurple,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary.warmGray,
    marginBottom: 48,
  },
  placeholder: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.primary.nightSky,
    borderRadius: 16,
    width: '100%',
  },
  placeholderText: {
    fontSize: 18,
    color: colors.secondary.softWhite,
    marginBottom: 8,
  },
  placeholderHint: {
    fontSize: 14,
    color: colors.secondary.warmGray,
  },
});
