import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { User, Mail, Phone, Shield } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/alert';
import api from '../../api/client';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      // Backend update profile
      const response = await api.put('auth/profile/update/', { 
        full_name: name,
        phone: phone 
      });
      
      const updatedUser = { 
        ...user!, 
        name: response.data.full_name,
        phone: response.data.phone 
      };
      
      updateUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile. Using local update.');
      // Fallback for demo
      updateUser({ ...user!, name, phone });
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.headerSubtitle}>Manage your personal information</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <User color="#64748b" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputContainer, styles.disabledInput]}>
            <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: '#94a3b8' }]}
              value={user?.email}
              editable={false}
            />
          </View>
          <Text style={styles.inputHint}>Email cannot be changed for security.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Phone color="#64748b" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+977 98XXXXXXXX"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Role</Text>
          <View style={[styles.inputContainer, styles.disabledInput]}>
            <Shield color="#94a3b8" size={20} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: '#94a3b8' }]}
              value={user?.role?.toUpperCase()}
              editable={false}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#f8fafc',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    borderColor: '#f1f5f9',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  inputHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  }
});

export default EditProfileScreen;
