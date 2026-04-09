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
  Alert,
  StatusBar
} from 'react-native';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  BadgeCheck,
  AlertCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { getFullImageUrl } from '../../api/client';

const PendingPropertiesScreen = ({ navigation }: any) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingProperties = async () => {
    try {
      const response = await api.get('/properties/');
      // Filter for submitted/pending status
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
      'APPROVE ASSET',
      `Execute production release for "${title}" into the global registry?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        { 
          text: 'EXECUTE APPROVAL', 
          onPress: async () => {
            try {
              await api.post(`/properties/${id}/approve/`);
              Alert.alert('SUCCESS', 'Registry node published successfully.');
              fetchPendingProperties();
            } catch (error) {
              Alert.alert('ERROR', 'System failed to update registry state.');
            }
          }
        }
      ]
    );
  };

  const handleReject = (id: string, title: string) => {
    Alert.prompt(
      'REJECT SUBMISSION',
      'Provide governance reason for rejection:',
      [
        { text: 'CANCEL', style: 'cancel' },
        { 
          text: 'CONFIRM REJECT', 
          style: 'destructive',
          onPress: async (reason: string | undefined) => {
            try {
              await api.post(`/properties/${id}/reject/`, { rejection_reason: reason || 'Missing documentation' });
              Alert.alert('VOIDED', 'Submission node rejected.');
              fetchPendingProperties();
            } catch (error) {
              Alert.alert('ERROR', 'Failed to void submission.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => navigation.navigate('AdminPropertyDetail', { id: item.id })}
      >
        <Image 
          source={{ uri: getFullImageUrl(item.property_images?.[0]?.image) || 'https://via.placeholder.com/400' }} 
          style={styles.heroImage} 
        />
        <View style={styles.statusFloat}>
           <Clock color="#f59e0b" size={12} />
           <Text style={styles.statusFloatText}>AWAITING AUDIT</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <View style={styles.mainInfo}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={styles.coordRow}>
                <MapPin color="#94a3b8" size={12} />
                <Text style={styles.coordText}>{item.location}</Text>
            </View>
        </View>
        
        <View style={styles.valuationRow}>
            <Text style={styles.valLabel}>VALUATION</Text>
            <Text style={styles.valPrice}>NPR {item.price?.toLocaleString() || item.price}</Text>
        </View>

        <View style={styles.sellerNode}>
            <View style={styles.sellerAvatar}>
                <User color="#6366f1" size={16} />
            </View>
            <View style={styles.sellerDetails}>
                <Text style={styles.sellerLabel}>SUBMITTED BY</Text>
                <Text style={styles.sellerName}>{item.owner_name || 'Registry User'}</Text>
            </View>
            <BadgeCheck color="#10b981" size={18} />
        </View>

        <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.btn, styles.rejectBtn]} 
              onPress={() => handleReject(item.id, item.title)}
            >
              <XCircle color="#ef4444" size={16} />
              <Text style={styles.rejectText}>VOID</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btn, styles.approveBtn]} 
              onPress={() => handleApprove(item.id, item.title)}
            >
              <CheckCircle color="#10b981" size={16} />
              <Text style={styles.approveText}>PUBLISH</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.detailBtn}
              onPress={() => navigation.navigate('AdminPropertyDetail', { id: item.id })}
            >
              <ChevronRight color="#6366f1" size={20} />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Fetching Compliance Queue...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <Building2 color="#1e293b" size={28} />
        <View style={styles.topBarText}>
            <Text style={styles.topBarTitle}>Registry Audit</Text>
            <Text style={styles.topBarSub}>{properties.length} submissions pending verification</Text>
        </View>
      </View>

      <FlatList
        data={properties}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShieldCheck color="#cbd5e1" size={80} />
            <Text style={styles.emptyText}>Registry Synthesized</Text>
            <Text style={styles.emptySubtext}>All property nodes have been cleared for production release.</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                <Text style={styles.refreshBtnText}>REFRESH PIPELINE</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
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
    fontSize: 10,
    fontWeight: '900',
    color: '#6366f1',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  topBar: {
    padding: 24,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  topBarText: {
      marginLeft: 16,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  topBarSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  cardHeader: {
    height: 200,
    backgroundColor: '#f1f5f9',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  statusFloat: {
      position: 'absolute',
      top: 16,
      left: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 100,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: '#fef3c7',
  },
  statusFloatText: {
      fontSize: 9,
      fontWeight: '900',
      color: '#d97706',
      letterSpacing: 0.5,
  },
  cardContent: {
    padding: 24,
  },
  mainInfo: {
      marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    lineHeight: 26,
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  coordText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  valuationRow: {
      padding: 16,
      backgroundColor: '#f8fafc',
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  valLabel: {
      fontSize: 10,
      fontWeight: '900',
      color: '#cbd5e1',
      letterSpacing: 1,
  },
  valPrice: {
      fontSize: 18,
      fontWeight: '900',
      color: '#6366f1',
  },
  sellerNode: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      paddingHorizontal: 4,
  },
  sellerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#eff6ff',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  sellerDetails: {
      flex: 1,
  },
  sellerLabel: {
      fontSize: 8,
      fontWeight: '900',
      color: '#cbd5e1',
      letterSpacing: 0.5,
  },
  sellerName: {
      fontSize: 14,
      fontWeight: '800',
      color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  approveBtn: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  rejectBtn: {
    backgroundColor: '#fff',
    borderColor: '#fee2e2',
  },
  approveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rejectText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  detailBtn: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#f1f5f9',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 24,
    letterSpacing: -0.5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    fontWeight: '500',
  },
  refreshBtn: {
      marginTop: 32,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: '#1e293b',
  },
  refreshBtnText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
  },
});

export default PendingPropertiesScreen;
