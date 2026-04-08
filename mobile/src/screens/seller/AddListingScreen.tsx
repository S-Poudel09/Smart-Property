import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Maximize, 
  Plus, 
  Check, 
  Building2, 
  AlignLeft,
  ChevronDown
} from 'lucide-react-native';
import api from '../../api/client';
import { Alert } from '../../utils/alert';

const PROPERTY_TYPES = [
  { label: 'House', value: 'house' },
  { label: 'Flat', value: 'flat' },
  { label: 'Bungalow', value: 'bungalow' },
  { label: 'Land', value: 'land' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Hostel', value: 'hostel' }
];

const LISTING_TYPES = [
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' }
];

const AddListingScreen = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    property_type: 'house',
    listing_type: 'sale',
    area_sqft: '',
    beds: '',
    baths: '',
    description: ''
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.location) {
      Alert.alert('Required Fields', 'Please fill in title, price, and location');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        area_sqft: parseFloat(formData.area_sqft) || 0,
        beds: parseInt(formData.beds) || 0,
        baths: parseInt(formData.baths) || 0,
        status: 'submitted' // Initial state
      };
      
      const response = await api.post('/properties/', payload);
      Alert.alert(
        'Success', 
        'Property listing submitted for review.',
        [{ text: 'Great!', onPress: () => navigation.navigate('SellerDashboard') }]
      );
    } catch (error: any) {
      console.error('Property creation error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create property listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>List Your Property</Text>
        <Text style={styles.headerSubtitle}>Fill details for buyer leads</Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Property Title</Text>
            <View style={styles.inputContainer}>
              <Home color="#1e293b" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: 3 BHK Modern Flat in Baluwatar"
                value={formData.title}
                onChangeText={(val) => updateField('title', val)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Listing Mode</Text>
                <View style={styles.pillContainer}>
                    {LISTING_TYPES.map((type) => (
                        <TouchableOpacity 
                            key={type.value}
                            style={[styles.pill, formData.listing_type === type.value && styles.pillActive]}
                            onPress={() => updateField('listing_type', type.value)}
                        >
                            <Text style={[styles.pillText, formData.listing_type === type.value && styles.pillTextActive]}>{type.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Property Type</Text>
            <View style={styles.chipScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {PROPERTY_TYPES.map((type) => (
                        <TouchableOpacity 
                            key={type.value}
                            style={[styles.chip, formData.property_type === type.value && styles.chipActive]}
                            onPress={() => updateField('property_type', type.value)}
                        >
                            <Text style={[styles.chipText, formData.property_type === type.value && styles.chipTextActive]}>{type.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Location & Price</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location / Area</Text>
            <View style={styles.inputContainer}>
              <MapPin color="#1e293b" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Baluwatar, Kathmandu"
                value={formData.location}
                onChangeText={(val) => updateField('location', val)}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Price (NPR)</Text>
            <View style={styles.inputContainer}>
              <DollarSign color="#1e293b" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: 25000000"
                value={formData.price}
                onChangeText={(val) => updateField('price', val)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Beds</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={formData.beds}
                        onChangeText={(val) => updateField('beds', val)}
                        keyboardType="numeric"
                      />
                    </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Baths</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={formData.baths}
                        onChangeText={(val) => updateField('baths', val)}
                        keyboardType="numeric"
                      />
                    </View>
                </View>
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Area (Sq.ft)</Text>
                <View style={styles.inputContainer}>
                  <Maximize color="#1e293b" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 1200"
                    value={formData.area_sqft}
                    onChangeText={(val) => updateField('area_sqft', val)}
                    keyboardType="numeric"
                  />
                </View>
            </View>
            <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.label}>Description</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <AlignLeft color="#1e293b" size={18} style={[styles.inputIcon, { marginTop: 12 }]} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell buyers about your property features..."
                    value={formData.description}
                    onChangeText={(val) => updateField('description', val)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
            </View>
        </View>

        <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <>
                    <Plus color="#fff" size={20} />
                    <Text style={styles.submitButtonText}>Publish Listing</Text>
                </>
            )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 60,
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#f8fafc',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
  },
  textArea: {
      paddingTop: 16,
      height: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  pillActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  pillTextActive: {
    color: '#6366f1',
  },
  chipScrollContainer: {
      marginLeft: -4,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  chipTextActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  }
});

export default AddListingScreen;
