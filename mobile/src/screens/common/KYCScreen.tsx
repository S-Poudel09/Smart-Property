import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, FileText, CheckCircle, Shield, Upload, X, Clock } from 'lucide-react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const KYCScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [documentType, setDocumentType] = useState<'citizenship' | 'passport' | 'pan'>('citizenship');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already pending or verified, show status
  if (user?.kyc_status === 'pending' || user?.kyc_status === 'verified') {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
              <View style={[styles.statusIconBg, { backgroundColor: user.kyc_status === 'verified' ? '#ecfdf5' : '#fffbeb' }]}>
                {user.kyc_status === 'verified' ? <CheckCircle color="#10b981" size={60} /> : <Clock color="#f59e0b" size={60} />}
              </View>
              <Text style={styles.title}>{user.kyc_status === 'verified' ? 'Identity Verified' : 'Verification Pending'}</Text>
              <Text style={styles.subtitle}>
                  {user.kyc_status === 'verified' 
                    ? 'Your node identity is fully synchronized and verified on the registry.' 
                    : 'Your documents are being audited by human agents. This usually takes 24-48 hours.'}
              </Text>
              <TouchableOpacity style={[styles.submitButton, { marginTop: 40, width: '100%' }]} onPress={() => navigation.goBack()}>
                  <Text style={styles.submitButtonText}>Return to Command</Text>
              </TouchableOpacity>
          </View>
      );
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your media library to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Incomplete', 'Please select a document image to upload.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('document_type', documentType);
      
      const filename = image.split('/').pop() || 'document.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('identity_document', {
        uri: image,
        name: filename,
        type,
      } as any);

      await api.post('/auth/kyc/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'KYC documents submitted successfully. Status is now pending.');
      
      // Update local user state
      if (user) {
        updateUser({ 
          ...user, 
          kyc_status: 'pending' as any 
        });
      }
      
      navigation.goBack();
    } catch (error: any) {
      console.error('KYC Upload Error:', error.response?.data || error.message);
      Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Shield color="#6366f1" size={48} />
        <Text style={styles.title}>Identity Verification</Text>
        <Text style={styles.subtitle}>Upload your documents to unlock full platform features</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Document Type</Text>
        <View style={styles.typeContainer}>
          {(['citizenship', 'passport', 'pan'] as const).map((type) => (
            <TouchableOpacity 
              key={type}
              style={[styles.typeButton, documentType === type && styles.typeButtonActive]}
              onPress={() => setDocumentType(type)}
            >
              <Text style={[styles.typeText, documentType === type && styles.typeTextActive]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.label}>Document Image</Text>
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage}>
            <Upload color="#94a3b8" size={32} />
            <Text style={styles.uploadPlaceholderText}>Tap to select document image</Text>
            <Text style={styles.uploadSubtext}>JPG or PNG (max 5MB)</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoBox}>
        <FileText color="#6366f1" size={20} />
        <Text style={styles.infoText}>
          Make sure the document is clearly visible and all details are readable. 
          Verification usually takes 24-48 hours.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, (!image || isSubmitting) && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={!image || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <CheckCircle color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>Submit for Verification</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  content: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40, // Increased for reachability
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  typeTextActive: {
    color: '#fff',
  },
  uploadSection: {
    marginBottom: 32,
  },
  uploadPlaceholder: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  imagePreviewContainer: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default KYCScreen;
