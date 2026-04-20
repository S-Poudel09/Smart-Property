import React, { useState, useCallback } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    FlatList, 
    ActivityIndicator, 
    TouchableOpacity, 
    Alert,
    RefreshControl 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    CreditCard, 
    Calendar, 
    ChevronRight, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    ArrowRight 
} from 'lucide-react-native';
import api from '../../api/client';

// Define styles at the top level, ensured to be available for functions below
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
    transactionCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#1e293b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
        gap: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    propertyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    amountLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#6366f1',
    },
    arrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
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

const TransactionsScreen = ({ navigation }: any) => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('transactions/');
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchTransactions();
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle2 size={14} color="#10b981" /> };
            case 'PENDING': return { color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={14} color="#f59e0b" /> };
            case 'FAILED': return { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={14} color="#ef4444" /> };
            default: return { color: '#64748b', bg: '#f1f5f9', icon: <Clock size={14} color="#64748b" /> };
        }
    };

    const renderTransaction = ({ item }: any) => {
        const status = getStatusStyle(item.status);
        const date = item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : 'Recent';

        return (
            <TouchableOpacity 
                style={styles.transactionCard}
                onPress={() => {
                    const propId = item.Property?.PropertyID || item.Property?.id || item.property?.id || item.property || item.property_id;
                    if (propId) {
                        navigation.navigate('PropertyDetail', { id: propId });
                    } else {
                        Alert.alert('Metadata Syncing', 'The detailed property node for this acquisition is still being indexed. Please try again in a moment.');
                    }
                }}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        {status.icon}
                        <Text style={[styles.statusText, { color: status.color }]}>{item.status}</Text>
                    </View>
                    <Text style={styles.dateText}>{date}</Text>
                </View>

                <Text style={styles.propertyTitle} numberOfLines={1}>
                    {item.property_title || 'Property Acquisition'}
                </Text>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.amountLabel}>Total Amount</Text>
                        <Text style={styles.amountValue}>NPR {parseFloat(item.total_amount).toLocaleString()}</Text>
                    </View>
                    <View style={styles.arrowCircle}>
                        <ArrowRight size={18} color="#6366f1" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>FETCHING LEDGER...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <FlatList
                data={transactions}
                keyExtractor={(item: any, index: number) => String(item.TransactionID || item.id || index)}
                renderItem={renderTransaction}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366f1']} />
                }
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.title}>Asset Registry</Text>
                        <Text style={styles.subtitle}>Historical proof of property acquisitions</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <CreditCard size={64} color="#e2e8f0" />
                        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                        <Text style={styles.emptySub}>Your verified acquisitions will appear here.</Text>
                        <TouchableOpacity 
                            style={styles.browseBtn}
                            onPress={() => navigation.navigate('Browse')}
                        >
                            <Text style={styles.browseBtnText}>Explore Market</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default TransactionsScreen;
