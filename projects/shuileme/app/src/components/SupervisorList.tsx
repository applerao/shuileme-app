import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/SupervisorList.styles';

interface Supervisor {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  status?: string;
}

interface SupervisorListProps {
  supervisors: Supervisor[];
  renderAvatar?: (avatar: string, isOnline: boolean, size?: number) => React.ReactNode;
  onSupervisorPress?: (supervisor: Supervisor) => void;
  onRemove?: (supervisor: Supervisor) => void;
  showRemoveButton?: boolean;
}

const SupervisorList: React.FC<SupervisorListProps> = ({
  supervisors,
  renderAvatar,
  onSupervisorPress,
  onRemove,
  showRemoveButton = false,
}) => {
  const defaultRenderAvatar = (avatar: string, isOnline: boolean, size: number = 45) => (
    <View style={styles.avatarContainer}>
      <Image source={{ uri: avatar }} style={[styles.avatar, { width: size, height: size }]} />
      {isOnline && <View style={[styles.onlineIndicator, { width: size * 0.3, height: size * 0.3 }]} />}
    </View>
  );

  const displayAvatar = renderAvatar || defaultRenderAvatar;

  if (supervisors.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={48} color="#4B3F72" />
        <Text style={styles.emptyText}>暂无监督者</Text>
        <Text style={styles.emptySubtext}>添加监督者来帮助你保持作息规律</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {supervisors.map((supervisor, index) => (
        <TouchableOpacity
          key={supervisor.id}
          style={[styles.supervisorItem, index < supervisors.length - 1 && styles.itemBorder]}
          onPress={() => onSupervisorPress?.(supervisor)}
          activeOpacity={0.7}
        >
          {displayAvatar(supervisor.avatar, supervisor.isOnline)}
          
          <View style={styles.supervisorInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.supervisorName}>{supervisor.name}</Text>
              {supervisor.isOnline && (
                <View style={styles.onlineBadge}>
                  <Text style={styles.onlineBadgeText}>在线</Text>
                </View>
              )}
            </View>
            <Text style={styles.supervisorStatus}>
              {supervisor.status || (supervisor.isOnline ? '当前在线' : '最近在线')}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#7B68EE" />
            </TouchableOpacity>
            
            {showRemoveButton && onRemove && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => onRemove(supervisor)}
              >
                <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              </TouchableOpacity>
            )}
            
            <Ionicons name="chevron-forward" size={20} color="#6B5B9F" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SupervisorList;
