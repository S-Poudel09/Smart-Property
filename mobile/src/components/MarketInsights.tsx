import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { Sparkles, TrendingUp, Target, Calculator, Info } from 'lucide-react-native';
import api from '../api/client';
import { Alert } from '../utils/alert';

const { width } = Dimensions.get('window');

interface MarketInsightsProps {
  propertyId: string;
  currentPrice: number;
}

const MarketInsights: React.FC<MarketInsightsProps> = ({ propertyId, currentPrice }) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState((currentPrice * 0.003).toString());
  const [occupancy, setOccupancy] = useState('95');
  const [annAppreciation, setAnnAppreciation] = useState('8');

  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      const response = await api.post(`/properties/${propertyId}/predict-price/`);
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', 'Market analytics node timeout. Please try again.');
    } finally {
      setIsPredicting(false);
    }
  };

  const calculatedAnnualRent = parseFloat(monthlyRent) * 12 * (parseFloat(occupancy) / 100);
  const grossYield = (calculatedAnnualRent / currentPrice) * 100;
  const totalROI = grossYield + parseFloat(annAppreciation);

  return (
    <View style={styles.container}>
      {/* AI Prediction Card */}
      <View style={styles.card}>
        <View style={styles.header}>
            <View style={styles.headerTitleRow}>
                <Sparkles color="#6366f1" size={22} />
                <Text style={styles.title}>Neural Valuation</Text>
            </View>
            {!prediction && (
                <TouchableOpacity 
                    style={styles.predictBtn} 
                    onPress={handlePredict}
                    disabled={isPredicting}
                >
                    {isPredicting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.predictBtnText}>Initialize Scan</Text>
                    )}
                </TouchableOpacity>
            )}
        </View>

        {prediction ? (
            <View style={styles.predictionBody}>
                <View style={styles.predictionMain}>
                    <Text style={styles.predictionLabel}>Estimated Value</Text>
                    <Text style={styles.predictionValue}>NPR {prediction.estimated_price.toLocaleString()}</Text>
                </View>
                <View style={styles.predictionMetrics}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Confidence</Text>
                        <Text style={styles.metricValue}>{(prediction.confidence * 100).toFixed(0)}% Precise</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Analytic Pulse</Text>
                        <Text style={[styles.metricValue, { color: '#10b981' }]}>STABLE</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setPrediction(null)}>
                    <Text style={styles.resetText}>Refresh Neural Cache</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <Text style={styles.placeholder}>Generate a high-precision market estimate based on current regional telemetry.</Text>
        )}
      </View>

      {/* ROI Calculator Card */}
      <View style={[styles.card, styles.darkCard]}>
        <View style={styles.header}>
            <View style={styles.headerTitleRow}>
                <Calculator color="#10b981" size={22} />
                <Text style={[styles.title, { color: '#fff' }]}>Investment ROI</Text>
            </View>
            <View style={styles.roiBadge}>
                <TrendingUp color="#10b981" size={14} />
                <Text style={styles.roiBadgeText}>{totalROI.toFixed(1)}% ROI</Text>
            </View>
        </View>

        <View style={styles.calcGrid}>
            <View style={styles.inputGroup}>
                <Text style={styles.calcLabel}>Monthly Rent (NPR)</Text>
                <TextInput 
                    style={styles.calcInput}
                    value={monthlyRent}
                    onChangeText={setMonthlyRent}
                    keyboardType="numeric"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.calcLabel}>Occupancy (%)</Text>
                <TextInput 
                    style={styles.calcInput}
                    value={occupancy}
                    onChangeText={setOccupancy}
                    keyboardType="numeric"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                />
            </View>
        </View>

        <View style={styles.roiFooter}>
            <View style={styles.roiMetric}>
                <Text style={styles.roiMetricLabel}>Rental Yield</Text>
                <Text style={styles.roiMetricValue}>{grossYield.toFixed(2)}%</Text>
            </View>
            <View style={styles.roiDivider} />
            <View style={styles.roiMetric}>
                <Text style={styles.roiMetricLabel}>Annual Cash</Text>
                <Text style={styles.roiMetricValue}>NPR {calculatedAnnualRent.toLocaleString()}</Text>
            </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  predictBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  predictBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  placeholder: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  predictionBody: {
    gap: 16,
  },
  predictionMain: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  predictionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6366f1',
  },
  predictionMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
  resetText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  roiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  roiBadgeText: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 13,
  },
  calcGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  calcLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  calcInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  roiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
  },
  roiMetric: {
    flex: 1,
  },
  roiMetricLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  roiMetricValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '800',
    marginTop: 2,
  },
  roiDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 12,
  }
});

export default MarketInsights;
