import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../theme';

/**
 * 首页 - 睡眠记录入口
 */
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🌙 睡了么</Text>
        <Text style={styles.subtitle}>记录你的每一个好梦</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            首页功能开发中...
          </Text>
          <Text style={styles.placeholderHint}>
            这里将展示睡眠记录入口和今日状态
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
    color: colors.primary.starryPurple,
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
