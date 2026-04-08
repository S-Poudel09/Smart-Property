import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  FlatList,
  TouchableOpacity
} from 'react-native';
import { Search, Bell, MapPin, SlidersHorizontal, ArrowRight, Map } from 'lucide-react-native';
import api from '../../api/client';
import PropertyCard from '../../components/PropertyCard';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/alert';

const BuyerHomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties/');
      // On backend, published properties are returned for list
      setProperties(response.data.slice(0, 5)); // Show top 5 on home
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProperties();
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.profileIndicator}>
           <Text style={styles.profileInitial}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topIconBtn} onPress={() => navigation.navigate('Notifications')}>
          <Bell color="#1e293b" size={22} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.heroSection}>
          <Text style={styles.heroSubtitle}>Find your home</Text>
          <Text style={styles.heroTitle}>Discover{'\n'}Smart Assets</Text>
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} />
          <Text style={styles.searchPlaceholder}>Search location, house type...</Text>
        </View>
        <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate('MapExplorer')}>
              <Map color="#6366f1" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} onPress={() => Alert.alert('Filters coming soon')}>
              <SlidersHorizontal color="#fff" size={20} />
            </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Properties</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
          <View style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all</Text>
            <ArrowRight color="#6366f1" size={14} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item: any) => item.PropertyID || String(item.id)}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No featured properties found</Text>
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
  },
  listContent: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  topRow: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    lineHeight: 40,
    letterSpacing: -1,
  },
  searchBar: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  profileIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  topIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  searchPlaceholder: {
    color: '#94a3b8',
    fontSize: 15,
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  mapButton: {
    width: 52,
    height: 52,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  cardContainer: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
  },
});

export default BuyerHomeScreen;
