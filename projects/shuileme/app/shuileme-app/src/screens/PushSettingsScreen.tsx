import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { usePush } from '../contexts/PushContext';
import { colors } from '../theme';

interface PushSettings {
  bedtimeReminder: boolean;
  wakeupReminder: boolean;
  supervisionMessages: boolean;
  achievementNotifications: boolean;
  systemNotifications: boolean;
}

export default function PushSettingsScreen() {
  const { isAuthorized, requestPermission } = usePush();
  
  const [settings, setSettings] = useState<PushSettings>({
    bedtimeReminder: true,
    wakeupReminder: true,
    supervisionMessages: true,
    achievementNotifications: true,
    systemNotifications: true,
  });

  const toggleSetting = (key: keyof PushSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // TODO: 保存到后端或本地存储
    // await api.patch('/api/users/push-settings', { [key]: !settings[key] });
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      Alert.alert('权限已授予', '您已允许接收推送通知');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>推送权限</Text>
        
        <View style={styles.permissionCard}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionStatus}>
              {isAuthorized ? '✅ 已授权' : '❌ 未授权'}
            </Text>
            <Text style={styles.permissionDesc}>
              {isAuthorized
                ? '您已允许接收推送通知'
                : '开启推送通知以接收睡前提醒、成就解锁等消息'}
            </Text>
          </View>
          
          {!isAuthorized && (
            <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
              <Text style={styles.permissionButtonText}>开启权限</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知类型</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>🌙 睡前提醒</Text>
            <Text style={styles.settingDesc}>每晚 22:30 提醒你准备休息</Text>
          </View>
          <Switch
            value={settings.bedtimeReminder}
            onValueChange={() => toggleSetting('bedtimeReminder')}
            trackColor={{ false: colors.gray.light, true: colors.primary.midnightBlue }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>☀️ 起床提醒</Text>
            <Text style={styles.settingDesc}>每天早上 07:30 叫你起床</Text>
          </View>
          <Switch
            value={settings.wakeupReminder}
            onValueChange={() => toggleSetting('wakeupReminder')}
            trackColor={{ false: colors.gray.light, true: colors.primary.midnightBlue }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>💬 监督者消息</Text>
            <Text style={styles.settingDesc}>接收来自监督者的消息通知</Text>
          </View>
          <Switch
            value={settings.supervisionMessages}
            onValueChange={() => toggleSetting('supervisionMessages')}
            trackColor={{ false: colors.gray.light, true: colors.primary.midnightBlue }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>🏆 成就解锁</Text>
            <Text style={styles.settingDesc}>解锁新成就时收到通知</Text>
          </View>
          <Switch
            value={settings.achievementNotifications}
            onValueChange={() => toggleSetting('achievementNotifications')}
            trackColor={{ false: colors.gray.light, true: colors.primary.midnightBlue }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>📢 系统通知</Text>
            <Text style={styles.settingDesc}>应用更新、活动通知等</Text>
          </View>
          <Switch
            value={settings.systemNotifications}
            onValueChange={() => toggleSetting('systemNotifications')}
            trackColor={{ false: colors.gray.light, true: colors.primary.midnightBlue }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>高级设置</Text>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>清除所有通知</Text>
          <Text style={styles.actionDesc}>清空通知中心的所有通知</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>通知声音</Text>
          <Text style={styles.actionDesc}>默认</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>振动</Text>
          <Text style={styles.actionDesc}>开启</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          推送服务由极光推送提供
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.light,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  permissionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionInfo: {
    flex: 1,
    marginRight: 16,
  },
  permissionStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  permissionDesc: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  permissionButton: {
    backgroundColor: colors.primary.midnightBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.light,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  actionItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.text.hint,
  },
});
