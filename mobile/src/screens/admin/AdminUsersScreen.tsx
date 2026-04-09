import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  StatusBar
} from 'react-native';
import { 
  Users, 
  Search, 
  Shield, 
  User as UserIcon, 
  Mail, 
  ChevronRight,
  Filter,
  MoreVertical,
  MinusCircle,
  CheckCircle2,
  Trash2,
  Lock,
  ShieldCheck
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/client';

const AdminUsersScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      // Corrected API path to match config/urls.py (api/auth/)
      const response = await api.get('auth/admin/users/');
      setUsers(response.data);
      applyFilters(response.data, searchQuery, activeRoleFilter);
    } catch (error) {
      console.error('Fetch Admin Users Error:', error);
      Alert.alert('System Error', 'Failed to retrieve global user directory.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const applyFilters = (data: any[], query: string, role: string) => {
    let result = data;
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(u => 
        u.name?.toLowerCase().includes(q) || 
        u.email?.toLowerCase().includes(q)
      );
    }
    
    if (role !== 'all') {
      result = result.filter(u => u.role?.toLowerCase() === role.toLowerCase());
    }
    
    setFilteredUsers(result);
  };

  useEffect(() => {
    applyFilters(users, searchQuery, activeRoleFilter);
  }, [searchQuery, activeRoleFilter, users]);

  const handleDeleteUser = (user: any) => {
    Alert.alert(
      'VOID IDENTITY NODE',
      `Are you ABSOLUTELY sure you want to terminate access for ${user.name || user.email}?\n\nThis will remove their profile from the active registry.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'TERMINATE', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Admin delete based on UserManagementViewSet (ModelViewSet)
              await api.delete(`auth/admin/users/${user.id}/`);
              Alert.alert('Consensus Achieved', 'Identity node removed from registry.');
              fetchUsers(); // Refresh list
            } catch (error: any) {
              const msg = error.response?.data?.error || 'Node termination failed due to systemic constraints.';
              Alert.alert('Protocol Error', msg);
            }
          }
        }
      ]
    );
  };

  const handleUserAction = (user: any) => {
    Alert.alert(
      'GOVERNANCE OVERRIDE',
      `Modify privileges for ${user.name || user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'VIEW NODE', 
          onPress: () => {
            Alert.alert('Identity Data', `Node ID: ${user.id}\nEmail: ${user.email}\nStatus: ${user.is_verified ? 'Verified' : 'Unverified'}`);
          }
        },
        { 
          text: 'VOID ACCESS', 
          style: 'destructive',
          onPress: () => handleDeleteUser(user)
        }
      ]
    );
  };

  const renderUserItem = ({ item }: any) => (
    <View style={styles.userCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <UserIcon color="#6366f1" size={24} />
        </View>
        <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name || 'Anonymous Node'}</Text>
            <Text style={styles.userId}>UID: {item.id?.toString().padStart(4, '0')}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? '#eef2ff' : '#f0fdf4' }]}>
            <Shield color={item.role === 'admin' ? '#6366f1' : '#10b981'} size={12} />
            <Text style={[styles.roleBadgeText, { color: item.role === 'admin' ? '#6366f1' : '#10b981' }]}>
                {item.role?.toUpperCase() || 'BUYER'}
            </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
              <Mail color="#94a3b8" size={14} />
              <Text style={styles.detailText}>{item.email}</Text>
          </View>
          <View style={styles.detailRow}>
              <ShieldCheck color={item.is_verified ? '#10b981' : '#f59e0b'} size={14} />
              <Text style={[styles.detailText, { color: item.is_verified ? '#10b981' : '#f59e0b' }]}>
                  {item.is_verified ? 'Identity Verified' : 'Awaiting Proof'}
              </Text>
          </View>
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={() => handleUserAction(item)}>
          <Text style={styles.actionBtnText}>MANAGE PRIVILEGES</Text>
          <ChevronRight color="#6366f1" size={16} />
      </TouchableOpacity>
    </View>
  );

  const RoleTab = ({ id, label }: any) => (
    <TouchableOpacity 
      style={[styles.roleTab, activeRoleFilter === id && styles.activeRoleTab]}
      onPress={() => setActiveRoleFilter(id)}
    >
      <Text style={[styles.roleTabText, activeRoleFilter === id && styles.activeRoleTabText]}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Accessing User Directory...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.header, { zIndex: 100 }]}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
                 <ChevronRight color="#1e293b" size={24} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Users color="#1e293b" size={28} />
            <View style={styles.headerText}>
                <Text style={styles.title}>System Users</Text>
                <Text style={styles.subtitle}>{users.length} identity nodes registered</Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search color="#94a3b8" size={20} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by name or email..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.tabScrollContainer}>
              <RoleTab id="all" label="All Nodes" />
              <RoleTab id="buyer" label="Buyers" />
              <RoleTab id="seller" label="Sellers" />
              <RoleTab id="admin" label="Admins" />
          </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Lock color="#cbd5e1" size={80} />
            <Text style={styles.emptyText}>No Identity Matches</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or role parameters.</Text>
          </View>
        }
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 10,
    fontWeight: '900',
    color: '#6366f1',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerText: {
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  tabScrollContainer: {
      flexDirection: 'row',
      marginTop: 20,
      gap: 8,
  },
  roleTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 100,
      backgroundColor: '#f1f5f9',
  },
  activeRoleTab: {
      backgroundColor: '#1e293b',
  },
  roleTabText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#94a3b8',
  },
  activeRoleTabText: {
      color: '#fff',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: '#eff6ff',
      justifyContent: 'center',
      alignItems: 'center',
  },
  userInfo: {
      flex: 1,
      marginLeft: 16,
  },
  userName: {
      fontSize: 17,
      fontWeight: '800',
      color: '#1e293b',
  },
  userId: {
      fontSize: 11,
      color: '#94a3b8',
      fontWeight: '600',
      marginTop: 2,
  },
  roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      gap: 6,
  },
  roleBadgeText: {
      fontSize: 10,
      fontWeight: '900',
  },
  cardDivider: {
      height: 1,
      backgroundColor: '#f8fafc',
      marginVertical: 16,
  },
  cardDetails: {
      gap: 8,
  },
  detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  detailText: {
      fontSize: 13,
      color: '#64748b',
      fontWeight: '500',
  },
  actionBtn: {
      marginTop: 20,
      height: 48,
      backgroundColor: '#f8fafc',
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: '#f1f5f9',
  },
  actionBtnText: {
      fontSize: 12,
      fontWeight: '900',
      color: '#6366f1',
      letterSpacing: 1,
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 80,
  },
  emptyText: {
      fontSize: 20,
      fontWeight: '900',
      color: '#1e293b',
      marginTop: 24,
  },
  emptySubtext: {
      fontSize: 14,
      color: '#94a3b8',
      marginTop: 8,
      textAlign: 'center',
      paddingHorizontal: 40,
  },
});

export default AdminUsersScreen;
