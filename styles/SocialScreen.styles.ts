import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const colors = {
  // 深夜蓝/星空紫主题色
  background: '#0D0D1A',
  cardBackground: '#1A1A2E',
  cardBorder: '#2D2D44',
  primary: '#7B68EE',
  primaryDark: '#6A5ACD',
  primaryLight: '#9370DB',
  accent: '#4B3F72',
  text: '#FFFFFF',
  textSecondary: '#B8B8D0',
  textMuted: '#6B5B9F',
  success: '#4ECDC4',
  warning: '#FFD93D',
  danger: '#FF6B6B',
  online: '#4ECDC4',
  offline: '#6B5B9F',
  notification: '#FF6B6B',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  inviteText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  // 头像样式
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.online,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  // 我监督的人
  userItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  userName: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  // 消息样式
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
  },
  unreadMessage: {
    backgroundColor: '#252540',
  },
  messageAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageUserName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  messageTime: {
    color: colors.textMuted,
    fontSize: 12,
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  unreadMessageText: {
    color: colors.text,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.notification,
    marginLeft: 8,
  },
  notificationBadge: {
    backgroundColor: colors.notification,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notificationText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // 悬浮按钮
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
