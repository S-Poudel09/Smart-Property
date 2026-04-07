import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Dimensions
} from 'react-native';
import { 
  LayoutDashboard, 
  PlusCircle, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  XCircle,
  Eye,
  ChevronRight
} from 'lucide-react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/alert';

const { width } = Dimensions.get('window');

const SellerDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    rejected: 0,
    views: 0
  });
  const [recentListings, setRecentListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's own properties
      const response = await api.get('/properties/?seller=me');
      const properties = response.data;
      
      const statsUpdate = {
        total: properties.length,
        published: properties.filter((p: any) => p.status === 'published').length,
        pending: properties.filter((p: any) => p.status === 'submitted' || p.status === 'approved').length,
        rejected: properties.filter((p: any) => p.status === 'rejected').length,
        views: properties.reduce((acc: number, p: any) => acc + (p.view_count || 0), 0)
      };
      
      setStats(statsUpdate);
      setRecentListings(properties.slice(0, 3));
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name || 'Seller'}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddListing')}>
          <PlusCircle color="#fff" size={20} />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
            <View style={styles.statIconContainer}>
                <TrendingUp color="#3b82f6" size={20} />
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Listings</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#ecfdf5' }]}>
            <View style={styles.statIconContainer}>
                <CheckCircle color="#10b981" size={20} />
            </View>
            <Text style={styles.statValue}>{stats.published}</Text>
            <Text style={styles.statLabel}>Published</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fff7ed' }]}>
            <View style={styles.statIconContainer}>
                <Clock color="#f97316" size={20} />
            </View>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
            <View style={styles.statIconContainer}>
                <XCircle color="#ef4444" size={20} />
            </View>
            <Text style={styles.statValue}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyListings')}>
                <Text style={styles.seeAllText}>View all</Text>
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
                <View style={[styles.statusDot, { backgroundColor: item.status === 'published' ? '#10b981' : (item.status === 'rejected' ? '#ef4444' : '#f97316') }]} />
                <View>
                    <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.listingPrice}>NPR {item.price}</Text>
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
            <Text style={styles.emptyText}>No listings found. Start adding your properties!</Text>
          </View>
        )}
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionRow}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Messages')}>
                <MessageSquare color="#6366f1" size={24} />
                <Text style={styles.actionCardText}>Inbox</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('SellerAnalytics')}>
                <LayoutDashboard color="#10b981" size={24} />
                <Text style={styles.actionCardText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Verification module coming soon')}>
                <CheckCircle color="#f97316" size={24} />
                <Text style={styles.actionCardText}>Verification</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>
    </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 20,
    borderRadius: 16,
    gap: 10,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  seeAllText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  listingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  listingPrice: {
    fontSize: 14,
    color: '#64748b',
  },
  listingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewCountText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    lineHeight: 20,
  },
  actionSection: {
    paddingLeft: 24,
    paddingBottom: 40,
  },
  actionRow: {
    paddingRight: 24,
    marginTop: 16,
    gap: 16,
  },
  actionCard: {
    width: 120,
    height: 100,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  }
});

export default SellerDashboardScreen;
