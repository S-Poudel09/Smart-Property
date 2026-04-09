import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { 
  BarChart3, 
  PlusCircle, 
  MessageSquare, 
  User, 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  Eye, 
  ChevronRight,
  Shield,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SellerDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const propRes = await api.get('/properties/?seller=me');
      const properties = propRes.data;
      
      const counts = {
        total: properties.length,
        published: properties.filter((p: any) => p.status?.toLowerCase() === 'published').length,
        pending: properties.filter((p: any) => ['submitted', 'pending'].includes(p.status?.toLowerCase())).length,
        rejected: properties.filter((p: any) => p.status?.toLowerCase() === 'rejected').length,
      };

      setStats(counts);
      setRecentListings(properties.slice(0, 5));
    } catch (error) {
      console.error('Seller Dashboard Error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>SYNCING PORTFOLIO...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366f1']} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Registry Command</Text>
          <Text style={styles.userName}>{user?.full_name || 'Verified Member'}</Text>
        </View>
        <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => navigation.navigate('SellerProfile')}
        >
          <User color="#1e293b" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.statItem, { backgroundColor: '#eff6ff' }]}>
            <Text style={styles.statLabel}>Managed Nodes</Text>
            <Text style={[styles.statValue, { color: '#2563eb' }]}>{stats?.total || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statItem, { backgroundColor: '#ecfdf5' }]}>
            <Text style={styles.statLabel}>Active Public</Text>
            <Text style={[styles.statValue, { color: '#059669' }]}>{stats?.published || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statItem, { backgroundColor: '#fffbeb' }]}>
            <Text style={styles.statLabel}>In Verification</Text>
            <Text style={[styles.statValue, { color: '#d97706' }]}>{stats?.pending || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statItem, { backgroundColor: '#fef2f2' }]}>
            <Text style={styles.statLabel}>Registry Revoked</Text>
            <Text style={[styles.statValue, { color: '#dc2626' }]}>{stats?.rejected || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Quick Operations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionRow}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Messages')}>
                <MessageSquare color="#6366f1" size={24} />
                <Text style={styles.actionCardText}>Inbox</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('SellerAnalytics')}>
                <TrendingUp color="#10b981" size={24} />
                <Text style={styles.actionCardText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AddListing')}>
                <PlusCircle color="#f59e0b" size={24} />
                <Text style={styles.actionCardText}>Inject Node</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('KYC')}>
                <Shield color="#6366f1" size={24} />
                <Text style={styles.actionCardText}>Identity</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Settings')}>
                <Search color="#64748b" size={24} />
                <Text style={styles.actionCardText}>Config</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.listingsSection}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Local Node Buffer</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyListings')}>
                <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
        </View>
        
        {recentListings.length > 0 ? (
          recentListings.map((item: any) => (
            <TouchableOpacity 
                key={item.PropertyID || item.id} 
                style={styles.listingItem}
                onPress={() => navigation.navigate('PropertyDetail', { id: item.PropertyID || item.id })}
            >
              <View style={styles.listingLeft}>
                <View style={[styles.statusDot, { backgroundColor: item.status?.toLowerCase() === 'published' ? '#10b981' : (item.status?.toLowerCase() === 'rejected' ? '#ef4444' : '#f97316') }]} />
                <View>
                    <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.listingPrice}>NPR {parseFloat(item.price).toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.listingRight}>
                <View style={styles.viewCount}>
                    <Eye color="#94a3b8" size={14} />
                    <Text style={styles.viewCountText}>{item.view_count || 0}</Text>
                </View>
                <ChevronRight color="#cbd5e1" size={20} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Building2 color="#cbd5e1" size={48} />
            <Text style={styles.emptyText}>No registered nodes detected.</Text>
            <TouchableOpacity 
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('AddListing')}
            >
                <Text style={styles.emptyBtnText}>Inject First Listing</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 16, fontSize: 10, fontWeight: '900', color: '#6366f1', letterSpacing: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, marginBottom: 24, shadowColor: '#1e293b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  greeting: { fontSize: 13, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  userName: { fontSize: 24, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 },
  profileBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  statsContainer: { paddingHorizontal: 24, marginBottom: 32 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { flex: 1, minWidth: (width - 60) / 2, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  statLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '900' },
  actionSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginHorizontal: 24, marginBottom: 16 },
  actionRow: { paddingLeft: 24, paddingRight: 8 },
  actionCard: { width: 100, height: 100, backgroundColor: '#fff', borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#1e293b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, marginRight: 12 },
  actionCardText: { fontSize: 10, fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  listingsSection: { paddingHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAllText: { fontSize: 11, fontWeight: '800', color: '#6366f1' },
  listingItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f1f5f9' },
  listingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  listingTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  listingPrice: { fontSize: 13, fontWeight: '800', color: '#6366f1' },
  listingRight: { flexDirection: 'row', alignItems: 'center' },
  viewCount: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  viewCountText: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  emptyContainer: { alignItems: 'center', padding: 40, backgroundColor: '#f8fafc', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },
  emptyText: { marginTop: 16, fontSize: 14, color: '#64748b', fontWeight: '500', textAlign: 'center' },
  emptyBtn: { marginTop: 20, backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' }
});

export default SellerDashboardScreen;
