import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { UIVehicle } from '../../services/vehicleService';

interface FeaturesCardProps {
  vehicle: UIVehicle;
}

const FeaturesCard: React.FC<FeaturesCardProps> = ({ vehicle }) => {
  const renderFeature = (feature: string, index: number) => (
    <View key={index} style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
      <Text style={styles.featureText} numberOfLines={1}>{feature}</Text>
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
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    width: '48%',
    paddingVertical: SPACING.xs,
  },
  featureText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
});

export default FeaturesCard;
