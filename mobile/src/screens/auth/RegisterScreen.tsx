import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { UserPlus, Mail, Lock, User, UserCheck } from 'lucide-react-native';
import api from '../../api/client';
import { Alert } from '../../utils/alert';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Backend expects 'name' which is mapped to 'full_name' in serializer
      await api.post('/auth/register/', { 
        name, 
        email, 
        password, 
        role 
      });
      
      Alert.alert(
        'Registration Success', 
        'Please verify your email with the OTP sent.',
        [{ text: 'OK', onPress: () => navigation.navigate('OTP', { email, flow: 'register' }) }]
      );
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      const errors = error.response?.data;
      let message = 'Registration failed. Please try again.';
      
      if (errors) {
        if (typeof errors === 'object') {
          message = Object.values(errors).flat().join('\n');
        } else {
          message = errors.detail || errors.error || message;
        }
      }
      
      Alert.alert('Registration Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <UserPlus color="#fff" size={32} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Smart Property today</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.roleSelection}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'buyer' && styles.roleButtonActive]}
              onPress={() => setRole('buyer')}
            >
              <User color={role === 'buyer' ? '#fff' : '#64748b'} size={20} />
              <Text style={[styles.roleButtonText, role === 'buyer' && styles.roleButtonTextActive]}>Buyer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'seller' && styles.roleButtonActive]}
              onPress={() => setRole('seller')}
            >
              <UserCheck color={role === 'seller' ? '#fff' : '#64748b'} size={20} />
              <Text style={[styles.roleButtonText, role === 'seller' && styles.roleButtonTextActive]}>Seller</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User color="#94a3b8" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail color="#94a3b8" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock color="#94a3b8" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Register Now</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  roleSelection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#f8fafc',
  },
  roleButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  registerButton: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  footerLink: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
