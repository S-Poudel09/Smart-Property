import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Text, 
  Alert,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { 
    ChevronLeft, 
    Info, 
    AlertTriangle, 
    Image as ImageIcon, 
    Layers, 
    Maximize2,
    Cpu,
    RefreshCw,
    ShieldCheck,
    Box
} from 'lucide-react-native';
import { Image as ExpoImage } from 'expo-image';
import { 
    GestureHandlerRootView, 
    Gesture, 
    GestureDetector 
} from 'react-native-gesture-handler';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// --- Approved Domains for 3D Viewer ---
const APPROVED_3D_POOLS = [
    'kuula.co',
    'matterport.com',
    'roundme.com',
    '360cities.net',
    'cloudpano.com',
    'panna.to',
    'vimeo.com',
    'youtube.com'
];

const validateVolumetricLink = (link: string | null) => {
    if (!link) return false;
    const l = String(link).trim();
    if (l === '' || l === 'null') return false;
    if (l.includes('smartproperty.app')) return false;
    try {
        const domain = (l.split('/')[2] || '').toLowerCase();
        return APPROVED_3D_POOLS.some(approved => domain.includes(approved));
    } catch {
        return false;
    }
};

// --- Interactive Reconstruction Component ---
const InteractiveNode = ({ uri, index }: { uri: string, index: number }) => {
    const scale = useSharedValue(1);
    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const prevTranslationX = useSharedValue(0);
    const prevTranslationY = useSharedValue(0);
    const parallaxX = useSharedValue(0);
    const parallaxY = useSharedValue(0);
    
    // React state for HUD readout
    const [readout, setReadout] = useState('1.00x');

    // UI Thread to JS Thread bridge handler
    const updateHUD = (sValue: number) => {
        const formatted = sValue.toFixed(2) + 'x';
        setReadout(formatted);
    };

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            const s = Math.max(0.5, Math.min(event.scale || 1, 4)); 
            scale.value = s;
            // CRITICAL FIX: Calling JS state setter from UI thread must use runOnJS
            runOnJS(updateHUD)(s);
        })
        .onEnd(() => {
            scale.value = withSpring(Math.max(1, Math.min(scale.value, 3)));
        });

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            const s = scale.value || 1;
            const tx = event.translationX || 0;
            const ty = event.translationY || 0;
            
            if (s > 1.1) {
                translationX.value = prevTranslationX.value + tx;
                translationY.value = prevTranslationY.value + ty;
            } else {
                parallaxX.value = withTiming(tx / 20, { duration: 100 });
                parallaxY.value = withTiming(ty / 20, { duration: 100 });
            }
        })
        .onEnd(() => {
            prevTranslationX.value = translationX.value;
            prevTranslationY.value = translationY.value;
            parallaxX.value = withSpring(0);
            parallaxY.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => {
        // Deep sanitization of numeric values before passing to native bridge
        const tx = isFinite(translationX.value) ? translationX.value : 0;
        const ty = isFinite(translationY.value) ? translationY.value : 0;
        const s = isFinite(scale.value) && scale.value > 0 ? scale.value : 1;
        const px = isFinite(parallaxX.value) ? parallaxX.value : 0;
        const py = isFinite(parallaxY.value) ? parallaxY.value : 0;

        // Force '0deg' literal for absolute zero to bypass string-parsing edge cases on certain Android chips
        const rotYStr = px === 0 ? '0deg' : (px.toFixed(3) + 'deg');
        const rotXStr = py === 0 ? '0deg' : ((-py).toFixed(3) + 'deg');

        return {
            transform: [
                { perspective: 1000 },
                { translateX: tx },
                { translateY: ty },
                { scale: s },
                { rotateY: rotYStr },
                { rotateX: rotXStr },
            ],
        };
    });

    const composed = Gesture.Simultaneous(pinchGesture, panGesture);

    return (
        <GestureDetector gesture={composed}>
            <Animated.View 
                style={[styles.reconImageContainer, animatedStyle]}
                collapsable={false}
            >
                <ExpoImage 
                    source={{ uri: uri || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6' }} 
                    style={styles.reconImage} 
                    contentFit="cover"
                    transition={400}
                    cachePolicy="memory-disk"
                />
                
                <View style={styles.reconOverlayTop}>
                    <View style={styles.nodeBadge}>
                        <View style={{ marginRight: 6 }}>
                             <Cpu color="#10b981" size={10} />
                        </View>
                        <Text style={styles.overlayText}>SENSOR NODE: 0{index + 1}</Text>
                    </View>
                    <View style={[styles.nodeBadge, { marginLeft: 10 }]}>
                        <View style={{ marginRight: 6 }}>
                            <Maximize2 color="#10b981" size={10} />
                        </View>
                        <Text style={styles.overlayText}>Z-BUFFER: {readout}</Text>
                    </View>
                </View>
                <View style={styles.reconOverlayBottom}>
                    <View style={styles.rectMarker} />
                    <View style={{ marginHorizontal: 12 }}>
                        <Text style={styles.overlayText}>PARALLAX SENSORS ACTIVE</Text>
                    </View>
                    <View style={styles.rectMarker} />
                </View>
            </Animated.View>
        </GestureDetector>
    );
};

const Mobile3DViewerScreen = ({ route, navigation }: any) => {
  const { url, propertyTitle, images = [] } = route.params;
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'realtime' | 'synthesis'>('realtime');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    // Treat null/empty as a normal synthesis trigger, not an app error
    if (!url || String(url) === 'null' || String(url).trim() === '') {
      setMode('synthesis');
      setLoading(false);
      return;
    }

    const isValid = validateVolumetricLink(url);
    if (!isValid) {
      setMode('synthesis');
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      if (loading && mode === 'realtime') {
        setMode('synthesis');
        setLoading(false);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [url]);

  const handleRefresh = () => {
      setLoading(true);
      if (url && validateVolumetricLink(url)) {
          setMode('realtime');
      } else {
          setMode('synthesis');
          setLoading(false);
      }
  };

  const renderHeader = (isSynthesis: boolean) => (
    <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{propertyTitle || 'Asset Preview'}</Text>
            <View style={isSynthesis ? styles.synthesisBadge : styles.liveBadge}>
                {isSynthesis ? (
                    <View style={{ marginRight: 6 }}><Cpu color="#f59e0b" size={10} /></View>
                ) : (
                    <View style={[styles.dot, { marginRight: 6 }]} />
                )}
                <Text style={isSynthesis ? styles.synthesisText : styles.liveText}>
                    {isSynthesis ? 'INTERNAL RECONSTRUCTION' : '3D VOLUMETRIC ACTIVE'}
                </Text>
            </View>
        </View>
        <TouchableOpacity 
            style={styles.infoBtn} 
            onPress={() => isSynthesis ? handleRefresh() : Alert.alert('3D Viewer', 'Rotate: 1 Finger | Zoom: 2 Fingers')}
        >
            {isSynthesis ? <RefreshCw color="#fff" size={20} /> : <Info color="#fff" size={20} />}
        </TouchableOpacity>
    </View>
  );

  if (mode === 'synthesis') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {renderHeader(true)}

            <View style={styles.reconstructionHeader}>
                <View style={{ marginRight: 10 }}>
                    <Layers color="#6366f1" size={18} />
                </View>
                <Text style={styles.reconTitle}>RECONSTRUCTING SPATIAL CLUSTER</Text>
            </View>

            <View style={styles.visualStack}>
                {images && images.length > 0 ? (
                    <>
                        <InteractiveNode uri={images[activeImageIdx]} index={activeImageIdx} />
                        <View style={styles.reconHud}>
                            <TouchableOpacity style={styles.reconHudBadge} onPress={() => setActiveImageIdx((prev) => (prev + 1) % images.length)}>
                                <View style={{ marginRight: 8 }}>
                                    <Layers color="#fff" size={12} />
                                </View>
                                <Text style={styles.reconHudText}>LAYER: 0{activeImageIdx + 1} (TAP TO SWITCH)</Text>
                            </TouchableOpacity>
                            <View style={[styles.reconHudBadge, { marginTop: 10 }]}>
                                <View style={{ marginRight: 8 }}>
                                    <Maximize2 color="#fff" size={12} />
                                </View>
                                <Text style={styles.reconHudText}>PINCH TO ZOOM / PAN FOR PARALLAX</Text>
                            </View>
                        </View>
                        <View style={styles.interactionGuard}>
                             <View style={{ marginRight: 4 }}>
                                <ShieldCheck color="#10b981" size={10} />
                             </View>
                             <Text style={styles.guardText}>SYNTHETIC HUD SECURE</Text>
                        </View>
                    </>
                ) : (
                    <View style={styles.emptyPrompt}>
                        <AlertTriangle color="#f59e0b" size={48} />
                        <Text style={styles.emptyTitle}>NO BUFFER DETECTED</Text>
                        <Text style={styles.emptySub}>Asset synchronization missing volumetric data nodes.</Text>
                    </View>
                )}
            </View>

            <View style={styles.fallbackFooter}>
                <Text style={styles.fallbackInfo}>
                    External 3D stream not detected. Our engine has synthesized an interactive pseudo-3D parallax probe as a safe alternative.
                </Text>
                <TouchableOpacity style={styles.fallbackBtn} onPress={() => navigation.goBack()}>
                    <View style={{ marginRight: 12 }}>
                        <Box color="#fff" size={20} />
                    </View>
                    <Text style={styles.fallbackBtnText}>RETURN TO REGISTRY</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {renderHeader(false)}

        <View style={styles.viewerContainer}>
          <WebView 
            source={{ uri: String(url) }} 
            style={styles.webview}
            onLoadStart={() => {
              setLoading(true);
            }}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setMode('synthesis');
              setLoading(false);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            allowsFullscreenVideo={true}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>BUFFERING CLOUD VOLUMETRIC...</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginRight: 16 },
  titleContainer: { flex: 1 },
  title: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  synthesisBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  liveText: { color: '#94a3b8', fontSize: 9, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  synthesisText: { color: '#f59e0b', fontSize: 8, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  infoBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
  viewerContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#000' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { color: '#6366f1', marginTop: 20, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  reconstructionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, backgroundColor: '#1e293b' },
  reconTitle: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  visualStack: { height: 400, width: '100%', backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  reconImageContainer: { width: width, height: 400, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  reconImage: { width: '100%', height: '100%' },
  reconOverlayTop: { position: 'absolute', top: 25, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  nodeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  reconOverlayBottom: { position: 'absolute', bottom: 25, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  overlayText: { color: '#10b981', fontSize: 9, fontWeight: '800' },
  rectMarker: { width: 30, height: 1, backgroundColor: '#10b981' },
  reconHud: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  reconHudBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.9)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.4)' },
  reconHudText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  interactionGuard: { position: 'absolute', top: 15, right: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  guardText: { color: '#10b981', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  emptyPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 20 },
  emptySub: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 8 },
  fallbackFooter: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
  fallbackInfo: { color: '#94a3b8', textAlign: 'center', lineHeight: 22, marginBottom: 30, fontSize: 13, fontWeight: '500' },
  fallbackBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', paddingHorizontal: 32, paddingVertical: 18, borderRadius: 18, elevation: 12 },
  fallbackBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1.5 }
});

export default Mobile3DViewerScreen;
