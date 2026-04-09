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
      <View style={styles.topDecoration} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <UserPlus color="#fff" size={32} />
            </View>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>ENROLLMENT PHASE</Text>
            </View>
          </View>
          <Text style={styles.title}>Forge Identity</Text>
          <Text style={styles.subtitle}>Join the premium real estate network</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.roleSelection}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'buyer' && styles.roleButtonActive]}
              onPress={() => setRole('buyer')}
            >
              <User color={role === 'buyer' ? '#fff' : '#6366f1'} size={20} />
              <Text style={[styles.roleButtonText, role === 'buyer' && styles.roleButtonTextActive]}>Buyer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'seller' && styles.roleButtonActive]}
              onPress={() => setRole('seller')}
            >
              <UserCheck color={role === 'seller' ? '#fff' : '#6366f1'} size={20} />
              <Text style={[styles.roleButtonText, role === 'seller' && styles.roleButtonTextActive]}>Seller</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Legal Name</Text>
            <View style={styles.inputContainer}>
              <User color="#6366f1" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Alexander Pierce"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registry Email</Text>
            <View style={styles.inputContainer}>
              <Mail color="#6366f1" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@domain.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Security Phrase (Password)</Text>
            <View style={styles.inputContainer}>
              <Lock color="#6366f1" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.registerButtonText}>Initialize Account</Text>
                <UserPlus color="#fff" size={20} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already in the Registry? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Initialize Session</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomHud}>
          <Text style={styles.hudText}>IMPERIAL GUARD ACTIVE</Text>
          <View style={styles.dot} />
          <Text style={styles.hudText}>256-BIT ENCRYPTION</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topDecoration: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    transform: [{ rotate: '5deg' }],
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6366f1',
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleSelection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    gap: 8,
    backgroundColor: '#0f172a',
  },
  roleButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94a3b8',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6366f1',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: '#0f172a',
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#6366f1',
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  footerLink: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 12,
    marginBottom: 40,
  },
  hudText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
});

export default RegisterScreen;
