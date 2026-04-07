import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { Calculator, Banknote, Briefcase, Info } from 'lucide-react-native';
import { Alert } from '../../utils/alert';

const { width } = Dimensions.get('window');

const LoanCalculatorScreen = ({ route }: any) => {
  const propertyPrice = route.params?.price || 5000000;
  const [amount, setAmount] = useState(propertyPrice.toString());
  const [tenure, setTenure] = useState('20');
  const [rate, setRate] = useState('11.5');
  const [emi, setEmi] = useState(0);

  useEffect(() => {
    calculateEMI();
  }, [amount, tenure, rate]);

  const calculateEMI = () => {
    const p = parseFloat(amount);
    const r = parseFloat(rate) / (12 * 100);
    const n = parseFloat(tenure) * 12;

    if (p && r && n) {
        const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setEmi(Math.round(emiValue));
    }
  };

  const handleApply = () => {
      Alert.alert('Liquidity Analysis', 'Your financial node has been synchronized with the nearest banking cluster. A verification envoy will contact you shortly.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Banknote color="#6366f1" size={48} style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Liquidity Analysis</Text>
        <Text style={styles.subtitle}>Calculate your EMI and institutional financing eligibility.</Text>
      </View>

      <View style={styles.emiCard}>
          <Text style={styles.emiLabel}>Estimated Monthly EMI</Text>
          <Text style={styles.emiValue}>NPR {emi.toLocaleString()}</Text>
          <View style={styles.emiDivider} />
          <View style={styles.emiFooter}>
            <View style={styles.emiFooterItem}>
                <Text style={styles.emiFooterLabel}>Total Interest</Text>
                <Text style={styles.emiFooterValue}>NPR {((emi * parseFloat(tenure) * 12) - parseFloat(amount)).toLocaleString()}</Text>
            </View>
          </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Principal Amount (NPR)</Text>
            <TextInput 
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
            />
        </View>

        <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Tenure (Years)</Text>
                <TextInput 
                    style={styles.input}
                    value={tenure}
                    onChangeText={setTenure}
                    keyboardType="numeric"
                />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Interest Rate (%)</Text>
                <TextInput 
                    style={styles.input}
                    value={rate}
                    onChangeText={setRate}
                    keyboardType="numeric"
                />
            </View>
        </View>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Briefcase color="#fff" size={20} />
            <Text style={styles.applyText}>Initialize Financing Protocol</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Info color="#64748b" size={18} />
        <Text style={styles.infoText}>Actual interest rates and eligibility are subject to registry audit and institutional policies.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  emiCard: {
    backgroundColor: '#1e293b',
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#1e293b',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  emiLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  emiValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
  },
  emiDivider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  emiFooter: {
    width: '100%',
  },
  emiFooterItem: {
    alignItems: 'center',
  },
  emiFooterLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  emiFooterValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  applyButton: {
    backgroundColor: '#6366f1',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  infoCard: {
      flexDirection: 'row',
      backgroundColor: '#f1f5f9',
      padding: 16,
      borderRadius: 16,
      gap: 12,
      marginTop: 40,
  },
  infoText: {
      flex: 1,
      fontSize: 12,
      color: '#64748b',
      fontStyle: 'italic',
      lineHeight: 18,
  }
});

export default LoanCalculatorScreen;
