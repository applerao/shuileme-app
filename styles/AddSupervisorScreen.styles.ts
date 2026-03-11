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
  inputBackground: '#252540',
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  // 搜索区域
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 0,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  // 扫码按钮
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  scanIconContainer: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
  },
  scanButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  // 加载状态
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  // 搜索结果
  resultsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
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
  resultInfo: {
    flex: 1,
  },
  resultName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  resultStatus: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  requestButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  requestButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  // 空状态
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  // 提示区域
  tipsSection: {
    backgroundColor: colors.cardBackground,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tipsTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
