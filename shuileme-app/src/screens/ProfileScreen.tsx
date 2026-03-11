import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../theme';

/**
 * 个人页 - 用户设置
 */
export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>👤 我的</Text>
        <Text style={styles.subtitle}>个人设置与偏好</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            个人中心开发中...
          </Text>
          <Text style={styles.placeholderHint}>
            这里将展示个人信息、设置和成就
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
    color: colors.primary.moonlight,
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
