import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { MapPin, Home, Bed, Bath, Square, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFullImageUrl } from '../api/client';

const { width } = Dimensions.get('window');

interface PropertyCardProps {
  property: {
    id: string;
    PropertyID?: string;
    title: string;
    price: string | number;
    location: string;
    property_type: string;
    beds?: number;
    baths?: number;
    area_sqft?: number;
    property_images?: any[];
    thumbnail?: string;
  };
  onPress: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const propertyId = property.PropertyID || property.id;

  const primaryImageObj = property.property_images?.find((img) => img.is_primary) || property.property_images?.[0];
  const imagePath = property.thumbnail || primaryImageObj?.image;
  const imageUrl = getFullImageUrl(imagePath);

  useEffect(() => {
    checkIfFavorite();
  }, [propertyId]);

  const checkIfFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorite_properties');
      if (favorites) {
        const favoriteList = JSON.parse(favorites);
        setIsFavorite(favoriteList.includes(propertyId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorite_properties');
      let favoriteList = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        favoriteList = favoriteList.filter((favId: string) => favId !== propertyId);
      } else {
        favoriteList.push(propertyId);
      }
      
      await AsyncStorage.setItem('favorite_properties', JSON.stringify(favoriteList));
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <ExpoImage
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={1000}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
             <Home color="#cbd5e1" size={40} />
             <Text style={styles.placeholderText}>NO MEDIA FOUND</Text>
          </View>
        )}
        
        <View style={styles.topBadges}>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{property.property_type}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.favoriteBtn, isFavorite && styles.favoriteBtnActive]} 
            onPress={toggleFavorite}
          >
            <Heart color={isFavorite ? '#ef4444' : '#fff'} size={18} fill={isFavorite ? '#ef4444' : 'none'} />
          </TouchableOpacity>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>NPR {parseFloat(property.price as string).toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        <View style={styles.locationContainer}>
          <MapPin color="#6366f1" size={14} />
          <Text style={styles.locationText} numberOfLines={1}>{property.location}</Text>
        </View>
        
        <View style={styles.specsContainer}>
          <View style={styles.specItem}>
            <Bed color="#64748b" size={14} />
            <Text style={styles.specText}>{property.beds || 0}</Text>
          </View>
          <View style={styles.specItem}>
            <Bath color="#64748b" size={14} />
            <Text style={styles.specText}>{property.baths || 0}</Text>
          </View>
          <View style={styles.specItem}>
            <Square color="#64748b" size={14} />
            <Text style={styles.specText}>{Math.round(property.area_sqft || 0)} <Text style={styles.sqftLabel}>sq.ft</Text></Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.ownerBrief}>
            <View style={styles.ownerDot} />
            <Text style={styles.ownerStatus}>Registry Verified</Text>
          </View>
          <View style={styles.detailsAction}>
            <Text style={styles.detailsActionText}>Inspect</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 24, marginBottom: 24, overflow: 'hidden', shadowColor: '#1e293b', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  imageContainer: { position: 'relative', height: 220, width: '100%', backgroundColor: '#f8fafc' },
  image: { ...StyleSheet.absoluteFillObject },
  placeholderImage: { backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 12 },
  topBadges: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeTag: { backgroundColor: 'rgba(30, 41, 59, 0.75)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  typeText: { color: '#fff', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  favoriteBtn: { backgroundColor: 'rgba(0,0,0,0.3)', width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  favoriteBtnActive: { backgroundColor: '#fff', borderColor: '#fee2e2' },
  priceContainer: { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  priceText: { color: '#1e293b', fontWeight: '900', fontSize: 18, letterSpacing: -0.5 },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 8, letterSpacing: -0.5 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 6 },
  locationText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  specsContainer: { flexDirection: 'row', gap: 12, paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  specText: { fontSize: 13, color: '#1e293b', fontWeight: '800' },
  sqftLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ownerBrief: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ownerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  ownerStatus: { fontSize: 11, color: '#10b981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailsAction: { backgroundColor: 'rgba(99, 102, 241, 0.08)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100 },
  detailsActionText: { color: '#6366f1', fontWeight: '800', fontSize: 10, textTransform: 'uppercase' },
});

export default PropertyCard;
