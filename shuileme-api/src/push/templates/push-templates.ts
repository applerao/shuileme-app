/**
 * 推送通知模板
 * Push Notification Templates
 */

export interface PushTemplate {
  id: string;
  title: string;
  content: string;
  extras?: Record<string, any>;
}

export const pushTemplates: Record<string, PushTemplate> = {
  // 睡前提醒 - 22:30
  BEDTIME_REMINDER: {
    id: 'BEDTIME_REMINDER',
    title: '🌙 睡前提醒',
    content: '夜深了，该准备休息啦！记得明天要继续打卡哦~',
    extras: {
      type: 'bedtime_reminder',
      action: 'navigate_to_home',
    },
  },

  // 起床提醒 - 07:30
  WAKEUP_REMINDER: {
    id: 'WAKEUP_REMINDER',
    title: '☀️ 起床提醒',
    content: '早上好！新的一天开始了，别忘了记录昨晚的睡眠情况~',
    extras: {
      type: 'wakeup_reminder',
      action: 'navigate_to_checkin',
    },
  },

  // 监督者提醒消息
  SUPERVISION_MESSAGE: {
    id: 'SUPERVISION_MESSAGE',
    title: '💬 来自监督者的消息',
    content: '{senderName} 给你发了一条消息',
    extras: {
      type: 'supervision_message',
      action: 'navigate_to_supervision',
    },
  },

  // 成就解锁通知
  ACHIEVEMENT_UNLOCKED: {
    id: 'ACHIEVEMENT_UNLOCKED',
    title: '🏆 成就解锁',
    content: '恭喜你解锁了新成就：{achievementName}！',
    extras: {
      type: 'achievement_unlocked',
      action: 'navigate_to_achievements',
    },
  },

  // 打卡提醒
  CHECKIN_REMINDER: {
    id: 'CHECKIN_REMINDER',
    title: '📝 打卡提醒',
    content: '你今天还没有打卡哦，快来记录睡眠情况吧~',
    extras: {
      type: 'checkin_reminder',
      action: 'navigate_to_checkin',
    },
  },

  // 监督请求
  SUPERVISION_REQUEST: {
    id: 'SUPERVISION_REQUEST',
    title: '👥 监督请求',
    content: '{requesterName} 邀请你成为 TA 的睡眠监督者',
    extras: {
      type: 'supervision_request',
      action: 'navigate_to_supervision_requests',
    },
  },

  // 系统通知
  SYSTEM_NOTIFICATION: {
    id: 'SYSTEM_NOTIFICATION',
    title: '📢 系统通知',
    content: '{message}',
    extras: {
      type: 'system',
      action: 'navigate_to_home',
    },
  },
};

/**
 * 根据模板 ID 和内容变量生成推送内容
 * @param templateId 模板 ID
 * @param variables 变量替换对象
 * @returns 生成的推送标题和内容
 */
export function renderTemplate(
  templateId: string,
  variables: Record<string, any> = {},
): { title: string; content: string; extras?: Record<string, any> } {
  const template = pushTemplates[templateId];
  
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // 替换内容中的变量
  let content = template.content;
  Object.keys(variables).forEach((key) => {
    content = content.replace(new RegExp(`{${key}}`, 'g'), String(variables[key]));
  });

  return {
    title: template.title,
    content,
    extras: template.extras,
  };
}

/**
 * 获取所有可用的模板 ID
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(pushTemplates);
}
