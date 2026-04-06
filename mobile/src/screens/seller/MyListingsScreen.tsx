import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { Building2, Plus } from 'lucide-react-native';
import api from '../../api/client';
import PropertyCard from '../../components/PropertyCard';

const MyListingsScreen = ({ navigation }: any) => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMyProperties = async () => {
    try {
      const response = await api.get('/properties/?seller=me');
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to fetch my properties:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Refresh when screen focuses
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyProperties();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMyProperties();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Properties</Text>
      </View>
      
      <FlatList
        data={properties}
        keyExtractor={(item: any) => item.PropertyID || String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <PropertyCard 
              property={item} 
              onPress={() => navigation.navigate('PropertyDetail', { id: item.PropertyID || item.id })} 
            />
            <View style={styles.statusBanner}>
                <View style={[styles.statusDot, { backgroundColor: item.status === 'published' ? '#10b981' : (item.status === 'rejected' ? '#ef4444' : '#f97316') }]} />
                <Text style={styles.statusText}>Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366f1']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Building2 color="#cbd5e1" size={48} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No listings yet.</Text>
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AddListing')}
            >
                <Plus color="#fff" size={18} />
                <Text style={styles.addButtonText}>Add Property</Text>
            </TouchableOpacity>
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
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  cardContainer: {
    marginBottom: 20,
  },
  statusBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      padding: 12,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      marginTop: -20, // Pull up to attach to card bottom
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: '#f1f5f9',
  },
  statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
  },
  statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#475569',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6366f1',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
  },
  addButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 15,
  }
});

export default MyListingsScreen;
