import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions,
  Share,
  Linking
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Share2, 
  MessageCircle, 
  ShieldCheck,
  ChevronLeft,
  CreditCard,
  Info,
  Map,
  Camera
} from 'lucide-react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/alert';

const { width } = Dimensions.get('window');

const PropertyDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchPropertyDetail();
  }, [id]);

  const fetchPropertyDetail = async () => {
    if (!id || id === 'undefined') {
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get(`/properties/${id}/`);
      setProperty(response.data);
    } catch (error) {
      console.error('Failed to fetch property details:', error);
      Alert.alert('Error', 'Could not load property details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = async () => {
    if (!user) {
        navigation.navigate('Auth');
        return;
    }
    
    if (!property) return;

    // Use available ID fields, prioritizing nested owner object
    const propertyId = property.id || property.PropertyID;
    const ownerId = property.owner?.id || property.OwnerID || property.seller_id;
    const ownerDisplayName = property.owner?.name || property.owner?.full_name || (property.owner?.email ? property.owner.email.split('@')[0] : 'Property Owner');

    if (!ownerId) {
        Alert.alert('Error', 'Property owner information is missing. Cannot start chat.');
        return;
    }

    // Check if user is trying to contact themselves
    if (ownerId === user.id) {
        Alert.alert('Info', 'This is your own property listing. You cannot chat with yourself.');
        return;
    }

    try {
       // Create or get chat room
       const response = await api.post('/chat/rooms/get_or_create_room/', { 
         property_id: propertyId,
         recipient_id: ownerId 
       });
       
       const chatRoom = response.data;
       const finalRoomId = chatRoom.RoomID || chatRoom.id;

       if (finalRoomId) {
         navigation.navigate('ChatDetail', { 
           roomId: finalRoomId, 
           propertyTitle: property.title,
           recipientName: ownerDisplayName
         });
       } else {
         throw new Error('Invalid response from server');
       }
    } catch (error: any) {
       console.error('Failed to start chat:', error.response?.data || error.message);
       const errorMsg = error.response?.data?.error || 'Could not start chat with owner. Please try again later.';
       Alert.alert('Error', errorMsg);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property.title} in ${property.location} for NPR ${property.price}`,
        url: `http://localhost:3000/properties/${property.PropertyID || property.id}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleMapPress = () => {
    if (property.latitude && property.longitude) {
       Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`);
    } else {
       const query = encodeURIComponent(property.location || property.city || 'Nepal');
       Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const handle3DPress = () => {
    const webUrl = property.virtual_tour_url || `http://localhost:3000/properties/${property.PropertyID || property.id}`;
    navigation.navigate('Mobile3DViewer', { url: webUrl, title: property.title });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const primaryImage = property.property_images?.find((img: any) => img.is_primary)?.image || 
                     (property.property_images?.length > 0 ? property.property_images[0].image : null);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {primaryImage ? (
            <ExpoImage
              source={{ uri: primaryImage }}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Info color="#cbd5e1" size={64} />
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#1e293b" size={24} />
          </TouchableOpacity>

          <View style={styles.imageOverlay}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => setIsFavorite(!isFavorite)}>
              <Heart color={isFavorite ? "#ef4444" : "#1e293b"} fill={isFavorite ? "#ef4444" : "transparent"} size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={handleShare}>
              <Share2 color="#1e293b" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.typeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{property.property_type}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: property.listing_type === 'sale' ? '#ecfdf5' : '#eff6ff' }]}>
              <Text style={[styles.typeBadgeText, { color: property.listing_type === 'sale' ? '#10b981' : '#3b82f6' }]}>
                For {property.listing_type}
              </Text>
            </View>
            {property.is_verified && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck color="#10b981" size={14} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <View style={styles.headerTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{property.title}</Text>
              <View style={styles.locationRow}>
                <MapPin color="#64748b" size={16} />
                <Text style={styles.location}>{property.location}</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>NPR {property.price}</Text>
            </View>
          </View>

          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Bed color="#6366f1" size={20} />
              <Text style={styles.specValue}>{property.beds || 0}</Text>
              <Text style={styles.specLabel}>Beds</Text>
            </View>
            <View style={styles.specBox}>
              <Bath color="#6366f1" size={20} />
              <Text style={styles.specValue}>{property.baths || 0}</Text>
              <Text style={styles.specLabel}>Baths</Text>
            </View>
            <View style={styles.specBox}>
              <Square color="#6366f1" size={20} />
              <Text style={styles.specValue}>{property.area_sqft || 0}</Text>
              <Text style={styles.specLabel}>sq.ft</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description || 'No description available for this property.'}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Owner</Text>
            <View style={styles.ownerCard}>
                <View style={styles.ownerAvatar}>
                    <Text style={styles.ownerInitial}>{(property.owner?.name || property.owner?.full_name || 'O').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.ownerName}>{property.owner?.name || property.owner?.full_name || (property.owner?.email ? property.owner.email.split('@')[0] : 'Property Owner')}</Text>
                    <Text style={styles.ownerRole}>{property.is_verified ? 'Verified Seller' : 'Registered User'}</Text>
                </View>
                <TouchableOpacity style={styles.ownerContactBtn} onPress={handleContact}>
                   <MessageCircle color="#6366f1" size={20} />
                </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interactive Features</Text>
            <View style={styles.interactiveGrid}>
               <TouchableOpacity style={styles.interactiveBox} onPress={handleMapPress}>
                 <Map color="#6366f1" size={24} />
                 <Text style={styles.interactiveText}>View on Map</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.interactiveBox} onPress={handle3DPress}>
                 <Camera color="#6366f1" size={24} />
                 <Text style={styles.interactiveText}>3D Virtual Tour</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.emiButton} onPress={() => Alert.alert('Loan Calculator', 'Calculation based on backend rates...')}>
          <CreditCard color="#6366f1" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <MessageCircle color="#fff" size={20} />
          <Text style={styles.contactButtonText}>Chat with Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#fff',
    marginTop: -30,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 15,
    color: '#64748b',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6366f1',
  },
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  specBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginVertical: 4,
  },
  specLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  ownerRole: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  ownerContactBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emiButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactiveGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  interactiveBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  interactiveText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  }
});

export default PropertyDetailScreen;
