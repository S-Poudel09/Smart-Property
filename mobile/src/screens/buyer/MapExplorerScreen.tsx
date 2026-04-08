import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, Polygon } from '../../components/common/MapComponents';
import { ChevronLeft, MapPin, Building2, Layers } from 'lucide-react-native';
import api from '../../api/client';

const MapExplorerScreen = ({ navigation }: any) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState({
        latitude: 27.7172, // Kathmandu
        longitude: 85.3240,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await api.get('/properties/');
            setProperties(response.data);
            
            // Adjust map to first property if exists
            if (response.data.length > 0) {
                const first = response.data[0];
                if (first.latitude && first.longitude) {
                    setRegion({
                        ...region,
                        latitude: Number(first.latitude),
                        longitude: Number(first.longitude),
                    });
                }
            }
        } catch (error) {
            console.error('Map fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Syncing Geospatial Nodes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={region}
                provider="google"
            >
                {properties.map((prop: any) => (
                    <React.Fragment key={prop.id || prop.PropertyID}>
                        <Marker
                            coordinate={{
                                latitude: Number(prop.latitude) || 27.7172 + (Math.random() - 0.5) * 0.02,
                                longitude: Number(prop.longitude) || 85.3240 + (Math.random() - 0.5) * 0.02,
                            }}
                            pinColor="#6366f1"
                        >
                            <Callout onPress={() => navigation.navigate('PropertyDetail', { id: prop.id || prop.PropertyID })}>
                                <View style={styles.callout}>
                                    <Text style={styles.calloutTitle}>{prop.title}</Text>
                                    <Text style={styles.calloutPrice}>NPR {prop.price}</Text>
                                    <View style={styles.calloutFooter}>
                                        <Text style={styles.calloutLink}>Inspect Cluster</Text>
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                        {prop.boundary_coordinates && (
                            <Polygon
                                coordinates={prop.boundary_coordinates}
                                fillColor="rgba(99, 102, 241, 0.1)"
                                strokeColor="#6366f1"
                                strokeWidth={1}
                            />
                        )}
                    </React.Fragment>
                ))}
            </MapView>

            {/* Overlays */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <ChevronLeft color="#1e293b" size={24} />
            </TouchableOpacity>

            <View style={styles.hudCont}>
                <View style={styles.hudBadge}>
                    <Layers color="#fff" size={14} />
                    <Text style={styles.hudText}>{properties.length} Nodes Online</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    hudCont: {
        position: 'absolute',
        top: 60,
        right: 20,
    },
    hudBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    hudText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    callout: {
        width: 200,
        padding: 12,
    },
    calloutTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    calloutPrice: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6366f1',
    },
    calloutFooter: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 8,
    },
    calloutLink: {
        fontSize: 11,
        fontWeight: '800',
        color: '#3b82f6',
        textTransform: 'uppercase',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 12,
        fontWeight: '800',
        color: '#6366f1',
        textTransform: 'uppercase',
        letterSpacing: 2,
    }
});

export default MapExplorerScreen;
