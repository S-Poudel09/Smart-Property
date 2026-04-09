import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Keys that MUST be stored securely (secrets/tokens)
const SECURE_KEYS = ['userToken'];

export const setItemAsync = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return;
  }

  if (SECURE_KEYS.includes(key)) {
    // Secret tokens stay in SecureStore
    await SecureStore.setItemAsync(key, value);
  } else {
    // Large or non-sensitive data goes to AsyncStorage (bypassing 2048 byte limit)
    await AsyncStorage.setItem(key, value);
  }
};

export const getItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
      return null;
    }
  }

  if (SECURE_KEYS.includes(key)) {
    return await SecureStore.getItemAsync(key);
  } else {
    // Try AsyncStorage first
    let val = await AsyncStorage.getItem(key);
    // FALLBACK: Migration check. If we just moved this key to AsyncStorage, 
    // it might still be in SecureStore.
    if (val === null) {
      val = await SecureStore.getItemAsync(key);
      if (val !== null) {
        // Migrate to AsyncStorage for future use
        await AsyncStorage.setItem(key, val);
        await SecureStore.deleteItemAsync(key);
      }
    }
    return val;
  }
};

export const deleteItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return;
  }

  if (SECURE_KEYS.includes(key)) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
    // Cleanup SecureStore just in case of old data
    await SecureStore.deleteItemAsync(key);
  }
};
