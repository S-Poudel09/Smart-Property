import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';

let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.log('WebView not available');
  }
}

const Mobile3DViewerScreen = ({ route }: any) => {
  const { url } = route.params;
  const [loading, setLoading] = useState(true);

  // For Expo Web rendering
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {/* @ts-ignore - iframe is valid in react-native-web but typescript might complain */}
        <iframe 
          src={url} 
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      )}
      {WebView ? (
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      ) : (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark background for 3D viewer
  },
  webview: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    zIndex: 1,
  }
});

export default Mobile3DViewerScreen;
