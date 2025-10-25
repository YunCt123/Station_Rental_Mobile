import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { VehicleData } from '../../data/vehicles';

interface FeaturesCardProps {
  vehicle: VehicleData;
}

const FeaturesCard: React.FC<FeaturesCardProps> = ({ vehicle }) => {
  const renderFeature = (feature: string, index: number) => (
    <View key={index} style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  if (!vehicle.features || vehicle.features.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Tính năng</Text>
      <View style={styles.featuresContainer}>
        {vehicle.features.map(renderFeature)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  featuresContainer: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
});

export default FeaturesCard;
