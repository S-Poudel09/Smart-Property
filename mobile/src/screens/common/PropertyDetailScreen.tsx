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
  Linking,
  Alert
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
  Camera,
  FileText,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from '../../components/common/MapComponents';
import api, { getFullImageUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import MarketInsights from '../../components/MarketInsights';

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

    const propertyId = property.PropertyID || property.id;
    const ownerId = property.owner?.id || property.OwnerID || property.seller_id;
    const ownerDisplayName = property.owner?.name || property.owner?.full_name || 'Property Owner';

    if (!ownerId) {
        Alert.alert('Error', 'Property owner information is missing.');
        return;
    }

    if (ownerId === user.id) {
        Alert.alert('Info', 'You cannot chat with yourself.');
        return;
    }

    try {
       const response = await api.post('/chat/rooms/get_or_create_room/', { 
         property_id: propertyId,
         recipient_id: ownerId 
       });
       
       const finalRoomId = response.data.RoomID || response.data.id;

       if (finalRoomId && finalRoomId !== 'undefined') {
         navigation.navigate('ChatDetail', { 
           roomId: finalRoomId, 
           propertyTitle: property.title,
           recipientName: ownerDisplayName
         });
       } else {
         Alert.alert('Error', 'Could not create chat session.');
       }
    } catch (error) {
       console.error('Chat error:', error);
       Alert.alert('Error', 'Could not start chat with owner.');
    }
  };

  const handleAcquire = async () => {
    if (!user) {
        navigation.navigate('Auth');
        return;
    }
    
    if (user.role !== 'buyer') {
        Alert.alert('Privilege Required', 'Direct asset acquisition is reserved for the Buyer collective.');
        return;
    }

    try {
        setIsLoading(true);

        // Step 1: Create transaction record on our backend
        const txResponse = await api.post('/transactions/', {
            property: property.PropertyID || property.id,
            seller: property.owner?.id || property.seller_id || property.OwnerID,
            total_amount: Number(property.price),
            payment_method: 'Khalti'
        });
        
        const transaction = txResponse.data;
        const transactionId = transaction.TransactionID || transaction.id;

        // Step 2: Initiate Khalti payment to get a real pidx
        const khaltiResponse = await api.post(`/transactions/${transactionId}/khalti-initiate/`, {
            return_url: `http://10.0.2.2:8000/payment/mobile-callback/`,
            website_url: `http://10.0.2.2:8000`,
        });

        const { pidx, payment_url } = khaltiResponse.data;

        navigation.navigate('KhaltiPayment', {
            pidx: pidx,
            paymentUrl: payment_url,
            transactionId: transactionId,
            amount: property.price,
            propertyTitle: property.title
        });
    } catch (error: any) {
        console.error('Acquire Error:', error?.response?.data || error.message);
        const msg = error?.response?.data?.error || 'Failed to initialize payment. Please try again.';
        Alert.alert('Payment Error', msg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Property: ${property.title} in ${property.location}`,
        url: `http://10.0.2.2:3000/properties/${property.id}`,
      });
    } catch (e) {}
  };

  const handleMapPress = () => {
    if (property.latitude && property.longitude) {
       Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`);
    } else {
       Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location || '')}`);
    }
  };

  const handle3DPress = () => {
    const webUrl = property.virtual_tour_url || `http://10.0.2.2:3000/properties/${property.id}`;
    navigation.navigate('Mobile3DViewer', { url: webUrl, title: property.title });
  };

  const handleApprove = async () => {
    Alert.alert('Approve Property', 'Mark this asset as verified and publish to the registry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: async () => {
        try {
          await api.post(`/properties/${property.id}/approve/`);
          Alert.alert('Success', 'Property approved.');
          fetchPropertyDetail();
        } catch (error) {
          Alert.alert('Error', 'Approval failed.');
        }
      }}
    ]);
  };

  const handleReject = () => {
    Alert.prompt('Reject Property', 'Reason for rejection:', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async (reason: string | undefined) => {
        try {
          await api.post(`/properties/${property.id}/reject/`, { rejection_reason: reason });
          Alert.alert('Success', 'Property rejected.');
          fetchPropertyDetail();
        } catch (error) {
          Alert.alert('Error', 'Rejection failed.');
        }
      }}
    ]);
  };

  if (isLoading || !id) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!property) return null;

  const rawImage = property.property_images?.find((img: any) => img.is_primary)?.image || 
                  (property.property_images?.length > 0 ? property.property_images[0].image : null);
  const primaryImage = getFullImageUrl(rawImage);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Media */}
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
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#1e293b" size={24} />
          </TouchableOpacity>

          <View style={styles.imageOverlay} pointerEvents="box-none">
            <TouchableOpacity style={styles.iconCircle} onPress={() => setIsFavorite(!isFavorite)}>
              <Heart color={isFavorite ? "#ef4444" : "#1e293b"} fill={isFavorite ? "#ef4444" : "transparent"} size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={handleShare}>
              <Share2 color="#1e293b" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Body */}
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

          <MarketInsights propertyId={property.PropertyID || property.id} currentPrice={Number(property.price)} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description || 'No description available.'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Owner</Text>
            <View style={styles.ownerCard}>
                <View style={styles.ownerAvatar}>
                    <Text style={styles.ownerInitial}>{(property.owner?.name || property.owner?.full_name || 'O').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.ownerName}>{property.owner?.name || property.owner?.full_name || 'Property Owner'}</Text>
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
               <TouchableOpacity style={styles.interactiveBox} onPress={handle3DPress}>
                 <Camera color="#6366f1" size={24} />
                 <Text style={styles.interactiveText}>3D Virtual Tour</Text>
               </TouchableOpacity>
            </View>
          </View>

          {property.boundary_coordinates && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Geospatial Boundaries</Text>
              <View style={styles.mapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.miniMap}
                  initialRegion={{
                    latitude: property.latitude || 27.7172,
                    longitude: property.longitude || 85.3240,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker 
                    coordinate={{ 
                      latitude: property.latitude || 27.7172, 
                      longitude: property.longitude || 85.3240 
                    }} 
                  />
                  <Polygon
                    coordinates={property.boundary_coordinates}
                    fillColor="rgba(99, 102, 241, 0.2)"
                    strokeColor="#6366f1"
                    strokeWidth={2}
                  />
                </MapView>
              </View>
            </View>
          )}

          {(user?.role === 'admin' || user?.id === property.owner?.id) && property.property_documents?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Legal Documents</Text>
              <View style={styles.docList}>
                {property.property_documents.map((doc: any) => (
                  <TouchableOpacity 
                    key={doc.id} 
                    style={styles.docItem}
                    onPress={() => Linking.openURL(getFullImageUrl(doc.document) || '')}
                  >
                    <FileText color="#6366f1" size={20} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docName}>{doc.doc_type.toUpperCase()}</Text>
                      <Text style={styles.docStatus}>{doc.is_verified ? 'Verified Document' : 'Verification Pending'}</Text>
                    </View>
                    <Eye color="#94a3b8" size={18} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {user?.role === 'admin' && (property.status === 'submitted' || property.status === 'Submitted') && (
            <View style={styles.adminSection}>
              <Text style={styles.sectionTitle}>Administrative Moderation</Text>
              <View style={styles.adminActions}>
                <TouchableOpacity style={[styles.adminBtn, styles.rejectBtn]} onPress={handleReject}>
                  <XCircle color="#ef4444" size={20} />
                  <Text style={styles.rejectText}>Reject Asset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.adminBtn, styles.approveBtn]} onPress={handleApprove}>
                  <CheckCircle color="#10b981" size={20} />
                  <Text style={styles.approveText}>Approve & Publish</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Footer */}
      <View style={styles.footerActions} pointerEvents="box-none">
        <View style={styles.footerInner}>
            <TouchableOpacity style={styles.saveActionBtn} onPress={() => setIsFavorite(!isFavorite)}>
               <Heart color={isFavorite ? "#ef4444" : "#64748b"} fill={isFavorite ? "#ef4444" : "transparent"} size={22} />
               <Text style={[styles.saveActionText, isFavorite && { color: '#ef4444' }]}>{isFavorite ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleContact}>
               <MessageCircle color="#10b981" size={20} />
               <Text style={styles.secondaryBtnText}>Contact</Text>
            </TouchableOpacity>
            
            {user?.role === 'buyer' && (
                <TouchableOpacity style={styles.primaryActionButton} onPress={handleAcquire}>
                    <ShieldCheck color="#fff" size={20} />
                    <Text style={styles.primaryActionText}>Add to Cart</Text>
                </TouchableOpacity>
            )}
        </View>
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
    flexGrow: 1,
    paddingBottom: 140, // Increased to provide clear clearance for footer
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
    zIndex: 50,
    elevation: 5,
  },
  imageOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 50,
    elevation: 5,
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
  },
  mapContainer: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  docList: {
    gap: 12,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  docStatus: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  adminSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#fefce8',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  rejectBtn: {
    backgroundColor: '#fff',
    borderColor: '#fecaca',
  },
  approveBtn: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  rejectText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  approveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  footerActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  footerInner: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  saveActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  saveActionText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    height: 56,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  secondaryBtnText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryActionButton: {
    flex: 1.5,
    backgroundColor: '#10b981',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PropertyDetailScreen;
