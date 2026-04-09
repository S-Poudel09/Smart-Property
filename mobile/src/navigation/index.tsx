import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Platform } from 'react-native';
import { 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  LayoutDashboard, 
  PlusCircle, 
  Bell, 
  Building2,
  Heart,
  History
} from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';

import BuyerHomeScreen from '../screens/buyer/HomeScreen';
import PropertyListScreen from '../screens/buyer/PropertyListScreen';
import FavoritesScreen from '../screens/buyer/FavoritesScreen';
import TransactionsScreen from '../screens/buyer/TransactionsScreen';
import PropertyDetailScreen from '../screens/common/PropertyDetailScreen';
import ChatListScreen from '../screens/common/ChatListScreen';
import ChatDetailScreen from '../screens/common/ChatDetailScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import Mobile3DViewerScreen from '../screens/common/Mobile3DViewerScreen';
import KhaltiPaymentScreen from '../screens/common/KhaltiPaymentScreen';
import MapExplorerScreen from '../screens/buyer/MapExplorerScreen';

import SellerDashboardScreen from '../screens/seller/DashboardScreen';
import MyListingsScreen from '../screens/seller/MyListingsScreen';
import AddListingScreen from '../screens/seller/AddListingScreen';
import SellerAnalyticsScreen from '../screens/seller/SellerAnalyticsScreen';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminRegistryScreen from '../screens/admin/AdminRegistryScreen';
import AdminPropertyDetailScreen from '../screens/admin/AdminPropertyDetailScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import KYCScreen from '../screens/common/KYCScreen';

import EditProfileScreen from '../screens/common/EditProfileScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import LoanCalculatorScreen from '../screens/buyer/LoanCalculatorScreen';

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const BuyerTabs = createBottomTabNavigator();
const SellerTabs = createBottomTabNavigator();
const AdminTabs = createBottomTabNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="OTP" component={OTPScreen} />
  </AuthStack.Navigator>
);

const BuyerTabNavigator = () => (
  <BuyerTabs.Navigator screenOptions={{ 
    tabBarActiveTintColor: '#6366f1',
    tabBarInactiveTintColor: '#94a3b8',
    tabBarStyle: { height: Platform.OS === 'ios' ? 88 : 68, paddingBottom: Platform.OS === 'ios' ? 30 : 12, paddingTop: 12 },
    headerStyle: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitleStyle: { fontWeight: '800', color: '#1e293b' }
  }}>
    <BuyerTabs.Screen 
      name="BuyerHome" 
      component={BuyerHomeScreen} 
      options={{ 
        title: 'Dashboard', 
        headerShown: false,
        tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> 
      }} 
    />
    <BuyerTabs.Screen 
      name="Browse" 
      component={PropertyListScreen} 
      options={{ 
        title: 'Browse', 
        tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> 
      }} 
    />
    <BuyerTabs.Screen 
      name="Favorites" 
      component={FavoritesScreen} 
      options={{ 
        title: 'Collection', 
        tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> 
      }} 
    />
    <BuyerTabs.Screen 
      name="Transactions" 
      component={TransactionsScreen} 
      options={{ 
        title: 'Ledger', 
        tabBarIcon: ({ color, size }) => <History color={color} size={size} /> 
      }} 
    />
    <BuyerTabs.Screen 
      name="Messages" 
      component={ChatListScreen} 
      options={{ 
        title: 'Comms', 
        tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> 
      }} 
    />
    <BuyerTabs.Screen 
      name="CommonProfile" 
      component={ProfileScreen} 
      options={{ 
        title: 'Identity', 
        tabBarIcon: ({ color, size }) => <User color={color} size={size} /> 
      }} 
    />
  </BuyerTabs.Navigator>
);

const SellerTabNavigator = () => (
  <SellerTabs.Navigator screenOptions={{ 
    tabBarActiveTintColor: '#6366f1',
    tabBarInactiveTintColor: '#94a3b8',
    tabBarStyle: { height: Platform.OS === 'ios' ? 88 : 68, paddingBottom: Platform.OS === 'ios' ? 30 : 12, paddingTop: 12 },
    headerShown: false
  }}>
    <SellerTabs.Screen name="SellerDashboard" component={SellerDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
    <SellerTabs.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'Portfolios', tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }} />
    <SellerTabs.Screen name="AddListing" component={AddListingScreen} options={{ title: 'Inject', tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} /> }} />
    <SellerTabs.Screen name="Messages" component={ChatListScreen} options={{ title: 'Comms', tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }} />
    <SellerTabs.Screen name="SellerProfile" component={ProfileScreen} options={{ title: 'Node', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
  </SellerTabs.Navigator>
);

const AdminTabNavigator = () => (
  <AdminTabs.Navigator screenOptions={{ 
    tabBarActiveTintColor: '#6366f1',
    tabBarInactiveTintColor: '#94a3b8',
    tabBarStyle: { height: Platform.OS === 'ios' ? 88 : 68, paddingBottom: Platform.OS === 'ios' ? 30 : 12, paddingTop: 12 },
  }}>
    <AdminTabs.Screen name="AdminHome" component={AdminDashboardScreen} options={{ title: 'Nexus', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
    <AdminTabs.Screen name="AdminApprovals" component={AdminRegistryScreen} options={{ title: 'Registry', tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} /> }} />
    <AdminTabs.Screen name="Messages" component={ChatListScreen} options={{ title: 'Comms', tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }} />
    <AdminTabs.Screen name="AdminProfile" component={ProfileScreen} options={{ title: 'Sovereign', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
  </AdminTabs.Navigator>
);

const MainNavigator = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'admin': return <AdminTabNavigator />;
    case 'seller': return <SellerTabNavigator />;
    default: return <BuyerTabNavigator />;
  }
};

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ headerShown: false }} />
            <RootStack.Screen name="AdminPropertyDetail" component={AdminPropertyDetailScreen} options={{ headerShown: false }} />
            <RootStack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ headerShown: false }} />
            <RootStack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: 'Secure Channel', headerShown: true }} />
            <RootStack.Screen name="Mobile3DViewer" component={Mobile3DViewerScreen} />
            <RootStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Update Identity', headerShown: true }} />
            <RootStack.Screen name="KYC" component={KYCScreen} options={{ title: 'Protocol Verification', headerShown: true }} />
            <RootStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Alert Pipeline', headerShown: true }} />
            <RootStack.Screen name="SellerAnalytics" component={SellerAnalyticsScreen} options={{ title: 'KPI Hub', headerShown: true }} />
            <RootStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'System Config', headerShown: true }} />
            <RootStack.Screen name="LoanCalculator" component={LoanCalculatorScreen} options={{ title: 'Financial Projection', headerShown: true }} />
            <RootStack.Screen name="KhaltiPayment" component={KhaltiPaymentScreen} />
            <RootStack.Screen name="MapExplorer" component={MapExplorerScreen} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
