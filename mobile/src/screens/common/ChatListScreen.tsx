import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { MessageSquare, User as UserIcon, ChevronRight } from 'lucide-react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ChatListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      const response = await api.get('chat/rooms/');
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchRooms();
  };

  const renderItem = ({ item }: any) => {
    // Backend uses PascalCase (RoomID, Participants, PropertyTitle, LastMessage)
    const roomId = item.RoomID || item.id;
    const participants = item.Participants || item.participants || [];
    const otherUser = participants.find((p: any) => p.id !== user?.id) || { name: 'Unknown User' };
    const propertyTitle = item.PropertyTitle || item.property?.title || 'General Chat';
    const lastMsg = item.LastMessage || item.last_message;
    
    const otherUserName = otherUser.name || otherUser.full_name || 'Unknown User';

    if (!roomId) return null; // Safety check

    return (
      <TouchableOpacity 
        style={styles.roomItem}
        onPress={() => navigation.navigate('ChatDetail', { roomId, propertyTitle })}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{otherUserName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.roomInfo}>
          <Text style={styles.userName}>{otherUserName}</Text>
          <Text style={styles.propertyTitle} numberOfLines={1}>{propertyTitle}</Text>
          {lastMsg && (
             <Text style={styles.lastMessage} numberOfLines={1}>
                {lastMsg.SenderID === user?.id || lastMsg.sender_id === user?.id ? 'You: ' : ''}
                {lastMsg.MessageText || lastMsg.text}
             </Text>
          )}
        </View>
        <ChevronRight color="#cbd5e1" size={20} />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={rooms}
        keyExtractor={(item: any) => (item.RoomID || item.id || Math.random().toString())}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageSquare color="#cbd5e1" size={48} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No messages yet.</Text>
            <Text style={styles.emptySubtext}>When you contact an owner or a buyer contacts you, messages will appear here.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60, // Account for notch
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  listContainer: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366f1',
  },
  roomInfo: {
    flex: 1,
    marginRight: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ChatListScreen;
