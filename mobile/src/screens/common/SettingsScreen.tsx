import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Settings, Bell, Shield, Eye, HelpCircle } from 'lucide-react-native';

const SettingsScreen = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const renderToggle = (icon: any, title: string, value: boolean, onToggle: (val: boolean) => void) => (
    <View style={styles.settingItem}>
      <View style={styles.iconTitleRow}>
        <View style={styles.iconBg}>{icon}</View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
        thumbColor={Platform.OS === 'ios' ? '#fff' : value ? '#fff' : '#f8fafc'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          {renderToggle(<Bell color="#6366f1" size={20} />, 'Push Notifications', pushEnabled, setPushEnabled)}
          {renderToggle(<HelpCircle color="#10b981" size={20} />, 'Email Updates', emailEnabled, setEmailEnabled)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security & Access</Text>
        <View style={styles.card}>
          {renderToggle(<Shield color="#f59e0b" size={20} />, 'Biometric Login', biometricEnabled, setBiometricEnabled)}
          <TouchableOpacity style={styles.buttonItem}>
            <View style={styles.iconTitleRow}>
                <View style={[styles.iconBg, { backgroundColor: '#fef2f2' }]}><Shield color="#ef4444" size={20} /></View>
                <Text style={styles.settingTitle}>Change Password</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          {renderToggle(<Eye color="#6366f1" size={20} />, 'Dark Mode (Beta)', darkMode, setDarkMode)}
        </View>
      </View>

      <Text style={styles.footerText}>Securely synchronized via encrypted ledger nodes.</Text>
    </ScrollView>
  );
};

// Simple platform check for the switch color logic above
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  buttonItem: {
    padding: 16,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 40,
    opacity: 0.6,
  }
});

export default SettingsScreen;
