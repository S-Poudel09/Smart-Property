import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react-native';
import api, { getFullImageUrl } from '../../api/client';

const PendingPropertiesScreen = ({ navigation }: any) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingProperties = async () => {
    try {
      const response = await api.get('/properties/');
      // Filter for submitted/pending
      const pending = response.data.filter((p: any) => 
        p.status.toLowerCase() === 'submitted' || 
        p.status.toLowerCase() === 'pending'
      );
      setProperties(pending);
    } catch (error) {
      console.error('Fetch pending error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingProperties();
  };

  const handleApprove = async (id: string, title: string) => {
    Alert.alert(
      'Approve Property',
      `Are you sure you want to approve "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: async () => {
            try {
              await api.post(`/properties/${id}/approve/`);
              Alert.alert('Success', 'Property approved and published.');
              fetchPendingProperties();
            } catch (error) {
              Alert.alert('Error', 'Failed to approve property.');
            }
          }
        }
      ]
    );
  };

  const handleReject = (id: string, title: string) => {
    Alert.prompt(
      'Reject Property',
      'Please enter the reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: async (reason: string | undefined) => {
            try {
              await api.post(`/properties/${id}/reject/`, { rejection_reason: reason });
              Alert.alert('Success', 'Property rejected.');
              fetchPendingProperties();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject property.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
      >
        <Image 
          source={{ uri: getFullImageUrl(item.property_images?.[0]?.image) || 'https://via.placeholder.com/150' }} 
          style={styles.thumbnail} 
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={styles.metaRow}>
            <MapPin color="#64748b" size={14} />
            <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <User color="#64748b" size={14} />
            <Text style={styles.metaText}>Seller: {item.owner_name || 'Verified User'}</Text>
          </View>
          <Text style={styles.price}>NPR {item.price}</Text>
        </View>
        <ChevronRight color="#cbd5e1" size={20} />
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.rejectBtn]} 
          onPress={() => handleReject(item.id, item.title)}
        >
          <XCircle color="#ef4444" size={18} />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, styles.approveBtn]} 
          onPress={() => handleApprove(item.id, item.title)}
        >
          <CheckCircle color="#10b981" size={18} />
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading Registry Submissions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Building2 color="#6366f1" size={32} />
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <Text style={styles.headerCount}>{properties.length} Active Requests</Text>
      </View>

      <FlatList
        data={properties}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Clock color="#cbd5e1" size={64} />
            <Text style={styles.emptyText}>All submissions cleared</Text>
            <Text style={styles.emptySubtext}>New requests will appear here after seller validation.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 12,
    fontWeight: '800',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 8,
  },
  headerCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  list: {
    padding: 24,
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  info: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6366f1',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: '#fcfdfe',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  approveBtn: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  rejectBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  approveText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '700',
  },
  rejectText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default PendingPropertiesScreen;
