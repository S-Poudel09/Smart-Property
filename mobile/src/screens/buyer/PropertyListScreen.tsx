import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { 
    Search, 
    MapPin, 
    SlidersHorizontal, 
    X, 
    Check, 
    ArrowUpDown,
    ArrowUpNarrowWide,
    ArrowDownNarrowWide
} from 'lucide-react-native';
import api from '../../api/client';
import PropertyCard from '../../components/PropertyCard';

const { height } = Dimensions.get('window');

const PropertyListScreen = ({ navigation }: any) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000000 });
  const [sortBy, setSortBy] = useState('latest'); // latest, priceHigh, priceLow

  const categories = ['All', 'House', 'Apartment', 'Bungalow', 'Land', 'Flat', 'Commercial'];

  const fetchProperties = async () => {
    try {
      const response = await api.get('properties/');
      setProperties(response.data);
      applyFiltersAndSort(response.data);
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

  const applyFiltersAndSort = useCallback((data: any) => {
      let filtered = [...data];

      // Search Filter
      if (searchQuery) {
          const lower = searchQuery.toLowerCase();
          filtered = filtered.filter(p => 
              p.title?.toLowerCase().includes(lower) || 
              p.location?.toLowerCase().includes(lower)
          );
      }

      // Category Filter
      if (selectedCategory !== 'All') {
          filtered = filtered.filter(p => p.property_type?.toLowerCase() === selectedCategory.toLowerCase());
      }

      // Price Range Filter
      filtered = filtered.filter(p => {
          const price = parseFloat(p.price);
          return price >= priceRange.min && price <= priceRange.max;
      });

      // Sorting
      if (sortBy === 'latest') {
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sortBy === 'priceHigh') {
          filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      } else if (sortBy === 'priceLow') {
          filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      }

      setFilteredProperties(filtered);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  useEffect(() => {
      applyFiltersAndSort(properties);
  }, [searchQuery, selectedCategory, priceRange, sortBy, properties]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProperties();
  };

  const clearFilters = () => {
      setSelectedCategory('All');
      setPriceRange({ min: 0, max: 1000000000 });
      setSortBy('latest');
      setIsFilterVisible(false);
  };

  const renderFilterModal = () => (
      <Modal
          visible={isFilterVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsFilterVisible(false)}
      >
          <View style={styles.modalOverlay}>
              <View style={styles.filterSheet}>
                  <View style={styles.sheetHeader}>
                      <Text style={styles.sheetTitle}>Filters & Sorting</Text>
                      <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                          <X color="#1e293b" size={24} />
                      </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.sheetContent}>
                      <Text style={styles.filterLabel}>Property Category</Text>
                      <View style={styles.categoryGrid}>
                          {categories.map(cat => (
                              <TouchableOpacity 
                                  key={cat} 
                                  style={[styles.catChip, selectedCategory === cat && styles.activeCatChip]}
                                  onPress={() => setSelectedCategory(cat)}
                              >
                                  <Text style={[styles.catChipText, selectedCategory === cat && styles.activeCatChipText]}>{cat}</Text>
                              </TouchableOpacity>
                          ))}
                      </View>

                      <Text style={styles.filterLabel}>Budget Constraints</Text>
                      <View style={styles.priceOptions}>
                          {[
                              { label: 'Under 5M', max: 5000000 },
                              { label: 'Under 10M', max: 10000000 },
                              { label: 'Under 50M', max: 50000000 },
                              { label: 'Any Price', max: 1000000000 },
                          ].map(opt => (
                              <TouchableOpacity 
                                  key={opt.label} 
                                  style={[styles.priceChip, priceRange.max === opt.max && styles.activePriceChip]}
                                  onPress={() => setPriceRange({ min: 0, max: opt.max })}
                              >
                                  <Text style={[styles.priceChipText, priceRange.max === opt.max && styles.activePriceChipText]}>{opt.label}</Text>
                              </TouchableOpacity>
                          ))}
                      </View>

                      <Text style={styles.filterLabel}>Sort Arrangement</Text>
                      <View style={styles.sortGroup}>
                          {[
                              { id: 'latest', label: 'Recently Published', icon: <ArrowUpDown size={16} color="#64748b" /> },
                              { id: 'priceHigh', label: 'Valuation: High to Low', icon: <ArrowDownNarrowWide size={16} color="#64748b" /> },
                              { id: 'priceLow', label: 'Valuation: Low to High', icon: <ArrowUpNarrowWide size={16} color="#64748b" /> },
                          ].map(s => (
                              <TouchableOpacity 
                                  key={s.id} 
                                  style={[styles.sortItem, sortBy === s.id && styles.activeSortItem]}
                                  onPress={() => setSortBy(s.id)}
                              >
                                  {s.icon}
                                  <Text style={[styles.sortItemText, sortBy === s.id && styles.activeSortItemText]}>{s.label}</Text>
                                  {sortBy === s.id && <Check color="#6366f1" size={16} />}
                              </TouchableOpacity>
                          ))}
                      </View>
                  </ScrollView>

                  <View style={styles.sheetFooter}>
                      <TouchableOpacity style={styles.resetBtn} onPress={clearFilters}>
                          <Text style={styles.resetBtnText}>RESET</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.applyBtn} onPress={() => setIsFilterVisible(false)}>
                          <Text style={styles.applyBtnText}>APPLY RESULTS</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
  );

  if (isLoading && properties.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderFilterModal()}
      <View style={styles.header}>
        <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Asset Marketplace</Text>
            <TouchableOpacity style={styles.filterTrigger} onPress={() => setIsFilterVisible(true)}>
                <SlidersHorizontal color="#fff" size={20} />
            </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Identity location or node title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X color="#94a3b8" size={18} />
              </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickCatScroll}>
            {categories.map(cat => (
                <TouchableOpacity 
                    key={cat} 
                    style={[styles.quickCatChip, selectedCategory === cat && styles.activeQuickCat]}
                    onPress={() => setSelectedCategory(cat)}
                >
                    <Text style={[styles.quickCatText, selectedCategory === cat && styles.activeQuickCatText]}>{cat}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredProperties}
        keyExtractor={(item: any, index: number) => String(item.PropertyID || item.id || index)}
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
            <MapPin color="#cbd5e1" size={64} style={{ marginBottom: 20 }} />
            <Text style={styles.emptyTitle}>No Matching Nodes</Text>
            <Text style={styles.emptyText}>Adjust your parameters to expand search scope.</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                <Text style={styles.clearBtnText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: '#1e293b', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5, zIndex: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 },
  filterTrigger: { width: 44, height: 44, backgroundColor: '#1e293b', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 16, height: 52 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1e293b' },
  quickCatScroll: { marginTop: 16 },
  quickCatChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, marginRight: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  activeQuickCat: { backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: '#6366f1' },
  quickCatText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  activeQuickCatText: { color: '#6366f1' },
  listContent: { padding: 20, paddingBottom: 100 },
  cardContainer: { marginBottom: 0 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  clearBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#f1f5f9', borderRadius: 12 },
  clearBtnText: { color: '#1e293b', fontWeight: '800', fontSize: 13 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterSheet: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: height * 0.85, paddingBottom: 40 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
  sheetContent: { padding: 24 },
  filterLabel: { fontSize: 14, fontWeight: '800', color: '#1e293b', marginBottom: 16, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  activeCatChip: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  catChipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  activeCatChipText: { color: '#fff' },
  priceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  priceChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  activePriceChip: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' },
  priceChipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  activePriceChipText: { color: '#10b981' },
  sortGroup: { gap: 10, marginBottom: 40 },
  sortItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', gap: 12 },
  activeSortItem: { backgroundColor: '#fff', borderColor: '#6366f1', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 },
  sortItemText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeSortItemText: { color: '#1e293b', fontWeight: '800' },
  sheetFooter: { flexDirection: 'row', padding: 24, gap: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  resetBtn: { flex: 1, height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: '#f1f5f9' },
  resetBtnText: { color: '#64748b', fontWeight: '800', fontSize: 14 },
  applyBtn: { flex: 2, height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: '#1e293b' },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});

export default PropertyListScreen;
