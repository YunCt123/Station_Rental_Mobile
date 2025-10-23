import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { VehicleData } from '../../data/vehicles';

interface VehicleCardProps {
  vehicle: VehicleData;
  onPress: (vehicleId: string) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'electric-car': return 'car-outline';
      case 'electric-bike': return 'bicycle-outline';
      case 'electric-scooter': return 'bicycle-outline';
      case 'electric-motorbike': return 'bicycle-outline';
      default: return 'car-outline';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(vehicle.id)}
    >
      <View style={styles.vehicleImageContainer}>
        <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
        <View style={[styles.batteryIndicator, { opacity: vehicle.batteryLevel / 100 }]}>
          <Text style={styles.batteryText}>{vehicle.batteryLevel}%</Text>
        </View>
      </View>
      
      <View style={styles.vehicleInfo}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.rating}>{vehicle.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.vehicleModel}>{vehicle.year} • {vehicle.type}</Text>
        
        <View style={styles.vehicleDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{vehicle.range} km range</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{vehicle.hourlyRate.toLocaleString()}đ/h</Text>
          </View>
        </View>
        
        <Text style={styles.stationName}>{vehicle.location}</Text>
        
        <View style={[
          styles.availabilityBadge,
          { backgroundColor: vehicle.status === 'Available' ? COLORS.success + '20' : COLORS.error + '20' }
        ]}>
          <Text style={[
            styles.availabilityText,
            { color: vehicle.status === 'Available' ? COLORS.success : COLORS.error }
          ]}>
            {vehicle.status === 'Available' ? 'Có sẵn' : 'Bảo trì'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  vehicleImageContainer: {
    position: 'relative',
    marginRight: SPACING.lg,
  },
  vehicleImage: {
    width: 80,
    height: 80,
    borderRadius: RADII.card,
    backgroundColor: COLORS.background,
  },
  vehicleImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: RADII.card,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.success,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  batteryText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  vehicleName: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  vehicleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  stationName: {
    fontSize: FONTS.caption,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADII.button,
  },
  availabilityText: {
    fontSize: FONTS.caption,
    fontWeight: '500',
  },
});

export default VehicleCard;