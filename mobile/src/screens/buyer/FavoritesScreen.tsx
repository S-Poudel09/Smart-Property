import React, { useEffect, useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    TouchableOpacity, 
    RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Search, MapPin } from 'lucide-react-native';
import * as Storage from '../../utils/storage';
import api from '../../api/client';
import PropertyCard from '../../components/PropertyCard';
import { useFocusEffect } from '@react-navigation/native';

const FavoritesScreen = ({ navigation }: any) => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadFavorites = useCallback(async () => {
        setIsLoading(true);
        try {
            const savedString = await Storage.getItemAsync('favorite_properties');
            const savedItems = savedString ? JSON.parse(savedString) : [];
            setFavorites(savedItems);
        } catch (error) {
            console.error('Failed to load favorites:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        loadFavorites();
    };

    if (isLoading && favorites.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>SYNCHRONIZING SAVED ASSETS...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <FlatList
                data={favorites}
                keyExtractor={(item: any) => String(item.PropertyID || item.id)}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <PropertyCard 
                            property={item}
                            onPress={() => navigation.navigate('PropertyDetail', { id: item.PropertyID || item.id })}
                        />
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366f1']} />
                }
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.title}>Your Collection</Text>
                        <Text style={styles.subtitle}>{favorites.length} prime assets synchronized with your local store</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <View style={styles.heartCircle}>
                            <Heart size={40} color="#cbd5e1" fill="none" />
                        </View>
                        <Text style={styles.emptyTitle}>Empty Buffer</Text>
                        <Text style={styles.emptySub}>Save architectural masterpieces to your favorites to access them here instantly.</Text>
                        <TouchableOpacity 
                            style={styles.browseBtn}
                            onPress={() => navigation.navigate('Browse')}
                        >
                            <Text style={styles.browseBtnText}>Browse Marketplace</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </SafeAreaView>
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
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 10,
        fontWeight: '900',
        color: '#6366f1',
        letterSpacing: 2,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 40,
    },
    cardWrapper: {
        paddingHorizontal: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    heartCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
        marginTop: 24,
    },
    emptySub: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    browseBtn: {
        marginTop: 32,
        backgroundColor: '#1e293b',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
    },
    browseBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },
});

export default FavoritesScreen;
