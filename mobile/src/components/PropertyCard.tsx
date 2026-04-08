import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { MapPin, Home, Bed, Bath, Square, Heart } from 'lucide-react-native';
import { getFullImageUrl } from '../api/client';

const { width } = Dimensions.get('window');

interface PropertyCardProps {
  property: {
    id: string;
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
  const primaryImageObj = property.property_images?.find((img) => img.is_primary) || property.property_images?.[0];
  const imagePath = property.thumbnail || primaryImageObj?.image;
  const imageUrl = getFullImageUrl(imagePath);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <ExpoImage
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
             <Home color="#94a3b8" size={40} />
             <Text style={styles.placeholderText}>No Image Provided</Text>
          </View>
        )}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>NPR {property.price}</Text>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{property.property_type}</Text>
        </View>
        <TouchableOpacity style={styles.favoriteBtn}>
          <Heart color="#fff" size={20} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        <View style={styles.locationContainer}>
          <MapPin color="#64748b" size={14} />
          <Text style={styles.locationText} numberOfLines={1}>{property.location}</Text>
        </View>
        
        <View style={styles.specs}>
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
            <Text style={styles.specText}>{property.area_sqft || 0} sq.ft</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
    backgroundColor: '#f8fafc',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderImage: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  typeTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  specs: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  detailsButton: {
    marginTop: 16,
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default PropertyCard;
