import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { Bell, Info, CheckCircle, Clock, ShieldCheck, Mail, AlertTriangle, ChevronRight } from 'lucide-react-native';
import api from '../../api/client';

const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.log('Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: any) => {
      try {
          await api.patch(`notifications/${id}/mark-read/`);
          setNotifications(notifications.map((n: any) => n.id === id ? { ...n, is_read: true } : n));
      } catch (e) {
          console.error(e);
      }
  };

  const renderIcon = (type: string, isRead: boolean) => {
    const color = isRead ? '#94a3b8' : '#6366f1';
    switch (type) {
      case 'property_approved': return <CheckCircle color="#10b981" size={20} />;
      case 'property_rejected': return <AlertTriangle color="#ef4444" size={20} />;
      case 'message': return <Mail color={color} size={20} />;
      case 'system': return <ShieldCheck color={color} size={20} />;
      default: return <Bell color={color} size={20} />;
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
        style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
        onPress={() => {
            if (!item.is_read) markAsRead(item.id);
            if (item.link) {
                // Potential navigation logic based on link
            }
        }}
    >
      <View style={[styles.iconContainer, !item.is_read && styles.unreadIconCont]}>
        {renderIcon(item.type, item.is_read)}
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
            <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
            {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
        <View style={styles.footer}>
          <Clock color="#94a3b8" size={12} style={{ marginRight: 4 }} />
          <Text style={styles.time}>{new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
      <ChevronRight color="#cbd5e1" size={16} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>SYNCING PIPELINE...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item: any, index: number) => (item.id || index).toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366f1']} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
            <View style={styles.listHeader}>
                <Text style={styles.headerTitle}>Timeline</Text>
                <TouchableOpacity onPress={() => api.post('notifications/mark-all-read/').then(fetchNotifications)}>
                    <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
            </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.bellCircle}>
                <Bell color="#cbd5e1" size={48} />
            </View>
            <Text style={styles.emptyTitle}>Clear Skies</Text>
            <Text style={styles.emptySubtext}>Your broadcast buffer is currently empty. We will notify you of all registry updates here.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 10, fontWeight: '900', color: '#6366f1', letterSpacing: 2 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 },
  markAllText: { fontSize: 12, fontWeight: '700', color: '#6366f1' },
  listContent: { paddingBottom: 40 },
  notificationItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#1e293b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  unreadItem: { borderColor: 'rgba(99, 102, 241, 0.2)', backgroundColor: '#fcfcff' },
  iconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  unreadIconCont: { backgroundColor: 'rgba(99, 102, 241, 0.05)' },
  content: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '700', color: '#64748b' },
  unreadTitle: { color: '#1e293b', fontWeight: '800' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' },
  message: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 8, fontWeight: '500' },
  footer: { flexDirection: 'row', alignItems: 'center' },
  time: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 },
  bellCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, fontWeight: '500' }
});

export default NotificationsScreen;
