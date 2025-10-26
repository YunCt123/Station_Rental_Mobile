import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { UIVehicle } from '../../services/vehicleService';

interface DescriptionCardProps {
  vehicle: UIVehicle;
}

const DescriptionCard: React.FC<DescriptionCardProps> = ({ vehicle }) => {
  if (!vehicle.description) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Mô tả</Text>
      <View style={styles.descriptionContainer}>
        <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
        <Text style={styles.description}>{vehicle.description}</Text>
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
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  description: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.black,
    lineHeight: 20,
  },
});

export default DescriptionCard;
