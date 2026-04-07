import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Search, MapPin } from 'lucide-react-native';
import api from '../../api/client';
import PropertyCard from '../../components/PropertyCard';

const PropertyListScreen = ({ navigation }: any) => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties/');
      setProperties(response.data);
      setFilteredProperties(response.data);
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

  const handleSearch = (text: string) => {
      setSearchQuery(text);
      if (!text.trim()) {
          setFilteredProperties(properties);
          return;
      }
      
      const lowercased = text.toLowerCase();
      const filtered = properties.filter((p: any) => 
          p.title?.toLowerCase().includes(lowercased) ||
          p.location?.toLowerCase().includes(lowercased) ||
          p.property_type?.toLowerCase().includes(lowercased)
      );
      setFilteredProperties(filtered);
  };

  if (isLoading && properties.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Properties</Text>
        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, title, or type..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {['All', 'Home', 'Apartment', 'Land', 'Hostel', 'Office'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterChip, searchQuery.toLowerCase() === cat.toLowerCase() && styles.activeFilterChip]}
              onPress={() => handleSearch(cat === 'All' ? '' : cat)}
            >
              <Text style={[styles.filterText, searchQuery.toLowerCase() === cat.toLowerCase() && styles.activeFilterText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredProperties}
        keyExtractor={(item: any) => item.PropertyID || String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <PropertyCard 
              property={item} 
              onPress={() => navigation.navigate('PropertyDetail', { id: item.PropertyID || item.id })} 
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366f1']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MapPin color="#cbd5e1" size={48} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No properties found matching "{searchQuery}"</Text>
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  cardContainer: {
    marginBottom: 0,
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
    textAlign: 'center',
  },
  filterScroll: {
    marginTop: 16,
  },
  filterContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterChip: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeFilterText: {
    color: '#fff',
  },
});

export default PropertyListScreen;
