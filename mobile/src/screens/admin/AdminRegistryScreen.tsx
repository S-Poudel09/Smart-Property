import React, { useState, useEffect, useCallback } from 'react';
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
  Filter,
  Search,
  CheckCircle2,
  LayoutGrid,
  BarChart3
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { getFullImageUrl } from '../../api/client';

const AdminRegistryScreen = ({ route, navigation }: any) => {
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'pending');

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties/');
      setAllProperties(response.data);
      filterList(response.data, activeTab);
    } catch (error) {
      console.error('Fetch absolute registry error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [activeTab])
  );

  const filterList = (props: any[], status: string) => {
    let filtered = [];
    switch (status) {
      case 'pending':
        filtered = props.filter((p: any) => 
          p.status.toLowerCase().includes('submitted') || 
          p.status.toLowerCase().includes('pending')
        );
        break;
      case 'published':
        filtered = props.filter((p: any) => 
          p.status.toLowerCase().includes('published') || 
          p.status.toLowerCase().includes('approved')
        );
        break;
      case 'rejected':
        filtered = props.filter((p: any) => 
          p.status.toLowerCase().includes('rejected')
        );
        break;
      default:
        filtered = props;
    }
    setFilteredProperties(filtered);
  };

  useEffect(() => {
    filterList(allProperties, activeTab);
  }, [activeTab, allProperties]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('pending') || s.includes('submitted')) return { color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={12} color="#f59e0b" />, label: 'AWAITING AUDIT' };
    if (s.includes('published') || s.includes('approved')) return { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle2 size={12} color="#10b981" />, label: 'LIVE ON GRID' };
    if (s.includes('rejected')) return { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={12} color="#ef4444" />, label: 'VOIDED' };
    return { color: '#64748b', bg: '#f1f5f9', icon: <Clock size={12} color="#64748b" />, label: status.toUpperCase() };
  };

  const renderItem = ({ item }: any) => {
    const statusCfg = getStatusConfig(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('AdminPropertyDetail', { id: item.id })}
      >
        <Image 
          source={{ uri: getFullImageUrl(item.property_images?.[0]?.image) || 'https://via.placeholder.com/400' }} 
          style={styles.heroImage} 
        />
        
        <View style={styles.cardOverlay}>
            <View style={[styles.statusTag, { backgroundColor: statusCfg.bg }]}>
                {statusCfg.icon}
                <Text style={[styles.statusTagText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            </View>
        </View>

        <View style={styles.cardBody}>
            <View style={styles.mainInfo}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <View style={styles.locationRow}>
                    <MapPin color="#94a3b8" size={12} />
                    <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
                </View>
            </View>

            <View style={styles.footerRow}>
                <View style={styles.sellerChip}>
                    <User color="#6366f1" size={14} />
                    <Text style={styles.sellerName} numberOfLines={1}>{item.owner_name || 'Registry User'}</Text>
                </View>
                <Text style={styles.priceText}>NPR {item.price?.toLocaleString()}</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  const Tab = ({ id, label, count }: any) => (
    <TouchableOpacity 
      style={[styles.tab, activeTab === id && styles.activeTab]}
      onPress={() => setActiveTab(id)}
    >
      <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>{label}</Text>
      {count > 0 && (
          <View style={[styles.tabBadge, activeTab === id && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === id && styles.activeTabBadgeText]}>{count}</Text>
          </View>
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Synchronizing Registry...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <Building2 color="#1e293b" size={28} />
            <Text style={styles.headerTitle}>Master Registry</Text>
        </View>
        
        <View style={styles.tabContainer}>
            <Tab id="pending" label="Awaiting" count={allProperties.filter((p: any) => p.status.toLowerCase().includes('pending') || p.status.toLowerCase().includes('submitted')).length} />
            <Tab id="published" label="Live" />
            <Tab id="rejected" label="Voided" />
        </View>
      </View>

      <FlatList
        data={filteredProperties}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <LayoutGrid color="#cbd5e1" size={80} />
            <Text style={styles.emptyText}>Registry Sector Clear</Text>
            <Text style={styles.emptySubtext}>No property nodes found in this spectrum.</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTop: {
    padding: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeTab: {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
  },
  activeTabText: {
    color: '#fff',
  },
  tabBadge: {
      marginLeft: 6,
      backgroundColor: '#f1f5f9',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
  },
  activeTabBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
      fontSize: 10,
      fontWeight: '900',
      color: '#94a3b8',
  },
  activeTabBadgeText: {
      color: '#fff',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f1f5f9',
  },
  cardOverlay: {
      position: 'absolute',
      top: 16,
      left: 16,
  },
  statusTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 100,
      gap: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
  },
  statusTagText: {
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.5,
  },
  cardBody: {
      padding: 20,
  },
  mainInfo: {
      marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#f8fafc',
  },
  sellerChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#f8fafc',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      maxWidth: '60%',
  },
  sellerName: {
      fontSize: 12,
      fontWeight: '700',
      color: '#475569',
  },
  priceText: {
      fontSize: 16,
      fontWeight: '900',
      color: '#6366f1',
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
});

export default AdminRegistryScreen;
