import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Station, StationVehicle } from '../../types/station';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface StationDetailsCardProps {
  station: Station;
  vehicles?: StationVehicle[];
  vehiclesLoading?: boolean;
  onClose?: () => void;
}

const StationDetailsCard: React.FC<StationDetailsCardProps> = ({
  station,
  vehicles = [],
  vehiclesLoading = false,
}) => {

  return (
    <View style={styles.container}>
      {/* Station Name */}
      <View style={styles.stationNameContainer}>
        <Text style={styles.stationName}>{station.name}</Text>
      </View>

      {/* Address */}
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>{station.address}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="business-outline" size={20} color={COLORS.primary} />
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

          {/* Available Vehicles - from actual vehicles list */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            </View>
            <Text style={[styles.metricValue, { color: COLORS.success }]}>
              {vehicles.length}
            </Text>
            <Text style={styles.metricLabel}>Xe có sẵn</Text>
          </View>
        </View>
      </View>

      {/* Vehicles List */}
      <View style={styles.vehiclesContainer}>
        <Text style={styles.metricsTitle}>Xe có sẵn ({vehicles.length})</Text>
        
        {vehiclesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải xe...</Text>
          </View>
        ) : vehicles.length === 0 ? (
          <View style={styles.emptyVehicles}>
            <Ionicons name="car-sport-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Không có xe khả dụng</Text>
          </View>
        ) : (
          <View style={styles.vehiclesList}>
            {vehicles.map((vehicle, index) => (
              <View key={vehicle._id || index} style={styles.vehicleItem}>
                {vehicle.image && (
                  <Image
                    source={{ uri: vehicle.image }}
                    style={styles.vehicleImage}
                  />
                )}
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>
                    {vehicle.brand} {vehicle.model}
                  </Text>
                  <Text style={styles.vehicleType}>{vehicle.type}</Text>
                  <View style={styles.vehicleDetails}>
                    <Ionicons name="battery-full" size={14} color={COLORS.success} />
                    <Text style={styles.vehicleDetailText}>
                      {vehicle.batteryLevel * 100}%
                    </Text>
                  </View>
                </View>
                <View style={styles.vehiclePrice}>
                  <Text style={styles.priceAmount}>
                    {vehicle.pricePerHour.toLocaleString("vi-VN")}
                  </Text>
                  <Text style={styles.priceUnit}>VND/giờ</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  stationNameContainer: {
    marginBottom: SPACING.lg,
  },
  stationName: {
    fontSize: FONTS.header,
    fontWeight: '700',
    color: COLORS.text,
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
  vehiclesContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  vehiclesList: {
    gap: SPACING.md,
  },
  vehicleItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
  },
  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: RADII.sm,
    marginRight: SPACING.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  vehicleType: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  vehicleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleDetailText: {
    fontSize: FONTS.caption,
    color: COLORS.success,
  },
  vehiclePrice: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceAmount: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  emptyVehicles: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default StationDetailsCard;
