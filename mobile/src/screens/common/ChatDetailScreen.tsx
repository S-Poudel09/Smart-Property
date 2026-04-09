import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Send, ChevronLeft } from 'lucide-react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ChatDetailScreen = ({ route, navigation }: any) => {
  const { roomId, propertyTitle } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!roomId || roomId === 'undefined') {
      setIsLoading(false);
      return;
    }

    fetchMessages();
    
    // Simple polling for new messages in this MVP
    const interval = setInterval(() => {
        fetchMessages(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [roomId]);

  const fetchMessages = async (showLoader = true) => {
    // CRITICAL: Prevent calling API with invalid roomId string
    if (!roomId || roomId === 'undefined') return;

    if (showLoader) setIsLoading(true);
    try {
      const response = await api.get(`/chat/messages/room/${roomId}/`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender_id: user?.id,
      timestamp: new Date().toISOString(),
      status: 'SENDING'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const payload = {
        RoomID: roomId,
        MessageText: tempMessage.text
      };
      const response = await api.post('/chat/messages/', payload);
      
      // Update local message list with actual sent message
      setMessages(prev => 
        prev.map(msg => msg.id === tempMessage.id ? response.data : msg)
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Revert optimism if failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      Alert.alert('Send Failed', 'Could not transmit message to the registry.');
    }
  };

  const renderMessage = ({ item }: any) => {
    // Support both PascalCase (backend) and lowercase (local temp message)
    const text = item.MessageText || item.text;
    const senderId = item.SenderID || item.sender_id || item.sender?.id;
    const timestamp = item.Timestamp || item.timestamp;
    const isMe = senderId === user?.id; 
    
    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
            {text}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextOther]}>
            {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Chat</Text>
            {propertyTitle && (
                <Text style={styles.headerSubtitle} numberOfLines={1}>{propertyTitle}</Text>
            )}
        </View>
      </View>

      {!roomId || roomId === 'undefined' ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Invalid Chat Session</Text>
          <Text style={styles.emptySubtext}>Please go back and try again.</Text>
        </View>
      ) : isLoading && messages.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => (item.MessageID || item.id || Math.random().toString()).toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
              <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
              </View>
          }
        />
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  messageWrapperMe: {
    justifyContent: 'flex-end',
  },
  messageWrapperOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
  },
  messageBubbleMe: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTextOther: {
    color: '#1e293b',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeTextOther: {
    color: '#94a3b8',
  },
  emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
  },
  emptyText: {
      color: '#1e293b',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
  },
  emptySubtext: {
      color: '#64748b',
      fontSize: 14,
      textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    minHeight: 48,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: '#1e293b',
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
});

export default ChatDetailScreen;
