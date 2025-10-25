import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { VehicleData } from '../../data/vehicles';
import BatteryIndicator from './BatteryIndicator';

interface VehicleInfoCardProps {
  vehicle: VehicleData;
}

const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({ vehicle }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
        <BatteryIndicator vehicle={vehicle} />
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>{vehicle.name}</Text>
        <Text style={styles.vehicleModel}>
          {vehicle.year} • {vehicle.type}
        </Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.warning} />
          <Text style={styles.rating}>{vehicle.rating}</Text>
          <Text style={styles.reviewCount}>({vehicle.reviewCount})</Text>
        </View>

        <View style={styles.statusLocationContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  vehicle.status === "Available"
                    ? COLORS.success + "20"
                    : COLORS.error + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    vehicle.status === "Available"
                      ? COLORS.success
                      : COLORS.error,
                },
              ]}
            >
              {vehicle.status === "Available" ? "Có sẵn" : "Bảo trì"}
            </Text>
          </View>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.locationText}>{vehicle.location}</Text>
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
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    borderRadius: RADII.md,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  vehicleInfo: {
    gap: SPACING.sm,
  },
  vehicleName: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  statusLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.button,
  },
  statusText: {
    fontSize: FONTS.body,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
});

export default VehicleInfoCard;
