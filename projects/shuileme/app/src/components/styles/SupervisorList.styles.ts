import { StyleSheet } from 'react-native';

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
};

export default StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  supervisorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    borderRadius: 22.5,
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
  supervisorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supervisorName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  onlineBadge: {
    backgroundColor: colors.online,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  onlineBadgeText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '600',
  },
  supervisorStatus: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageButton: {
    padding: 6,
  },
  removeButton: {
    padding: 6,
  },
  // 空状态
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
