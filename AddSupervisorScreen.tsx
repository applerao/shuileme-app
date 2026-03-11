import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/AddSupervisorScreen.styles';

interface SearchResult {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

const AddSupervisorScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const mockSearchResults: SearchResult[] = [
    { id: '1', name: '张三', avatar: 'https://i.pravatar.cc/100?img=10', isOnline: true },
    { id: '2', name: '李四', avatar: 'https://i.pravatar.cc/100?img=11', isOnline: false },
    { id: '3', name: '王五', avatar: 'https://i.pravatar.cc/100?img=12', isOnline: true },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        setSearchResults(mockSearchResults);
        setIsSearching(false);
      }, 500);
    }
  };

  const handleSendRequest = (userName: string) => {
    Alert.alert(
      '发送监督请求',
      `确定要向 ${userName} 发送监督请求吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '发送', onPress: () => Alert.alert('请求已发送', '等待对方确认') }
      ]
    );
  };

  const handleScanQR = () => {
    Alert.alert('扫码添加', '打开摄像头扫描二维码');
  };

  const renderAvatar = (avatar: string, isOnline: boolean, size: number = 50) => (
    <View style={styles.avatarContainer}>
      <Image source={{ uri: avatar }} style={[styles.avatar, { width: size, height: size }]} />
      {isOnline && <View style={[styles.onlineIndicator, { width: size * 0.3, height: size * 0.3 }]} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>添加监督者</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#7B68EE" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索用户名或手机号"
            placeholderTextColor="#6B5B9F"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7B68EE" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
        <View style={styles.scanIconContainer}>
          <Ionicons name="qr-code-scan" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.scanButtonText}>扫码添加监督者</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {isSearching && (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={32} color="#7B68EE" />
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      )}

      {!isSearching && searchResults.length > 0 && (
        <ScrollView style={styles.resultsSection} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>搜索结果</Text>
          {searchResults.map(user => (
            <View key={user.id} style={styles.resultItem}>
              {renderAvatar(user.avatar, user.isOnline)}
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{user.name}</Text>
                <Text style={styles.resultStatus}>{user.isOnline ? '在线' : '离线'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.requestButton}
                onPress={() => handleSendRequest(user.name)}
              >
                <Text style={styles.requestButtonText}>发送请求</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {!isSearching && searchResults.length === 0 && searchQuery.length > 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#4B3F72" />
          <Text style={styles.emptyText}>未找到相关用户</Text>
          <Text style={styles.emptySubtext}>尝试搜索其他关键词</Text>
        </View>
      )}

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>温馨提示</Text>
        <View style={styles.tipItem}>
          <Ionicons name="information-circle" size={16} color="#7B68EE" />
          <Text style={styles.tipText}>监督请求需要对方确认后才能生效</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="information-circle" size={16} color="#7B68EE" />
          <Text style={styles.tipText}>您可以随时取消监督关系</Text>
        </View>
      </View>
    </View>
  );
};

export default AddSupervisorScreen;
