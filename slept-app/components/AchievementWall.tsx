import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../src/styles/theme';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockDate?: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: '早睡早起',
    description: '连续 7 天 23 点前入睡',
    icon: '🌅',
    unlocked: true,
    unlockDate: '2024-03-01',
    level: 'gold',
  },
  {
    id: '2',
    title: '睡眠冠军',
    description: '睡眠评分连续 5 天 90+',
    icon: '🏆',
    unlocked: true,
    unlockDate: '2024-03-05',
    level: 'platinum',
  },
  {
    id: '3',
    title: '规律作息',
    description: '连续 14 天保持规律作息',
    icon: '📅',
    unlocked: true,
    unlockDate: '2024-02-20',
    level: 'silver',
  },
  {
    id: '4',
    title: '深睡大师',
    description: '深睡比例达到 30%',
    icon: '😴',
    unlocked: false,
    level: 'gold',
  },
  {
    id: '5',
    title: '午睡习惯',
    description: '连续 7 天午睡',
    icon: '☀️',
    unlocked: false,
    level: 'bronze',
  },
  {
    id: '6',
    title: '周末战士',
    description: '周末不熬夜',
    icon: '🎉',
    unlocked: true,
    unlockDate: '2024-03-03',
    level: 'silver',
  },
  {
    id: '7',
    title: '月全勤',
    description: '整月记录睡眠',
    icon: '📊',
    unlocked: false,
    level: 'platinum',
  },
  {
    id: '8',
    title: '快速入睡',
    description: '平均入睡时间<10 分钟',
    icon: '⚡',
    unlocked: false,
    level: 'gold',
  },
];

const AchievementWall: React.FC = () => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const getLevelColor = (level: Achievement['level']) => {
    switch (level) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return colors.border;
    }
  };

  const getLevelGradient = (level: Achievement['level'], unlocked: boolean) => {
    if (!unlocked) {
      return ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)'];
    }
    switch (level) {
      case 'bronze':
        return ['#CD7F32', '#8B4513'];
      case 'silver':
        return ['#C0C0C0', '#808080'];
      case 'gold':
        return ['#FFD700', '#B8860B'];
      case 'platinum':
        return ['#E5E4E2', '#A9A9A9'];
      default:
        return [colors.primary, colors.secondary];
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>总进度</Text>
          <Text style={styles.progressText}>
            {unlockedCount}/{achievements.length}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(unlockedCount / achievements.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Achievement Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {achievements.map((achievement) => (
          <TouchableOpacity
            key={achievement.id}
            style={styles.achievementCard}
            onPress={() => setSelectedAchievement(achievement)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: achievement.unlocked
                    ? getLevelColor(achievement.level)
                    : 'rgba(255, 255, 255, 0.1)',
                },
              ]}
            >
              <Text style={[styles.badgeIcon, { opacity: achievement.unlocked ? 1 : 0.3 }]}>
                {achievement.icon}
              </Text>
            </View>
            <Text
              style={[
                styles.badgeTitle,
                { opacity: achievement.unlocked ? 1 : 0.5 },
              ]}
              numberOfLines={1}
            >
              {achievement.title}
            </Text>
            {achievement.unlocked && achievement.level && (
              <View
                style={[
                  styles.levelIndicator,
                  { backgroundColor: getLevelColor(achievement.level) },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected Achievement Detail */}
      {selectedAchievement && (
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            <View
              style={[
                styles.detailBadge,
                {
                  backgroundColor: selectedAchievement.unlocked
                    ? getLevelColor(selectedAchievement.level)
                    : 'rgba(255, 255, 255, 0.1)',
                },
              ]}
            >
              <Text style={styles.detailBadgeIcon}>{selectedAchievement.icon}</Text>
            </View>
            <Text style={styles.detailTitle}>{selectedAchievement.title}</Text>
            <Text style={styles.detailDescription}>
              {selectedAchievement.description}
            </Text>
            {selectedAchievement.unlocked && selectedAchievement.unlockDate && (
              <Text style={styles.unlockDate}>
                解锁于 {selectedAchievement.unlockDate}
              </Text>
            )}
            {!selectedAchievement.unlocked && (
              <Text style={styles.lockedText}>🔒 尚未解锁</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedAchievement(null)}
            >
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
  achievementCard: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 80,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.card,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeTitle: {
    fontSize: 11,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  levelIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: spacing.xs,
  },
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
  },
  detailCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '85%',
    ...shadows.card,
  },
  detailBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  detailBadgeIcon: {
    fontSize: 40,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  detailDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  unlockDate: {
    fontSize: 12,
    color: colors.success,
    marginBottom: spacing.md,
  },
  lockedText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  closeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AchievementWall;
