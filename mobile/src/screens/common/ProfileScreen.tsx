import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { 
  User, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  ChevronRight,
  Bell,
  HelpCircle,
  History,
  Heart,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import * as Storage from '../../utils/storage';
import api from '../../api/client';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ saved: 0, transactions: 0, listings: 0 });

  useEffect(() => {
    const fetchProfileStats = async () => {
        try {
            if (user?.role === 'buyer') {
                const [favs, trans] = await Promise.all([
                    Storage.getItemAsync('favorite_properties'),
                    api.get('transactions/')
                ]);
                setStats({
                    saved: favs ? JSON.parse(favs).length : 0,
                    transactions: trans.data.length,
                    listings: 0
                });
            } else if (user?.role === 'seller') {
                const [props, trans] = await Promise.all([
                    api.get('properties/?seller=me'),
                    api.get('transactions/')
                ]);
                setStats({
                    saved: 0,
                    transactions: trans.data.length,
                    listings: props.data.length
                });
            }
        } catch (e) {
            console.error('Stats error:', e);
        }
    };
    fetchProfileStats();
  }, [user]);

  const handleLogout = () => {
    const confirmLogout = () => {
        logout();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Terminate secure session?')) confirmLogout();
    } else {
      Alert.alert(
        'Terminate Session',
        'Are you sure you want to decouple from the Registry?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: confirmLogout }
        ]
      );
    }
  };

  const renderMenuItem = (icon: React.ReactNode, title: string, subtitle?: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight color="#cbd5e1" size={20} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.full_name || user?.name || 'Inquisitor'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'authenticated-node@domain.com'}</Text>
        
        <View style={styles.roleRow}>
            <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'MEMBER'}</Text>
            </View>
            {user?.role === 'admin' && (
                <View style={[styles.roleBadge, { backgroundColor: '#fee2e2' }]}>
                    <ShieldAlert size={12} color="#ef4444" />
                    <Text style={[styles.roleText, { color: '#ef4444' }]}>SOVEREIGN</Text>
                </View>
            )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asset Portfolio</Text>
        <View style={styles.menuCard}>
          {user?.role === 'buyer' && (
              <>
                {renderMenuItem(<Heart color="#ef4444" size={20} />, 'Saved Collection', `${stats.saved} secure nodes stored`, () => navigation.navigate('Favorites'))}
                {renderMenuItem(<History color="#6366f1" size={20} />, 'Transaction Ledger', `${stats.transactions} verified acquisitions`, () => navigation.navigate('Transactions'))}
              </>
          )}
          {user?.role === 'seller' && (
              <>
                {renderMenuItem(<LayoutDashboard color="#10b981" size={20} />, 'Sales Analytics', 'Performance and node reach', () => navigation.navigate('SellerAnalytics'))}
                {renderMenuItem(<History color="#6366f1" size={20} />, 'Trade Dashboard', `${stats.listings} active assets`, () => navigation.navigate('SellerDashboard'))}
              </>
          )}
          {user?.role === 'admin' && (
              <>
                {renderMenuItem(<ShieldCheck color="#6366f1" size={20} />, 'Registry Management', 'Approve/Reject pending nodes', () => navigation.navigate('PendingProperties'))}
              </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identity & Security</Text>
        <View style={styles.menuCard}>
          {renderMenuItem(<User color="#6366f1" size={20} />, 'Profile Protocols', 'Update name and biometric links', () => navigation.navigate('EditProfile'))}
          {renderMenuItem(
            <ShieldCheck color={user?.kyc_status?.toLowerCase() === 'verified' ? '#10b981' : '#f59e0b'} size={20} />, 
            'Identity Authentication', 
            user?.kyc_status?.toLowerCase() === 'verified' ? 'Protocol Synchronized' : 'KYC Authentication Required',
            () => navigation.navigate('KYC')
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Preferences</Text>
        <View style={styles.menuCard}>
          {renderMenuItem(<Bell color="#f59e0b" size={20} />, 'Alert Pipeline', 'Manage notification triggers', () => navigation.navigate('Notifications'))}
          {renderMenuItem(<Settings color="#64748b" size={20} />, 'Global Settings', 'App security and theme', () => navigation.navigate('Settings'))}
          {renderMenuItem(<HelpCircle color="#3b82f6" size={20} />, 'Technical Support', 'Audit documentation')}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut color="#ef4444" size={20} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Terminate Secure Session</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Registry Prime v1.1.4 — Production Secure</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  header: { alignItems: 'center', padding: 32, paddingTop: 60, backgroundColor: '#fff', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#1e293b', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  avatarContainer: { width: 90, height: 90, borderRadius: 32, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 4, borderColor: '#fff', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#6366f1' },
  userName: { fontSize: 24, fontWeight: '900', color: '#1e293b', marginBottom: 4, letterSpacing: -0.5 },
  userEmail: { fontSize: 14, color: '#64748b', marginBottom: 16, fontWeight: '500' },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, flexDirection: 'row', alignItems: 'center', gap: 6 },
  roleText: { fontSize: 10, fontWeight: '900', color: '#475569', letterSpacing: 1 },
  section: { paddingHorizontal: 24, marginTop: 32 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1.5 },
  menuCard: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  menuSubtitle: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, marginTop: 40, marginBottom: 24, paddingVertical: 18, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { fontSize: 15, fontWeight: '800', color: '#ef4444' },
  versionText: { textAlign: 'center', color: '#cbd5e1', fontSize: 11, fontWeight: '700', marginBottom: 24, letterSpacing: 0.5 }
});

export default ProfileScreen;
