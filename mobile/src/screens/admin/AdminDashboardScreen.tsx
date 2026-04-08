import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react-native';
import api from '../../api/client';

const AdminDashboardScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [userCountRes, propCountRes, systemAnalyticsRes] = await Promise.all([
        api.get('/users/count/'),
        api.get('/properties/'), // To count total and pending
        api.get('/admin/analytics/')
      ]);

      const properties = propCountRes.data;
      const pendingProps = properties.filter((p: any) => p.status === 'submitted' || p.status === 'Submitted');

      setStats({
        totalUsers: userCountRes.data.count,
        totalProperties: properties.length,
        pendingProperties: pendingProps.length,
        activeTransactions: systemAnalyticsRes.data.active_transactions || 0,
        fraudAlerts: systemAnalyticsRes.data.fraud_alerts || 0
      });
    } catch (error) {
      console.error('Admin Stats Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Initializing Overlord Console...</Text>
      </View>
    );
  }

  const renderStatCard = (icon: any, title: string, value: string | number, color: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      {onPress && <ChevronRight color="#cbd5e1" size={20} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Command Center</Text>
        <Text style={styles.subtitle}>Sovereign Overview of the Smart Property Registry</Text>
      </View>

      <View style={styles.grid}>
        {renderStatCard(<Users color="#6366f1" size={24} />, "Total Nodes", stats?.totalUsers || 0, "#6366f1")}
        {renderStatCard(<Building2 color="#10b981" size={24} />, "Total Assets", stats?.totalProperties || 0, "#10b981")}
        {renderStatCard(
          <Clock color="#f59e0b" size={24} />, 
          "Pending Review", 
          stats?.pendingProperties || 0, 
          "#f59e0b",
          () => navigation.navigate('PendingProperties')
        )}
        {renderStatCard(<TrendingUp color="#3b82f6" size={24} />, "Active Trades", stats?.activeTransactions || 0, "#3b82f6")}
      </View>

      {stats?.fraudAlerts > 0 && (
        <TouchableOpacity style={styles.alertBanner}>
          <ShieldAlert color="#ef4444" size={20} />
          <Text style={styles.alertText}>{stats.fraudAlerts} Critical Governance Alerts Detected</Text>
          <ChevronRight color="#ef4444" size={20} />
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Administrative Actions</Text>
        <View style={styles.actionCard}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('PendingProperties')}>
            <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
              <CheckCircle color="#d97706" size={20} />
            </View>
            <Text style={styles.actionLabel}>Approve Submissions</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats?.pendingProperties || 0}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
              <ShieldAlert color="#059669" size={20} />
            </View>
            <Text style={styles.actionLabel}>Verify Registrants</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
              <AlertTriangle color="#2563eb" size={20} />
            </View>
            <Text style={styles.actionLabel}>System Audit Logs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <LayoutDashboard color="#cbd5e1" size={32} />
        <Text style={styles.versionText}>Registry Core v2.4.11-SECURE</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  grid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    margin: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 16,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  badge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
    gap: 12,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default AdminDashboardScreen;
