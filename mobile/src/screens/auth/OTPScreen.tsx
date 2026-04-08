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
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/alert';

const OTPScreen = ({ navigation, route }: any) => {
  const { login } = useAuth();
  const { email, flow } = route.params;
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      if (flow === 'login') {
        const response = await api.post('/auth/admin-login-verify/', { email, otp_code: otpCode });
        const { access, user } = response.data;
        await login(access, user);
      } else {
        await api.post('/auth/verify-otp/', { email, otp_code: otpCode });
        Alert.alert(
          'Success', 
          'Email verified successfully. You can now log in.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error: any) {
      console.error('OTP error:', error.response?.data || error.message);
      const message = error.response?.data?.error || error.response?.data?.detail || 'Verification failed. Please check the code.';
      Alert.alert('Verification Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const endpoint = flow === 'login' ? '/auth/admin-login-resend/' : '/auth/resend-otp/';
      await api.post(endpoint, { email });
      Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to resend code');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <ShieldCheck color="#fff" size={32} />
          </View>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>Enter 6-digit code sent to {email}</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              autoFocus
            />
          </View>

          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendLink} onPress={handleResend}>
            <Text style={styles.resendText}>Didn't receive code? Resend</Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 20,
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
    textAlign: 'center',
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
  inputGroup: {
    marginBottom: 32,
  },
  otpInput: {
    height: 64,
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OTPScreen;
