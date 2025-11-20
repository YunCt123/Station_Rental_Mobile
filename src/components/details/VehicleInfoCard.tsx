import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import BatteryIndicator from './BatteryIndicator';
import { UIVehicle } from '../../services/vehicleService';

interface VehicleInfoCardProps {
  vehicle: UIVehicle;
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
          
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={14} color={COLORS.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>{vehicle.station_name}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADII.card,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  vehicleImage: {
    width: '100%',
    height: 180,
    borderRadius: RADII.md,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  vehicleInfo: {
    gap: SPACING.xs,
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
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  rating: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  reviewCount: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
});

export default VehicleInfoCard;
