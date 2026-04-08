import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ChevronLeft, ShieldCheck, CheckCircle, XCircle } from 'lucide-react-native';
import api from '../../api/client';

// Helper: parse a query string param from a URL
const getParam = (url: string, key: string): string | null => {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get(key);
    } catch {
        // Fallback regex for environments where URL constructor may fail
        const match = url.match(new RegExp('[?&]' + key + '=([^&]+)'));
        return match ? decodeURIComponent(match[1]) : null;
    }
};

// The URL fragment that Khalti redirects to after payment (our return_url base)
const MOBILE_CALLBACK_FRAGMENT = 'payment/mobile-callback';

const KhaltiPaymentScreen = ({ route, navigation }: any) => {
    const { pidx, paymentUrl, transactionId, amount, propertyTitle } = route.params;
    const [webviewLoading, setWebviewLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Use payment_url from khalti-initiate if provided, otherwise fall back to sandbox URL
    const khaltiUrl = paymentUrl || `https://test-pay.khalti.com/?pidx=${pidx}`;

    // Called after verifying the payment with our backend
    const handleVerificationResult = (success: boolean, errorMsg?: string) => {
        setVerifying(false);
        setPaymentDone(true);
        setPaymentSuccess(success);
        if (!success && errorMsg) {
            console.warn('[Khalti] Verification failed:', errorMsg);
        }
    };

    // Verify payment via our Django backend using the pidx returned by Khalti
    const verifyPayment = useCallback(async (callbackPidx: string) => {
        if (verifying) return; // Prevent duplicate calls
        setVerifying(true);
        setWebviewLoading(false);
        try {
            const response = await api.post(`/transactions/${transactionId}/khalti-verify/`, {
                pidx: callbackPidx,
            });
            const backendStatus = response.data?.status || response.data?.transaction?.status;
            const success = backendStatus === 'COMPLETED' || backendStatus === 'Completed';
            handleVerificationResult(success);
        } catch (error: any) {
            console.error('[Khalti] Verify error:', error?.response?.data || error.message);
            handleVerificationResult(false, error?.response?.data?.error || 'Verification failed');
        }
    }, [transactionId, verifying]);

    // Intercept WebView navigation — blocks the callback URL from actually loading
    // and triggers in-app verification instead. Prevents ERR_CONNECTION_REFUSED.
    const onShouldStartLoadWithRequest = useCallback((request: { url: string }) => {
        const { url } = request;

        // Detect Khalti redirecting to our return_url (mobile callback)
        if (url.includes(MOBILE_CALLBACK_FRAGMENT)) {
            const callbackPidx = getParam(url, 'pidx') || pidx;
            const status = getParam(url, 'status');
            console.log('[Khalti] Callback intercepted. status:', status, 'pidx:', callbackPidx);

            if (status === 'Completed' || status === 'completed') {
                verifyPayment(callbackPidx);
            } else {
                // User cancelled or payment failed — don't bother verifying
                setPaymentDone(true);
                setPaymentSuccess(false);
            }
            return false; // Block WebView from loading this URL
        }

        return true; // Allow all Khalti portal URLs to load normally
    }, [pidx, verifyPayment]);

    // Also catch via onNavigationStateChange as a safety fallback
    const handleNavigationChange = useCallback((navState: { url: string }) => {
        const { url } = navState;
        if (url.includes(MOBILE_CALLBACK_FRAGMENT) && !verifying && !paymentDone) {
            onShouldStartLoadWithRequest({ url });
        }
    }, [verifying, paymentDone, onShouldStartLoadWithRequest]);

    // --- Result screens (shown after payment completes or fails) ---
    if (verifying) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.verifyingText}>Verifying Transaction...</Text>
                    <Text style={styles.verifyingSubText}>Please do not close this screen</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (paymentDone) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    {paymentSuccess ? (
                        <>
                            <CheckCircle color="#10b981" size={72} />
                            <Text style={styles.resultTitle}>Payment Successful</Text>
                            <Text style={styles.resultSub}>Your acquisition request is being processed.</Text>
                            <TouchableOpacity
                                style={[styles.resultBtn, { backgroundColor: '#10b981' }]}
                                onPress={() => navigation.navigate('BuyerHome')}
                            >
                                <Text style={styles.resultBtnText}>Go to Home</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <XCircle color="#ef4444" size={72} />
                            <Text style={styles.resultTitle}>Payment Failed</Text>
                            <Text style={styles.resultSub}>The transaction was cancelled or could not be verified.</Text>
                            <TouchableOpacity
                                style={[styles.resultBtn, { backgroundColor: '#ef4444' }]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.resultBtnText}>Go Back</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    // --- Main payment WebView ---
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                   <ChevronLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleCont}>
                    <Text style={styles.headerTitle}>Procure Asset Node</Text>
                    <Text style={styles.headerSub}>{propertyTitle}</Text>
                </View>
                <View style={styles.amountBadge}>
                    <Text style={styles.amountText}>NPR {amount}</Text>
                </View>
            </View>

            <View style={styles.secureHeader}>
                <ShieldCheck color="#10b981" size={16} />
                <Text style={styles.secureText}>PCI-DSS Secure Transaction — Imperial Shield Active</Text>
            </View>

            <View style={styles.webviewContainer}>
                {webviewLoading && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text style={styles.loaderText}>Syncing Ledger Core...</Text>
                    </View>
                )}
                <WebView
                    source={{ uri: khaltiUrl }}
                    onLoadEnd={() => setWebviewLoading(false)}
                    onNavigationStateChange={handleNavigationChange}
                    onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitleCont: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },
    headerSub: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    amountBadge: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    amountText: {
        color: '#3b82f6',
        fontWeight: '800',
        fontSize: 14,
    },
    secureHeader: {
        backgroundColor: '#f0fdf4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    secureText: {
        color: '#10b981',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    webviewContainer: {
        flex: 1,
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loaderText: {
        marginTop: 12,
        fontSize: 12,
        fontWeight: '800',
        color: '#6366f1',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    verifyingText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 16,
    },
    verifyingSubText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    resultTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 16,
        textAlign: 'center',
    },
    resultSub: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        textAlign: 'center',
    },
    resultBtn: {
        marginTop: 16,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    resultBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 15,
    },
});

export default KhaltiPaymentScreen;
