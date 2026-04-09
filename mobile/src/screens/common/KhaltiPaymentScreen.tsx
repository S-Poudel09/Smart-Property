import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Text,
    Platform,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
    ChevronLeft,
    ShieldCheck,
    CheckCircle,
    XCircle,
    RotateCw,
    AlertTriangle,
    Info,
    ExternalLink,
    Lock
} from 'lucide-react-native';
import api from '../../api/client';

// Helper: parse a query string param from a URL
const getParam = (url: string, key: string): string | null => {
    const match = url.match(new RegExp('[?&]' + key + '=([^&]+)'));
    return match ? decodeURIComponent(match[1]) : null;
};

const SUCCESS_FRAGMENTS = ['status=Completed', 'status=completed', 'status=success', 'purchase_order_id='];
const FAILURE_FRAGMENTS = ['status=Canceled', 'status=canceled', 'status=Failed', 'status=failed', 'status=User%20canceled'];
const CALLBACK_DOMAIN = 'smartproperty.app';

const KhaltiPaymentScreen = ({ route, navigation }: any) => {
    const {
        pidx,
        paymentUrl,
        transactionId,
        amount,
        propertyTitle,
        originalAmount,
        isSandbox,
        isDemoAdjustment
    } = route.params;

    const [webviewLoading, setWebviewLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const webViewRef = useRef<WebView>(null);
    const safetyTimerRef = useRef<any>(null);

    const khaltiUrl = paymentUrl || `https://test-pay.khalti.com/?pidx=${pidx}`;

    useEffect(() => {
        console.log('[Khalti] Initializing Portal — Transaction:', transactionId);
    }, []);

    useEffect(() => {
        safetyTimerRef.current = setTimeout(() => {
            if (webviewLoading) {
                setWebviewLoading(false);
            }
        }, 15000);

        return () => { if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current); };
    }, [webviewLoading]);

    const handleVerificationResult = (success: boolean, msg?: string) => {
        setVerifying(false);
        setPaymentDone(true);
        setPaymentSuccess(success);
        setWebviewLoading(false);
    };

    const verifyPayment = useCallback(async (callbackPidx: string) => {
        if (verifying || paymentDone) return;
        setVerifying(true);
        setWebviewLoading(false);
        try {
            const response = await api.post(`/transactions/${transactionId}/khalti-verify/`, {
                pidx: callbackPidx || pidx,
            });
            const status = response.data?.status || response.data?.transaction?.status;
            const isCompleted = status === 'COMPLETED' || status === 'Completed' || response.status === 200;
            handleVerificationResult(isCompleted);
        } catch (error: any) {
            handleVerificationResult(false);
        }
    }, [transactionId, verifying, paymentDone, pidx]);

    const handleUrlState = useCallback((url: string) => {
        if (SUCCESS_FRAGMENTS.some(f => url.includes(f)) || (url.includes(CALLBACK_DOMAIN) && url.includes('status=Completed'))) {
            verifyPayment(getParam(url, 'pidx') || pidx);
            return true;
        }
        if (FAILURE_FRAGMENTS.some(f => url.includes(f)) || url.includes('cancelled') || url.includes('failed')) {
            handleVerificationResult(false);
            return true;
        }
        return false;
    }, [pidx, verifyPayment]);

    const reloadPortal = () => {
        setErrorMsg('');
        setLoadError(false);
        setPaymentDone(false);
        setPaymentSuccess(false);
        setWebviewLoading(true);
        webViewRef.current?.reload();
    };

    if (verifying) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.verifyingText}>Verifying Ledger Settlement...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (paymentDone) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <View style={styles.centered}>
                    {paymentSuccess ? (
                        <>
                            <CheckCircle color="#10b981" size={80} />
                            <Text style={styles.resultTitle}>Asset Node Procured</Text>
                            <Text style={styles.resultSub}>
                                Verified payment for "{propertyTitle}". Ownership node successfully added to your secure dashboard and ledger registry.
                            </Text>
                            <TouchableOpacity style={[styles.resultBtn, { backgroundColor: '#10b981' }]} onPress={() => navigation.navigate('Main', { screen: 'BuyerHome' })}>
                                <Text style={styles.resultBtnText}>CONTINUE TO DASHBOARD</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <XCircle color="#ef4444" size={80} />
                            <Text style={styles.resultTitle}>Transaction Void</Text>
                            <Text style={styles.resultSubText}>The payment session was either cancelled or failed at the validator level.</Text>
                            <View style={styles.failureActions}>
                                <TouchableOpacity style={[styles.resultBtn, { backgroundColor: '#1e293b', flex: 1, marginRight: 6 }]} onPress={() => navigation.goBack()}><Text style={styles.resultBtnText}>BACK</Text></TouchableOpacity>
                                <TouchableOpacity style={[styles.resultBtn, { backgroundColor: '#6366f1', flex: 1, marginLeft: 6 }]} onPress={reloadPortal}><Text style={styles.resultBtnText}>RETRY</Text></TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Optimized Header Hub */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <ChevronLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleCont}>
                    <Text style={styles.headerTitle}>SECURE ACQUISITION</Text>
                    <Text style={styles.headerSub} numberOfLines={1}>{propertyTitle}</Text>
                    
                    {isSandbox && (
                        <View style={styles.sandboxChip}>
                            <Lock color="#b45309" size={8} style={{ marginRight: 4 }} />
                            <Text style={styles.sandboxChipText}>TEST ENVIRONMENT ACTIVE</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.priceColumn}>
                   <View style={styles.payableBadge}>
                       <Text style={styles.payableLabel}>VALUATION</Text>
                       <Text style={styles.payableValue}>NPR {(originalAmount || amount)?.toLocaleString()}</Text>
                   </View>
                   {isDemoAdjustment && (
                       <View style={styles.demoNote}>
                           <Text style={styles.demoNoteText}>Settlement Fee: NPR {amount?.toLocaleString()}</Text>
                       </View>
                   )}
                </View>
            </View>

            <View style={styles.webviewContainer}>
                {webviewLoading && !loadError && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text style={styles.loaderText}>CONNECTING TO GATEWAY...</Text>
                    </View>
                )}
                {loadError ? (
                    <View style={styles.errorContainer}>
                        <AlertTriangle color="#ef4444" size={48} />
                        <Text style={styles.errorTitle}>Portal Connectivity Lost</Text>
                        <Text style={styles.errorSub}>{errorMsg || 'Validator node unresponsive. Please retry manually.'}</Text>
                        <View style={styles.errorActions}>
                            <TouchableOpacity style={styles.retryBtn} onPress={reloadPortal}>
                                <RotateCw color="#fff" size={18} style={{ marginRight: 8 }} />
                                <Text style={styles.retryBtnText}>RETRY HANDSHAKE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <WebView
                        ref={webViewRef}
                        source={{ uri: khaltiUrl }}
                        onLoadEnd={() => setWebviewLoading(false)}
                        onNavigationStateChange={(s) => { if (!handleUrlState(s.url) && !s.loading) setWebviewLoading(false); }}
                        onShouldStartLoadWithRequest={(r) => !handleUrlState(r.url)}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        androidLayerType={Platform.OS === 'android' ? 'software' : 'none'}
                    />
                )}
            </View>

            {/* Premium Trust Footer */}
            <View style={styles.footerShield}>
                <ShieldCheck color="#10b981" size={14} style={{ marginRight: 8 }} />
                <Text style={styles.footerShieldText}>KHALTI PCI-DSS ENCRYPTED TUNNEL</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    closeBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitleCont: { flex: 1 },
    headerTitle: { fontSize: 13, fontWeight: '900', color: '#1e293b', letterSpacing: 1.5 },
    headerSub: { fontSize: 11, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
    sandboxChip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: '#fffbeb',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    sandboxChipText: { fontSize: 7, fontWeight: '900', color: '#b45309', letterSpacing: 0.5 },
    priceColumn: { alignItems: 'flex-end' },
    payableBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#dcfce7', alignItems: 'flex-end' },
    payableLabel: { fontSize: 8, fontWeight: '900', color: '#10b981', letterSpacing: 1, marginBottom: 2 },
    payableValue: { color: '#047857', fontWeight: '900', fontSize: 16 },
    demoNote: { marginTop: 4, paddingHorizontal: 4 },
    demoNoteText: { fontSize: 8, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
    webviewContainer: { flex: 1, backgroundColor: '#fff' },
    loader: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    loaderText: { marginTop: 20, fontSize: 10, fontWeight: '900', color: '#6366f1', letterSpacing: 2 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    errorTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginTop: 20 },
    errorSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 10, lineHeight: 20 },
    errorActions: { width: '100%', marginTop: 32 },
    retryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', paddingVertical: 18, borderRadius: 20 },
    retryBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    verifyingText: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginTop: 20 },
    resultTitle: { fontSize: 26, fontWeight: '900', color: '#1e293b', marginTop: 24, letterSpacing: -1 },
    resultSub: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 16, lineHeight: 24, paddingHorizontal: 10 },
    resultSubText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 12 },
    failureActions: { flexDirection: 'row', width: '100%', marginTop: 40 },
    resultBtn: { paddingVertical: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    resultBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
    footerShield: { paddingVertical: 12, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    footerShieldText: { color: '#94a3b8', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});

export default KhaltiPaymentScreen;
