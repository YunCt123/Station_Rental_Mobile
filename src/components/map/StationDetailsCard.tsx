import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Station } from '../../types/station';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface StationDetailsCardProps {
  station: Station;
  onClose: () => void;
}

const StationDetailsCard: React.FC<StationDetailsCardProps> = ({
  station,
  onClose,
}) => {
  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return COLORS.error;
    if (rate >= 60) return COLORS.warning;
    return COLORS.success;
  };

  const getAvailabilityPercentage = () => {
    if (station.metrics.vehicles_total === 0) return 0;
    return (station.metrics.vehicles_available / station.metrics.vehicles_total) * 100;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{station.name}</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Address */}
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={18} color={COLORS.primary} />
        <Text style={styles.infoText}>{station.address}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="business-outline" size={18} color={COLORS.primary} />
        <Text style={styles.infoText}>{station.city}</Text>
      </View>

      {/* Metrics Section */}
      <View style={styles.metricsContainer}>
        <Text style={styles.metricsTitle}>Thống kê trạm</Text>
        
        {/* Vehicles Grid */}
        <View style={styles.metricsGrid}>
          {/* Total Vehicles */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="car-sport-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.metricValue}>{station.metrics.vehicles_total}</Text>
            <Text style={styles.metricLabel}>Tổng số xe</Text>
          </View>

          {/* Available Vehicles */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            </View>
            <Text style={[styles.metricValue, { color: COLORS.success }]}>
              {station.metrics.vehicles_available}
            </Text>
            <Text style={styles.metricLabel}>Xe sẵn sàng</Text>
          </View>

          {/* In Use Vehicles */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: COLORS.warning + '15' }]}>
              <Ionicons name="timer-outline" size={24} color={COLORS.warning} />
            </View>
            <Text style={[styles.metricValue, { color: COLORS.warning }]}>
              {station.metrics.vehicles_in_use}
            </Text>
            <Text style={styles.metricLabel}>Đang thuê</Text>
          </View>

          {/* Utilization Rate */}
          <View style={styles.metricCard}>
            <View style={[
              styles.metricIconContainer, 
              { backgroundColor: getUtilizationColor(station.metrics.utilization_rate) + '15' }
            ]}>
              <Ionicons 
                name="speedometer-outline" 
                size={24} 
                color={getUtilizationColor(station.metrics.utilization_rate)} 
              />
            </View>
            <Text style={[
              styles.metricValue, 
              { color: getUtilizationColor(station.metrics.utilization_rate) }
            ]}>
              {station.metrics.utilization_rate.toFixed(0)}%
            </Text>
            <Text style={styles.metricLabel}>Tỷ lệ sử dụng</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
  metricsContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  metricsTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADII.button,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricValue: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  availabilitySection: {
    marginTop: SPACING.sm,
  },
  availabilityTitle: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  availabilityBar: {
    marginTop: SPACING.xs,
  },
  availabilityBackground: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: 4,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  availabilityFill: {
    height: '100%',
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default StationDetailsCard;
