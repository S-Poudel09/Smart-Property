import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { BarChart, Eye, TrendingUp, DollarSign } from 'lucide-react-native';
import api from '../../api/client';

const { width } = Dimensions.get('window');

const SellerAnalyticsScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/properties/?seller=me');
        const properties = response.data;
        
        // Mocking some analytics data based on live properties
        setStats({
          totalViews: properties.reduce((acc: number, p: any) => acc + (p.view_count || 0), 0),
          totalProperties: properties.length,
          activeLeads: properties.length * 2, // Mock leads
          estimatedEarnings: properties.filter((p: any) => p.status === 'published').reduce((acc: number, p: any) => acc + parseFloat(p.price), 0) / 100 // ROI mock
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TrendingUp color="#6366f1" size={40} style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Seller Analytics</Text>
        <Text style={styles.subtitle}>Insights into your asset performance</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Eye color="#6366f1" size={24} />
          <Text style={styles.statValue}>{stats?.totalViews}</Text>
          <Text style={styles.statLabel}>Direct Views</Text>
        </View>
        <View style={styles.statCard}>
          <BarChart color="#10b981" size={24} />
          <Text style={styles.statValue}>{stats?.activeLeads}</Text>
          <Text style={styles.statLabel}>Active Leads</Text>
        </View>
      </View>

      <View style={styles.chartPlaceholder}>
          <Text style={styles.chartTitle}>Market Presence (30 Days)</Text>
          <View style={styles.barGrid}>
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h }]} />
            ))}
          </View>
          <Text style={styles.chartHint}>Showing synthesized registry activity.</Text>
      </View>

      <View style={styles.earningsCard}>
          <View style={styles.earningsIcon}>
            <DollarSign color="#fff" size={24} />
          </View>
          <View>
              <Text style={styles.earningsLabel}>Projected Portfolio Value</Text>
              <Text style={styles.earningsValue}>NPR {stats?.estimatedEarnings?.toLocaleString()}</Text>
          </View>
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
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  chartPlaceholder: {
      backgroundColor: '#fff',
      borderRadius: 24,
      padding: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#f1f5f9',
  },
  chartTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: 20,
  },
  barGrid: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 100,
      marginBottom: 16,
  },
  bar: {
      width: 25,
      backgroundColor: '#6366f1',
      borderRadius: 6,
      opacity: 0.8,
  },
  chartHint: {
      fontSize: 12,
      color: '#94a3b8',
      fontStyle: 'italic',
      textAlign: 'center',
  },
  earningsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1e293b',
      padding: 24,
      borderRadius: 24,
      gap: 16,
  },
  earningsIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: '#6366f1',
      justifyContent: 'center',
      alignItems: 'center',
  },
  earningsLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
  earningsValue: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '800',
      marginTop: 2,
  }
});

export default SellerAnalyticsScreen;
