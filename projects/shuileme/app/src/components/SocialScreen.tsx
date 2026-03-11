import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/SocialScreen.styles';
import SupervisorList from './SupervisorList';

interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  status?: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

const SocialScreen: React.FC = () => {
  const [supervisingUsers, setSupervisingUsers] = useState<User[]>([
    { id: '1', name: '小明', avatar: 'https://i.pravatar.cc/100?img=1', isOnline: true },
    { id: '2', name: '小红', avatar: 'https://i.pravatar.cc/100?img=2', isOnline: false },
    { id: '3', name: '小刚', avatar: 'https://i.pravatar.cc/100?img=3', isOnline: true },
  ]);

  const [supervisors, setSupervisors] = useState<User[]>([
    { id: '4', name: '妈妈', avatar: 'https://i.pravatar.cc/100?img=5', isOnline: true, status: '在线' },
    { id: '5', name: '好友 A', avatar: 'https://i.pravatar.cc/100?img=6', isOnline: false, status: '10 分钟前在线' },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', userId: '4', userName: '妈妈', userAvatar: 'https://i.pravatar.cc/100?img=5', content: '早点休息哦~', timestamp: '22:30', isRead: false },
    { id: '2', userId: '1', userName: '小明', userAvatar: 'https://i.pravatar.cc/100?img=1', content: '今晚一起睡觉打卡', timestamp: '21:15', isRead: true },
    { id: '3', userId: '5', userName: '好友 A', userAvatar: 'https://i.pravatar.cc/100?img=6', content: '你昨天睡得好吗？', timestamp: '昨天', isRead: false },
  ]);

  const unreadCount = messages.filter(m => !m.isRead).length;

  const renderAvatar = (avatar: string, isOnline: boolean, size: number = 50) => (
    <View style={styles.avatarContainer}>
      <Image source={{ uri: avatar }} style={[styles.avatar, { width: size, height: size }]} />
      {isOnline && <View style={[styles.onlineIndicator, { width: size * 0.3, height: size * 0.3 }]} />}
    </View>
  );

  const renderSupervisingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>我监督的人</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle" size={24} color="#7B68EE" />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {supervisingUsers.map(user => (
          <TouchableOpacity key={user.id} style={styles.userItem}>
            {renderAvatar(user.avatar, user.isOnline)}
            <Text style={styles.userName}>{user.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSupervisorsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>监督我的人</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle" size={24} color="#7B68EE" />
        </TouchableOpacity>
      </View>
      <SupervisorList supervisors={supervisors} renderAvatar={renderAvatar} />
    </View>
  );

  const renderMessagesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>互动消息</Text>
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      {messages.map(message => (
        <TouchableOpacity key={message.id} style={[styles.messageItem, !message.isRead && styles.unreadMessage]}>
          <Image source={{ uri: message.userAvatar }} style={styles.messageAvatar} />
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageUserName}>{message.userName}</Text>
              <Text style={styles.messageTime}>{message.timestamp}</Text>
            </View>
            <Text style={[styles.messageText, !message.isRead && styles.unreadMessageText]}>
              {message.content}
            </Text>
          </View>
          {!message.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>社交监督</Text>
        <TouchableOpacity style={styles.inviteButton}>
          <Ionicons name="person-add" size={24} color="#FFFFFF" />
          <Text style={styles.inviteText}>邀请好友</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSupervisingSection()}
        {renderSupervisorsSection()}
        {renderMessagesSection()}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="qr-code-scan" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default SocialScreen;
