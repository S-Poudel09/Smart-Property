import React, { useState, useEffect, useCallback } from 'react';
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
  Users, 
  Building2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  History, 
  Activity, 
  FileSearch,
  CheckCircle2,
  XCircle,
  BarChart3,
  ChevronRight
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';

const AdminDashboardScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [userCountRes, propCountRes, systemAnalyticsRes] = await Promise.all([
        api.get('users/count/'),
        api.get('properties/'),
        api.get('admin/analytics/')
      ]);

      const properties = propCountRes.data;
      const pendingProps = properties.filter((p: any) => p.status.toLowerCase().includes('submitted') || p.status.toLowerCase().includes('pending'));
      const approvedProps = properties.filter((p: any) => p.status.toLowerCase().includes('published') || p.status.toLowerCase().includes('approved'));
      const rejectedProps = properties.filter((p: any) => p.status.toLowerCase().includes('rejected'));

      setStats({
        totalUsers: userCountRes.data.count,
        totalProperties: properties.length,
        pendingProperties: pendingProps.length,
        approvedProperties: approvedProps.length,
        rejectedProperties: rejectedProps.length,
        activeTransactions: systemAnalyticsRes.data.active_transactions || 0,
        recentSubmissions: properties.slice(0, 3)
      });
    } catch (error) {
      console.error('Admin Dashboard Sync Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Synchronizing Nexus...</Text>
      </View>
    );
  }

  const renderStatCard = (icon: any, title: string, value: string | number, color: string, trend?: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}10` }]}>
        {icon}
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{title}</Text>
        <Text style={[styles.statValue, { color: '#1e293b' }]}>{value}</Text>
        {trend && (
            <View style={styles.trendRow}>
                <ArrowUpRight color="#10b981" size={12} />
                <Text style={styles.trendText}>{trend}</Text>
            </View>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
            <View>
                <Text style={styles.nexusTitle}>Nexus Center</Text>
                <Text style={styles.nexusSub}>Admin Sovereignty Overview</Text>
            </View>
            <TouchableOpacity style={styles.historyBtn}>
                <History color="#1e293b" size={24} />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statRow}>
            {renderStatCard(<Users color="#6366f1" size={20} />, "Nodes", stats?.totalUsers || 0, "#6366f1", "+2%")}
            {renderStatCard(<Building2 color="#10b981" size={20} />, "Assets", stats?.totalProperties || 0, "#10b981", "+8%")}
        </View>
        <View style={styles.statRow}>
            {renderStatCard(<TrendingUp color="#3b82f6" size={20} />, "Trades", stats?.activeTransactions || 0, "#3b82f6")}
            <View style={[styles.statCard, { backgroundColor: '#1e293b' }]}>
                <BarChart3 color="#fff" size={20} />
                <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.6)' }]}>SYSTEM HEALTH</Text>
                <Text style={[styles.statValue, { color: '#fff' }]}>OPTIMAL</Text>
            </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Registry Sectors</Text>
            <Activity color="#6366f1" size={16} />
        </View>
        
        <View style={styles.actionGrid}>
          {/* Section 1: All Awaiting */}
          <TouchableOpacity 
            style={[styles.sectorCard, { borderLeftColor: '#f59e0b' }]} 
            onPress={() => navigation.navigate('AdminApprovals', { initialTab: 'pending' })}
          >
            <View style={[styles.sectorIcon, { backgroundColor: '#fffbeb' }]}>
              <Clock color="#d97706" size={24} />
            </View>
            <View style={styles.sectorInfo}>
                <Text style={styles.sectorLabel}>Awaiting Audit</Text>
                <Text style={styles.sectorSub}>{stats?.pendingProperties || 0} pending submissions</Text>
            </View>
            <View style={styles.countBadge}><Text style={styles.countText}>{stats?.pendingProperties || 0}</Text></View>
          </TouchableOpacity>

          {/* Section 2: All Active */}
          <TouchableOpacity 
            style={[styles.sectorCard, { borderLeftColor: '#10b981' }]} 
            onPress={() => navigation.navigate('AdminApprovals', { initialTab: 'published' })}
          >
            <View style={[styles.sectorIcon, { backgroundColor: '#f0fdf4' }]}>
              <CheckCircle2 color="#059669" size={24} />
            </View>
            <View style={styles.sectorInfo}>
                <Text style={styles.sectorLabel}>Live Registry</Text>
                <Text style={styles.sectorSub}>{stats?.approvedProperties || 0} active property nodes</Text>
            </View>
          </TouchableOpacity>

          {/* Section 3: All Rejected */}
          <TouchableOpacity 
            style={[styles.sectorCard, { borderLeftColor: '#ef4444' }]} 
            onPress={() => navigation.navigate('AdminApprovals', { initialTab: 'rejected' })}
          >
            <View style={[styles.sectorIcon, { backgroundColor: '#fef2f2' }]}>
              <XCircle color="#ef4444" size={24} />
            </View>
            <View style={styles.sectorInfo}>
                <Text style={styles.sectorLabel}>Voided Submissions</Text>
                <Text style={styles.sectorSub}>{stats?.rejectedProperties || 0} nodes rejected from catalog</Text>
            </View>
          </TouchableOpacity>

          {/* Section 4: User Management */}
          <TouchableOpacity 
            style={[styles.sectorCard, { borderLeftColor: '#6366f1' }]} 
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <View style={[styles.sectorIcon, { backgroundColor: '#eef2ff' }]}>
              <Users color="#6366f1" size={24} />
            </View>
            <View style={styles.sectorInfo}>
                <Text style={styles.sectorLabel}>Users Management</Text>
                <Text style={styles.sectorSub}>Manage {stats?.totalUsers || 0} platform identity nodes</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Registry Events</Text>
        <View style={styles.eventList}>
            {stats?.recentSubmissions?.map((item: any, idx: number) => (
                <TouchableOpacity key={idx} style={styles.eventItem} onPress={() => navigation.navigate('AdminPropertyDetail', { id: item.id })}>
                    <View style={styles.eventContent}>
                        <Text style={styles.eventTitle}>{item.title}</Text>
                        <Text style={styles.eventMeta}>{item.location} • NPR {item.price?.toLocaleString()}</Text>
                    </View>
                    <ChevronRight color="#cbd5e1" size={20} />
                </TouchableOpacity>
            ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.versionTag}>
            <Text style={styles.versionLabel}>PROTOCOL SECURE • NEXUS v4.5</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  header: {
    padding: 24,
    paddingTop: 64,
  },
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  nexusTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -1,
  },
  nexusSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#f1f5f9',
  },
  statGrid: {
      paddingHorizontal: 20,
      gap: 12,
  },
  statRow: {
      flexDirection: 'row',
      gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statInfo: {
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 4,
  },
  trendText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#10b981',
  },
  section: {
    padding: 24,
    marginTop: 8,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionGrid: {
      gap: 16,
  },
  sectorCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderLeftWidth: 6,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  sectorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectorInfo: {
      flex: 1,
  },
  sectorLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  sectorSub: {
      fontSize: 12,
      color: '#94a3b8',
      fontWeight: '500',
      marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  eventList: {
      backgroundColor: '#f8fafc',
      borderRadius: 24,
      padding: 12,
      gap: 8,
  },
  eventItem: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  eventContent: {
      flex: 1,
      marginRight: 12,
  },
  eventTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#1e293b',
  },
  eventMeta: {
      fontSize: 12,
      color: '#94a3b8',
      marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  versionTag: {
      backgroundColor: '#f1f5f9',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 100,
  },
  versionLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 2,
  },
});

export default AdminDashboardScreen;
