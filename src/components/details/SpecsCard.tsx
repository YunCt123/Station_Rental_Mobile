import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { Vehicle } from '../../services';

interface SpecsCardProps {
  vehicle: Vehicle;
}

const SpecsCard: React.FC<SpecsCardProps> = ({ vehicle }) => {
  const specs = [
    { label: 'Năm sản xuất', value: vehicle.year?.toString(), icon: 'calendar-outline' },
    { label: 'Số ghế', value: `${vehicle.seats || 2}`, icon: 'people-outline' },
    { label: 'Phạm vi', value: `${vehicle.range || 0} km`, icon: 'speedometer-outline' },
    { label: 'Mức pin', value: `${vehicle.batteryLevel || 0}%`, icon: 'battery-half-outline' },
    { label: 'Tình trạng', value: vehicle.condition || 'excellent', icon: 'construct-outline' },
    { label: 'Quãng đường', value: `${vehicle.mileage || 0} km`, icon: 'car-outline' },
    { label: 'Tiêu thụ', value: `${vehicle.consumption_wh_per_km || 0} Wh/km`, icon: 'flash-outline' },
  ];

  const renderSpec = (item: typeof specs[number], index: number) => (
    <View key={index} style={styles.specItem}>
      <View style={styles.specIconContainer}>
        <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
      </View>
      <View style={styles.specInfo}>
        <Text style={styles.specLabel} numberOfLines={1}>{item.label}</Text>
        <Text style={styles.specValue} numberOfLines={1}>{item.value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
      <View style={styles.specsContainer}>
        {specs.map(renderSpec)}
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
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    width: '48%',
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
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  specValue: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default SpecsCard;
