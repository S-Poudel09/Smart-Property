import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Home, Search, MessageSquare, User, LayoutDashboard, PlusCircle, Bell, Building2 } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';

import BuyerHomeScreen from '../screens/buyer/HomeScreen';
import PropertyListScreen from '../screens/buyer/PropertyListScreen';
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
import PendingPropertiesScreen from '../screens/admin/PendingPropertiesScreen';
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
    headerStyle: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitleStyle: { fontWeight: '600' }
  }}>
    <BuyerTabs.Screen 
      name="BuyerHome" 
      component={BuyerHomeScreen} 
      options={{ 
        title: 'Home', 
        tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> 
      }} 
    />
    <BuyerTabs.Screen 
      name="Browse" 
      component={PropertyListScreen} 
      options={{ 
        title: 'Search', 
        tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> 
      }} 
    />
    <BuyerTabs.Screen 
      name="Messages" 
      component={ChatListScreen} 
      options={{ 
        title: 'Chat', 
        tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> 
      }} 
    />
    <BuyerTabs.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ 
        title: 'Profile', 
        tabBarIcon: ({ color, size }) => <User color={color} size={size} /> 
      }} 
    />
  </BuyerTabs.Navigator>
);

const SellerTabNavigator = () => (
  <SellerTabs.Navigator screenOptions={{ 
    tabBarActiveTintColor: '#6366f1',
    tabBarInactiveTintColor: '#94a3b8',
  }}>
    <SellerTabs.Screen 
      name="SellerDashboard" 
      component={SellerDashboardScreen} 
      options={{ 
        title: 'Dashboard', 
        tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> 
      }} 
    />
    <SellerTabs.Screen 
      name="MyListings" 
      component={MyListingsScreen} 
      options={{ 
        title: 'Listings', 
        tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> 
      }} 
    />
    <SellerTabs.Screen 
      name="AddListing" 
      component={AddListingScreen} 
      options={{ 
        title: 'Add', 
        tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} /> 
      }} 
    />
    <SellerTabs.Screen 
      name="Messages" 
      component={ChatListScreen} 
      options={{ 
        title: 'Chat', 
        tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> 
      }} 
    />
    <SellerTabs.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ 
        title: 'Profile', 
        tabBarIcon: ({ color, size }) => <User color={color} size={size} /> 
      }} 
    />
  </SellerTabs.Navigator>
);

const AdminTabNavigator = () => (
  <AdminTabs.Navigator screenOptions={{ 
    tabBarActiveTintColor: '#6366f1',
    tabBarInactiveTintColor: '#94a3b8',
    headerStyle: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitleStyle: { fontWeight: '700' }
  }}>
    <AdminTabs.Screen 
      name="AdminHome" 
      component={AdminDashboardScreen} 
      options={{ 
        title: 'Overlord', 
        tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> 
      }} 
    />
    <AdminTabs.Screen 
      name="AdminApprovals" 
      component={PendingPropertiesScreen} 
      options={{ 
        title: 'Registry', 
        tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} /> 
      }} 
    />
    <AdminTabs.Screen 
      name="AdminMessages" 
      component={ChatListScreen} 
      options={{ 
        title: 'Comms', 
        tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> 
      }} 
    />
    <AdminTabs.Screen 
      name="AdminProfile" 
      component={ProfileScreen} 
      options={{ 
        title: 'Profile', 
        tabBarIcon: ({ color, size }) => <User color={color} size={size} /> 
      }} 
    />
  </AdminTabs.Navigator>
);

// Must be a proper named component (PascalCase) for React Navigation
const MainNavigator = ({ route }: any) => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'admin':
      return <AdminTabNavigator />;
    case 'seller':
      return <SellerTabNavigator />;
    default:
      return <BuyerTabNavigator />;
  }
};

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
            <RootStack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ headerShown: true, title: 'Property Detail' }} />
            <RootStack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: true, title: 'Chat' }} />
            <RootStack.Screen name="Mobile3DViewer" component={Mobile3DViewerScreen} options={({ route }: any) => ({ headerShown: true, title: route.params?.title || '3D Virtual Tour' })} />
            <RootStack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} />
            <RootStack.Screen name="KYC" component={KYCScreen} options={{ headerShown: true, title: 'Identity Verification' }} />
            <RootStack.Screen name="PendingProperties" component={PendingPropertiesScreen} options={{ headerShown: true, title: 'Registry Review' }} />
            <RootStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }} />
            <RootStack.Screen name="SellerAnalytics" component={SellerAnalyticsScreen} options={{ headerShown: true, title: 'Performance Hub' }} />
            <RootStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Preferences' }} />
            <RootStack.Screen name="LoanCalculator" component={LoanCalculatorScreen} options={{ headerShown: true, title: 'Liquidity Analysis' }} />
            <RootStack.Screen name="KhaltiPayment" component={KhaltiPaymentScreen} options={{ headerShown: false }} />
            <RootStack.Screen name="MapExplorer" component={MapExplorerScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
