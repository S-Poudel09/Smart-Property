import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapView = ({ children, style }: any) => (
  <View style={[style, styles.mapPlaceholder]}>
    <Text style={styles.text}>Map Visualization Active in Registry App</Text>
    {children}
  </View>
);

const Marker = ({ children }: any) => <View>{children}</View>;
const Polygon = () => null;
const Callout = ({ children }: any) => <View>{children}</View>;
const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  mapPlaceholder: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  text: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  }
});

export { MapView as default, Marker, Polygon, Callout, PROVIDER_GOOGLE };
