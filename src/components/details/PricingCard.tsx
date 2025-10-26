import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { Vehicle } from '../../services';

interface PricingCardProps {
  vehicle: Vehicle;
}

const PricingCard: React.FC<PricingCardProps> = ({ vehicle }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Giá thuê</Text>
      
      <View style={styles.priceContainer}>
        <View style={styles.priceItem}>
          <View style={styles.priceIconContainer}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Giá theo giờ</Text>
            <Text style={styles.priceValue}>
              {vehicle.pricePerHour.toLocaleString()}$/h
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.priceItem}>
          <View style={styles.priceIconContainer}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Giá theo ngày</Text>
            <Text style={styles.priceValue}>
              {vehicle.pricePerDay.toLocaleString()}$/ngày
            </Text>
          </View>
        </View>
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
  priceContainer: {
    gap: SPACING.sm,
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  priceValue: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});

export default PricingCard;
