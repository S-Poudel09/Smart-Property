import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Dimensions, 
    ActivityIndicator, 
    Alert,
    StatusBar,
    FlatList
} from 'react-native';
import { 
    ChevronLeft, 
    MapPin, 
    User, 
    Phone, 
    Mail, 
    CheckCircle, 
    XCircle, 
    Calendar, 
    ShieldCheck,
    FileText,
    Info,
    Building2,
    ArrowLeft,
    ExternalLink
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { getFullImageUrl } from '../../api/client';

const { width } = Dimensions.get('window');

const AdminPropertyDetailScreen = ({ route, navigation }: any) => {
    const { id } = route.params;
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetail = async () => {
        try {
            const response = await api.get(`/properties/${id}/`);
            setProperty(response.data);
        } catch (error) {
            console.error('Admin Detail Error:', error);
            Alert.alert('Error', 'Failed to fetch property details.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleApprove = async () => {
        Alert.alert(
            'CONFIRM APPROVAL',
            'Proceed with production release of this asset node?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'APPROVE', 
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await api.post(`/properties/${id}/approve/`);
                            Alert.alert('SUCCESS', 'Asset node published successfully.');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('ERROR', 'Approval failed.');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReject = () => {
        Alert.alert(
            'VOID REGISTRY NODE',
            'Are you certain you wish to reject this submission node? This action will alert the seller to perform a corrective audit.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'REJECT NODE', 
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            // Using a standard audit failure notice for cross-platform stability
                            await api.post(`/properties/${id}/reject/`, { 
                                rejection_reason: "Property details do not meet the sovereign registry compliance standards." 
                            });
                            Alert.alert('VOIDED', 'Submission node rejected and moved to voided archives.');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('ERROR', 'Rejection protocol failed.');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    const images = property?.property_images?.map((img: any) => getFullImageUrl(img.image)) || [];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header Hub */}
            <View style={[styles.header, { zIndex: 100 }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backBtn}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleCont}>
                    <Text style={styles.headerTitle}>REGISTRY AUDIT</Text>
                    <Text style={styles.headerSub}>NODE ID: {id?.substring(0, 8).toUpperCase()}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{property.status?.toUpperCase()}</Text>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollPadding}>
                {/* Visual Artifacts */}
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
                    {images.length > 0 ? images.map((img: string, index: number) => (
                        <Image key={index} source={{ uri: img }} style={styles.heroImage} />
                    )) : (
                        <View style={[styles.heroImage, styles.imagePlaceholder]}>
                            <Building2 color="#cbd5e1" size={80} />
                        </View>
                    )}
                </ScrollView>

                {/* Core Metadata */}
                <View style={styles.section}>
                    <Text style={styles.propertyTitle}>{property.title}</Text>
                    <View style={styles.locationRow}>
                        <MapPin color="#6366f1" size={16} />
                        <Text style={styles.locationText}>{property.location}</Text>
                    </View>
                    
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>REQUESTED VALUATION</Text>
                        <Text style={styles.priceValue}>NPR {property.price?.toLocaleString() || property.price}</Text>
                    </View>
                </View>

                {/* Seller Identity Node */}
                <View style={[styles.section, styles.borderTop]}>
                    <Text style={styles.sectionTitle}>ORIGIN NODE (SELLER)</Text>
                    <View style={styles.sellerCard}>
                        <View style={styles.sellerAvatar}>
                            <User color="#6366f1" size={24} />
                        </View>
                        <View style={styles.sellerInfo}>
                            <Text style={styles.sellerName}>{property.owner_name || 'Registry User'}</Text>
                            <View style={styles.contactRow}>
                                <Mail color="#94a3b8" size={12} />
                                <Text style={styles.contactText}>Verified Submitter</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Property Specification */}
                <View style={[styles.section, styles.borderTop]}>
                    <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>
                    <View style={styles.specGrid}>
                        <View style={styles.specItem}>
                            <Text style={styles.specLabel}>CATEGORY</Text>
                            <Text style={styles.specValue}>{property.category_name || property.category || 'ASSET'}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Text style={styles.specLabel}>AREA</Text>
                            <Text style={styles.specValue}>{property.area || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Description Audit */}
                <View style={[styles.section, styles.borderTop]}>
                    <Text style={styles.sectionTitle}>ASSET DESCRIPTION</Text>
                    <Text style={styles.descriptionText}>{property.description || 'No description provided by origin.'}</Text>
                </View>

                {/* System Compliance Info */}
                <View style={styles.complianceBox}>
                    <Info color="#6366f1" size={20} />
                    <Text style={styles.complianceText}>
                        Manual verification required. Ensure all coordinates and valuation documents align with regional land records before approval.
                    </Text>
                </View>
            </ScrollView>

            {/* Persistence Controls */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.footerBtn, styles.rejectBtn]} 
                    onPress={handleReject}
                    disabled={actionLoading}
                >
                    <XCircle color="#fff" size={20} />
                    <Text style={styles.footerBtnText}>VOID REQUEST</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.footerBtn, styles.approveBtn]} 
                    onPress={handleApprove}
                    disabled={actionLoading}
                >
                    {actionLoading ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <CheckCircle color="#fff" size={20} />
                            <Text style={styles.footerBtnText}>EXECUTE RELEASE</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitleCont: { flex: 1, marginLeft: 12 },
    headerTitle: { fontSize: 10, fontWeight: '900', color: '#6366f1', letterSpacing: 2 },
    headerSub: { fontSize: 12, fontWeight: '700', color: '#1e293b', marginTop: 2 },
    statusBadge: {
        backgroundColor: '#fffbeb',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    statusBadgeText: { fontSize: 10, fontWeight: '900', color: '#d97706' },
    content: { flex: 1 },
    scrollPadding: { paddingBottom: 100 },
    imageGallery: { height: 280, backgroundColor: '#f8fafc' },
    heroImage: { width: width, height: 280, resizeMode: 'cover' },
    imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
    section: { padding: 24 },
    borderTop: { borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    propertyTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
    locationText: { fontSize: 15, color: '#64748b', fontWeight: '600' },
    priceContainer: { marginTop: 24, backgroundColor: '#f8fafc', padding: 20, borderRadius: 24 },
    priceLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
    priceValue: { fontSize: 26, fontWeight: '900', color: '#6366f1', marginTop: 4 },
    sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 20 },
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    sellerAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sellerInfo: { flex: 1 },
    sellerName: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    contactText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
    specGrid: { flexDirection: 'row', gap: 16 },
    specItem: { flex: 1, backgroundColor: '#f8fafc', padding: 16, borderRadius: 16 },
    specLabel: { fontSize: 10, fontWeight: '900', color: '#cbd5e1', letterSpacing: 1, marginBottom: 4 },
    specValue: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    descriptionText: { fontSize: 16, color: '#475569', lineHeight: 26, fontWeight: '500' },
    complianceBox: {
        margin: 24,
        padding: 20,
        backgroundColor: '#eff6ff',
        borderRadius: 20,
        flexDirection: 'row',
        gap: 16,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    complianceText: { flex: 1, fontSize: 13, color: '#1e40af', lineHeight: 20, fontWeight: '600' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: '#fff',
        flexDirection: 'row',
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    footerBtn: {
        flex: 1,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    approveBtn: { backgroundColor: '#10b981' },
    rejectBtn: { backgroundColor: '#ef4444' },
    footerBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
});

export default AdminPropertyDetailScreen;
