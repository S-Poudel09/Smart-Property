import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  FlatList,
  TouchableOpacity,
  Dimensions,
  ImageBackground
} from 'react-native';
import { 
  Search, 
  Bell, 
  MapPin, 
  SlidersHorizontal, 
  ArrowRight, 
  Map, 
  Crown,
  History,
  Heart,
  Calculator,
  ShieldCheck,
  Building2
} from 'lucide-react-native';
import api from '../../api/client';
import PropertyCard from '../../components/PropertyCard';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const BuyerHomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [latestProperties, setLatestProperties] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [propRes, transRes, notifRes] = await Promise.all([
        api.get('properties/'),
        api.get('transactions/'),
        api.get('notifications/')
      ]);

      // Featured properties: High price + verified
      const sorted = [...propRes.data].sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
      setFeaturedProperties(sorted.slice(0, 3));
      
      // Latest: First 5 from recent
      setLatestProperties(propRes.data.slice(0, 5));
      
      // Recent transactions
      setRecentTransactions(transRes.data.slice(0, 3));
      
      // Unread notifications
      const unread = notifRes.data.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsGrid}>
      {[
        { id: 'browse', icon: <Building2 color="#6366f1" size={24} />, label: 'Market', route: 'Browse' },
        { id: 'map', icon: <Map color="#10b981" size={24} />, label: 'Map', route: 'MapExplorer' },
        { id: 'loan', icon: <Calculator color="#f59e0b" size={24} />, label: 'Financing', route: 'LoanCalculator' },
        { id: 'saved', icon: <Heart color="#ef4444" size={24} />, label: 'Saved', route: 'Favorites' },
      ].map((action) => (
        <TouchableOpacity 
            key={action.id} 
            style={styles.actionCard} 
            onPress={() => navigation.navigate(action.route)}
        >
          <View style={styles.actionIconCont}>{action.icon}</View>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerStack}>
      <View style={styles.topBar}>
        <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.full_name || 'Inquisitor'}</Text>
        </View>
        <TouchableOpacity 
            style={styles.notifBtn} 
            onPress={() => navigation.navigate('Notifications')}
        >
          <Bell color="#1e293b" size={22} />
          {unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
          style={styles.searchBox} 
          onPress={() => navigation.navigate('Browse')}
      >
        <Search color="#64748b" size={20} />
        <Text style={styles.searchPlaceholder}>Search premium nodes...</Text>
        <SlidersHorizontal color="#6366f1" size={18} />
      </TouchableOpacity>

      <View style={styles.featuredContainer}>
        <View style={styles.sectionHeading}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
             <Crown size={18} color="#f59e0b" />
             <Text style={styles.sectionTitle}>Elite Portfolio</Text>
           </View>
           <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
             <Text style={styles.viewAllText}>VIEW ALL</Text>
           </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
          {featuredProperties.map((item: any, index: number) => (
             <TouchableOpacity 
                key={item.PropertyID || item.id || `featured-${index}`} 
                style={styles.featuredItem}
                onPress={() => navigation.navigate('PropertyDetail', { id: item.PropertyID || item.id })}
             >
                <ImageBackground 
                    source={item.property_images?.[0]?.image ? { uri: item.property_images[0].image } : { uri: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop' }} 
                    style={styles.featuredImg}
                    imageStyle={{ borderRadius: 24 }}
                >
                    <View style={styles.featuredOverlay}>
                        <View style={styles.priceTag}>
                            <Text style={styles.priceText}>NPR {(parseFloat(item.price)/1000000).toFixed(1)}M</Text>
                        </View>
                        <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.locRow}>
                            <MapPin size={10} color="#fff" />
                            <Text style={styles.featuredLoc}>{item.location}</Text>
                        </View>
                    </View>
                </ImageBackground>
             </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actionSection}>
         <Text style={styles.sectionTitle}>High-Level Operations</Text>
         {renderQuickActions()}
      </View>

      {recentTransactions.length > 0 && (
          <View style={styles.transSection}>
             <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Active Ledgers</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                    <History size={18} color="#6366f1" />
                </TouchableOpacity>
             </View>
             {recentTransactions.map((tx: any, index: number) => (
                 <TouchableOpacity 
                    key={tx.TransactionID || tx.id || `tx-${index}`} 
                    style={styles.miniTransCard}
                    onPress={() => navigation.navigate('Transactions')}
                 >
                    <View style={styles.txIconBox}><ShieldCheck size={20} color="#10b981" /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.txTitle}>{tx.property_title || 'Acquisition'}</Text>
                        <Text style={styles.txStatus}>
                          {tx.status} — {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Pending Registry'}
                        </Text>
                    </View>
                    <ArrowRight size={16} color="#cbd5e1" />
                 </TouchableOpacity>
             ))}
          </View>
      )}

      <Text style={[styles.sectionTitle, { marginHorizontal: 24, marginTop: 24, marginBottom: 12 }]}>Latest Registry Entries</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>SYNCHRONIZING HUB...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={latestProperties}
        keyExtractor={(item: any, index: number) => String(item.PropertyID || item.id || index)}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <PropertyCard 
              property={item} 
              onPress={() => navigation.navigate('PropertyDetail', { id: item.PropertyID || item.id })} 
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366f1']} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 16, fontSize: 10, fontWeight: '900', color: '#6366f1', letterSpacing: 2 },
  listContent: { paddingBottom: 40 },
  headerStack: { paddingTop: 60 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
  greeting: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 },
  notifBtn: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  notifBadge: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, backgroundColor: '#ef4444', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  notifBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 24, height: 56, borderRadius: 18, paddingHorizontal: 16, gap: 12, shadowColor: '#1e293b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 32 },
  searchPlaceholder: { flex: 1, color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  featuredContainer: { marginTop: 16 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  viewAllText: { fontSize: 11, fontWeight: '800', color: '#6366f1' },
  featuredScroll: { paddingLeft: 24, gap: 16, paddingRight: 24 },
  featuredItem: { width: width * 0.7, height: 200 },
  featuredImg: { flex: 1, justifyContent: 'flex-end' },
  featuredOverlay: { padding: 20, backgroundColor: 'rgba(0,0,0,0.3)', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  priceTag: { position: 'absolute', top: -160, right: 16, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  priceText: { color: '#1e293b', fontWeight: '900', fontSize: 12 },
  featuredTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  featuredLoc: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' },
  actionSection: { marginTop: 32, paddingHorizontal: 24 },
  quickActionsGrid: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionCard: { flex: 1, backgroundColor: '#fff', paddingVertical: 16, borderRadius: 20, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  actionIconCont: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 10, fontWeight: '800', color: '#64748b' },
  transSection: { marginTop: 32 },
  miniTransCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 24, marginBottom: 10, padding: 14, borderRadius: 18, gap: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  txIconBox: { width: 40, height: 40, backgroundColor: '#ecfdf5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txTitle: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  txStatus: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  cardContainer: { paddingHorizontal: 20 },
});

export default BuyerHomeScreen;
