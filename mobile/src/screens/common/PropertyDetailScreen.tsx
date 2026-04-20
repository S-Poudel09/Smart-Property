import React, { useEffect, useState, useRef } from 'react';
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
  Alert,
  Platform
} from 'react-native';
import * as Storage from '../../utils/storage';
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
  ChevronRight,
  Info,
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

const { width } = Dimensions.get('window');

const PropertyDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carouselRef = useRef<ScrollView>(null);

  const handleToggleFavorite = async () => {
    try {
      if (!property) return;
      
      const stored = await Storage.getItemAsync('favorite_properties');
      let favs = stored ? JSON.parse(stored) : [];
      
      const propId = property.PropertyID || property.id;
      const isFav = favs.some((p: any) => (p.PropertyID || p.id) === propId);
      
      if (isFav) {
        favs = favs.filter((p: any) => (p.PropertyID || p.id) !== propId);
        setIsFavorite(false);
      } else {
        favs.push(property);
        setIsFavorite(true);
      }
      
      await Storage.setItemAsync('favorite_properties', JSON.stringify(favs));
    } catch (e) {
      console.error('Favorite toggle failed:', e);
    }
  };

  useEffect(() => {
    const checkIfFavorite = async () => {
        if (!property) return;
        const stored = await Storage.getItemAsync('favorite_properties');
        if (stored) {
            const favs = JSON.parse(stored);
            const propId = property.PropertyID || property.id;
            setIsFavorite(favs.some((p: any) => (p.PropertyID || p.id) === propId));
        }
    };
    checkIfFavorite();
  }, [property]);

  useEffect(() => {
    fetchPropertyDetail();
  }, [id]);

  const fetchPropertyDetail = async () => {
    if (!id || id === 'undefined') {
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get(`properties/${id}/`);
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
       const response = await api.post('chat/rooms/get_or_create_room/', { 
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
        Alert.alert('Error', 'Only buyers can acquire property.');
        return;
    }

    try {
        setIsLoading(true);

        const txResponse = await api.post('transactions/', {
            property: property.PropertyID || property.id,
            seller: property.owner?.id || property.seller_id || property.OwnerID,
            buyer: user.id,
            amount: property.price,
            transaction_type: 'purchase'
        });
        
        const transaction = txResponse.data;
        const transactionId = transaction.TransactionID || transaction.id;

        const khaltiResponse = await api.post(`transactions/${transactionId}/khalti-initiate/`, {
            return_url: `https://smartproperty.app/payment/callback/`, 
            website_url: `https://smartproperty.app`,
        });

        const { pidx, payment_url, applied_amount, original_amount, is_sandbox, is_demo_adjustment } = khaltiResponse.data;

        navigation.navigate('KhaltiPayment', { 
            pidx: pidx,
            paymentUrl: payment_url,
            transactionId: transactionId,
            amount: applied_amount || property.price,
            propertyTitle: property.title,
            originalAmount: original_amount,
            isSandbox: is_sandbox,
            isDemoAdjustment: is_demo_adjustment
        });

    } catch (error: any) {
        console.error('Acquire error:', error.response?.data || error.message);
        Alert.alert('Acquisition Failed', error.response?.data?.error || 'Could not initiate secure transaction.');
    } finally {
        setIsLoading(false);
    }
  };

  const scrollToIndex = (index: number) => {
    if (!images || index < 0 || index >= images.length) return;
    carouselRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveImageIndex(index);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property.title} - ${property.location}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const allImages = (property?.property_images?.map((img: any) => getFullImageUrl(img.image)) || []).filter(Boolean);
  if (allImages.length === 0 && property?.thumbnail) {
      const thumb = getFullImageUrl(property.thumbnail);
      if (thumb) allImages.push(thumb);
  }

  const handle3DPress = () => {
    if (!property) return;
    // Robustly check multiple potential field names for the 3D/Volumetric link
    const tourUrl = property.virtual_tour_url || property.volumetric_link || property.model_url || null;
    navigation.navigate('Mobile3DViewer', { 
        url: tourUrl, 
        propertyTitle: property.title,
        images: allImages 
    });
  };

  const handleOpenMap = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const lat = property.latitude || 27.7172;
    const lng = property.longitude || 85.3240;
    const latLng = `${lat},${lng}`;
    const label = property.title || 'Property Node';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  const handleApprove = () => {
    Alert.alert('Approve Asset', 'Are you sure you want to verify and publish this asset?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: async () => {
        try {
          await api.post(`properties/${property.id}/approve/`);
          Alert.alert('Success', 'Property published to registry.');
          fetchPropertyDetail();
        } catch (error) {
          Alert.alert('Error', 'Approval failed.');
        }
      }}
    ]);
  };

  const handleReject = () => {
    Alert.prompt('Reject Asset', 'Reason for rejection:', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async (reason: string | undefined) => {
        try {
          await api.post(`properties/${property.id}/reject/`, { rejection_reason: reason });
          Alert.alert('Success', 'Property rejected.');
          fetchPropertyDetail();
        } catch (error) {
          Alert.alert('Error', 'Rejection failed.');
        }
      }}
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Retaining Asset Nodes...</Text>
      </View>
    );
  }

  if (!id || !property) {
    return (
        <View style={styles.centered}>
            <XCircle color="#ef4444" size={54} />
            <Text style={[styles.loadingText, { color: '#ef4444', marginTop: 12 }]}>INCOMPLETE METADATA NODE</Text>
            <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
                This asset record is missing its primary reference ID in the global registry.
            </Text>
            <TouchableOpacity 
                style={{ marginTop: 24, backgroundColor: '#f1f5f9', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }} 
                onPress={() => navigation.goBack()}
            >
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#1e293b' }}>RETURN TO REGISTRY</Text>
            </TouchableOpacity>
        </View>
    );
  }

  if (!property) return null;

  const images = property?.property_images?.map((img: any) => getFullImageUrl(img.image)) || [];
  if (images.length === 0 && property?.thumbnail) {
      images.push(getFullImageUrl(property.thumbnail));
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Media Carousel */}
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <>
              <ScrollView 
                  ref={carouselRef}
                  horizontal 
                  pagingEnabled 
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                      if (idx !== activeImageIndex) setActiveImageIndex(idx);
                  }}
                  scrollEventThrottle={16}
              >
                  {images.map((uri: string, index: number) => (
                      <ExpoImage
                          key={index}
                          source={{ uri }}
                          style={styles.image}
                          contentFit="cover"
                          transition={600}
                      />
                  ))}
              </ScrollView>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <View style={styles.carouselNavOverlay} pointerEvents="box-none">
                  <TouchableOpacity 
                    style={[styles.carouselNavBtn, styles.carouselNavBtnLeft]} 
                    onPress={() => scrollToIndex(activeImageIndex - 1)}
                  >
                    <ChevronLeft color="#fff" size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.carouselNavBtn, styles.carouselNavBtnRight]} 
                    onPress={() => scrollToIndex(activeImageIndex + 1)}
                  >
                    <ChevronRight color="#fff" size={24} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Info color="#94a3b8" size={64} />
              <Text style={styles.placeholderText}>NO VISUAL DATA AVAILABLE</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#1e293b" size={24} />
          </TouchableOpacity>

          {images.length > 1 && (
            <View style={styles.carouselHudin}>
                <Text style={styles.carouselHudText}>{activeImageIndex + 1} / {images.length}</Text>
            </View>
          )}

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
          <View style={styles.topMeta}>
            <View style={styles.typeBadgesGrid}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{property.property_type}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: property.listing_type === 'sale' ? '#ecfdf5' : '#eff6ff' }]}>
                  <Text style={[styles.typeBadgeText, { color: property.listing_type === 'sale' ? '#10b981' : '#3b82f6' }]}>
                    For {property.listing_type}
                  </Text>
                </View>
            </View>
            {property.is_verified && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck color="#10b981" size={14} />
                <Text style={styles.verifiedText}>SECURE ASSET</Text>
              </View>
            )}
          </View>

          <View style={styles.headerTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{property.title}</Text>
              <View style={styles.locationRow}>
                <MapPin color="#6366f1" size={16} />
                <Text style={styles.location}>{property.location}</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Valuation</Text>
              <Text style={styles.price}>NPR {property.price}</Text>
            </View>
          </View>

          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <View style={styles.specIconBack}>
                 <Bed color="#6366f1" size={22} />
              </View>
              <View>
                <Text style={styles.specValue}>{property.beds || 0}</Text>
                <Text style={styles.specLabel}>Bedrooms</Text>
              </View>
            </View>
            <View style={styles.specBox}>
               <View style={styles.specIconBack}>
                 <Bath color="#6366f1" size={22} />
              </View>
              <View>
                <Text style={styles.specValue}>{property.baths || 0}</Text>
                <Text style={styles.specLabel}>Washrooms</Text>
              </View>
            </View>
            <View style={styles.specBox}>
               <View style={styles.specIconBack}>
                 <Square color="#6366f1" size={22} />
              </View>
              <View>
                <Text style={styles.specValue}>{property.area_sqft || 0}</Text>
                <Text style={styles.specLabel}>Square Ft.</Text>
              </View>
            </View>
          </View>

          <MarketInsights propertyId={property.PropertyID || property.id} currentPrice={Number(property.price)} />

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Asset Abstract</Text>
                <Info color="#94a3b8" size={16} />
            </View>
            <Text style={styles.description}>{property.description || 'Synchronizing detailed intelligence for this node...'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interactive Modules</Text>
            <View style={styles.interactiveGrid}>
               <TouchableOpacity style={styles.interactiveBox} onPress={handle3DPress}>
                 <View style={styles.tourIconPulse}>
                    <Camera color="#fff" size={24} />
                 </View>
                 <View style={{ flex: 1 }}>
                    <Text style={styles.interactiveText}>3D Virtual Experience</Text>
                    <Text style={styles.interactiveSub}>Volumetric Scan Active</Text>
                 </View>
               </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Node Localization</Text>
                <TouchableOpacity onPress={handleOpenMap}>
                    <Text style={styles.mapActionText}>External Vectors</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.mapFrame}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.miniMap}
                  initialRegion={{
                    latitude: Number(property.latitude) || 27.7172,
                    longitude: Number(property.longitude) || 85.3240,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker 
                    coordinate={{ 
                      latitude: Number(property.latitude) || 27.7172, 
                      longitude: Number(property.longitude) || 85.3240 
                    }} 
                    title={property.title}
                  >
                    <View style={styles.customMarker}>
                        <View style={styles.markerCircle} />
                    </View>
                  </Marker>
                  {property.boundary_coordinates && Array.isArray(property.boundary_coordinates) && (
                    <Polygon
                      coordinates={property.boundary_coordinates.map((coord: any) => ({
                        latitude: Number(coord.latitude || coord[0]),
                        longitude: Number(coord.longitude || coord[1])
                      }))}
                      fillColor="rgba(99, 102, 241, 0.2)"
                      strokeColor="#6366f1"
                      strokeWidth={2}
                    />
                  )}
                </MapView>
                <View style={styles.mapOverlayHud}>
                    <MapPin color="#6366f1" size={14} />
                    <Text style={styles.mapHudText}>GPS COORDINATES LOCKED</Text>
                </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Asset Custodian</Text>
            <View style={styles.ownerCard}>
                <View style={styles.ownerAvatar}>
                    <Text style={styles.ownerInitial}>{(property.owner?.name || property.owner?.full_name || 'O').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.ownerName}>{property.owner?.name || property.owner?.full_name || 'Property Owner'}</Text>
                    <Text style={styles.ownerRole}>{property.is_verified ? 'VERIFIED PRIMARY ASSET HOLDER' : 'REGISTERED ENTITY'}</Text>
                </View>
                <TouchableOpacity style={styles.ownerContactBtn} onPress={handleContact}>
                   <MessageCircle color="#fff" size={20} />
                </TouchableOpacity>
            </View>
          </View>

          {(user?.role === 'admin' || user?.id === property.owner?.id) && property.property_documents?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verified Credentials</Text>
              <View style={styles.docList}>
                {property.property_documents.map((doc: any) => (
                  <TouchableOpacity 
                    key={doc.id} 
                    style={styles.docItem}
                    onPress={() => Linking.openURL(getFullImageUrl(doc.document) || '')}
                  >
                    <View style={styles.docIconBack}>
                        <FileText color="#6366f1" size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docName}>{doc.doc_type.toUpperCase()}</Text>
                      <Text style={styles.docStatus}>{doc.is_verified ? 'Ledger Consented' : 'Awaiting Validator'}</Text>
                    </View>
                    <Eye color="#94a3b8" size={18} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {user?.role === 'admin' && (property.status === 'submitted' || property.status === 'Submitted') && (
            <View style={styles.adminSection}>
              <Text style={styles.sectionTitle}>Protocols & Governance</Text>
              <View style={styles.adminActions}>
                <TouchableOpacity style={[styles.adminBtn, styles.rejectBtn]} onPress={handleReject}>
                  <XCircle color="#ef4444" size={20} />
                  <Text style={styles.rejectText}>Reject Node</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.adminBtn, styles.approveBtn]} onPress={handleApprove}>
                  <CheckCircle color="#10b981" size={20} />
                  <Text style={styles.approveText}>Publish to Mainnet</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Footer - Premium Edition */}
      <View style={styles.footerActions} pointerEvents="box-none">
        <View style={styles.footerInner}>
            <TouchableOpacity style={styles.saveActionBtn} onPress={handleToggleFavorite}>
               <Heart color={isFavorite ? "#ef4444" : "#64748b"} fill={isFavorite ? "#ef4444" : "transparent"} size={22} />
            </TouchableOpacity>

            <View style={styles.footerDivider} />

            {property.status?.toLowerCase() === 'sold' ? (
                <View style={styles.soldOverlay}>
                    <XCircle color="#fff" size={24} />
                    <Text style={styles.soldText}>SOLD & SETTLED</Text>
                </View>
            ) : (
                <View style={styles.footerMainActions}>
                    <TouchableOpacity 
                        style={styles.secondaryBtn} 
                        onPress={handleContact}
                    >
                        <MessageCircle color="#10b981" size={20} />
                        <Text style={styles.secondaryBtnText}>Inquiry</Text>
                    </TouchableOpacity>
                    
                    {user?.role === 'buyer' && (
                        <TouchableOpacity style={styles.primaryActionButton} onPress={handleAcquire}>
                            <ShieldCheck color="#fff" size={20} />
                            <Text style={styles.primaryActionText}>Acquire Node</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 10,
    fontWeight: '900',
    color: '#6366f1',
    letterSpacing: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
  },
  imageContainer: {
    height: 360,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  image: {
    width: width,
    height: '100%',
  },
  placeholderImage: {
    width: width,
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 12,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  carouselNavOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 50,
  },
  carouselNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  carouselNavBtnLeft: {
    // left specific
  },
  carouselNavBtnRight: {
    // right specific
  },
  carouselHudin: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  carouselHudText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  imageOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 60,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  content: {
    padding: 28,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: '#fff',
    marginTop: -40,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  typeBadgesGrid: {
    flexDirection: 'row',
    // removed gap for native stability
marginRight: 10,
  },
  typeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  verifiedText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // removed gap for native stability
marginRight: 8,
  },
  location: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  priceContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: '#6366f1',
    letterSpacing: -0.5,
  },
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
    gap: 10,
  },
  specBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  specIconBack: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
  },
  specLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 36,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
    fontWeight: '400',
  },
  interactiveGrid: {
    gap: 16,
  },
  interactiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  tourIconPulse: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactiveText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  interactiveSub: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  mapActionText: {
    color: '#6366f1',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mapFrame: {
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
    borderWidth: 2,
    borderColor: '#fff',
  },
  mapOverlayHud: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapHudText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  ownerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInitial: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  ownerName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1e293b',
  },
  ownerRole: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ownerContactBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  docList: {
    // gap: 14,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    // gap: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  docIconBack: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  docStatus: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 4,
  },
  adminSection: {
    marginTop: 12,
    padding: 24,
    backgroundColor: '#0f172a',
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  adminActions: {
    flexDirection: 'row',
    // gap: 12,
    marginTop: 16,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    // gap: 8,
    borderWidth: 1,
  },
  rejectBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  approveBtn: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  rejectText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  approveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
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
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    // gap: 12,
  },
  saveActionBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  footerDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 4,
  },
  footerMainActions: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  soldOverlay: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 60,
  },
  soldText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    height: 60,
    borderRadius: 20,
    // gap: 8,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  secondaryBtnText: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  primaryActionButton: {
    flex: 1.6,
    backgroundColor: '#1e293b',
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PropertyDetailScreen;
