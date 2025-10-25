import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { VehicleData } from '../../data/vehicles';

interface SpecsCardProps {
  vehicle: VehicleData;
}

const SpecsCard: React.FC<SpecsCardProps> = ({ vehicle }) => {
  const renderSpec = ([key, value]: [string, string], index: number) => (
    <View key={index} style={styles.specItem}>
      <View style={styles.specIconContainer}>
        <Ionicons name="settings-outline" size={16} color={COLORS.primary} />
      </View>
      <View style={styles.specInfo}>
        <Text style={styles.specLabel}>{key}</Text>
        <Text style={styles.specValue}>{value}</Text>
      </View>
    </View>
  );

  if (!vehicle.specs || Object.keys(vehicle.specs).length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
      <View style={styles.specsContainer}>
        {Object.entries(vehicle.specs).map(renderSpec)}
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
  specsContainer: {
    gap: SPACING.md,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  specIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specInfo: {
    flex: 1,
  },
  specLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  specValue: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default SpecsCard;
