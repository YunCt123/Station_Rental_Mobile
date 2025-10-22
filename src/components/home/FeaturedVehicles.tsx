import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface ElectricVehicle {
  id: string;
  name: string;
  model: string;
  type: 'electric-car' | 'electric-bike' | 'electric-scooter' | 'electric-motorbike';
  battery: number;
  distance: string;
  pricePerHour: number;
  image: string;
  features: string[];
  stationName: string;
  isAvailable: boolean;
  rating: number;
}

interface FeaturedVehiclesProps {
  vehicles: ElectricVehicle[];
  onVehiclePress: (vehicleId: string) => void;
}

const FeaturedVehicles: React.FC<FeaturedVehiclesProps> = ({ 
  vehicles, 
  onVehiclePress 
}) => {
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'electric-car': return 'car-outline';
      case 'electric-bike': return 'bicycle-outline';
      case 'electric-scooter': return 'bicycle-outline';
      case 'electric-motorbike': return 'bicycle-outline';
      default: return 'car-outline';
    }
  };

  const renderVehicleCard = (vehicle: ElectricVehicle) => (
    <TouchableOpacity
      key={vehicle.id}
      style={styles.vehicleCard}
      onPress={() => onVehiclePress(vehicle.id)}
    >
      <View style={styles.vehicleImageContainer}>
        <View style={styles.vehicleImagePlaceholder}>
          <Ionicons 
            name={getVehicleIcon(vehicle.type) as any} 
            size={32} 
            color={COLORS.primary} 
          />
        </View>
        
        {/* Battery indicator */}
        <View style={styles.batteryContainer}>
          <View style={[styles.batteryFill, { width: `${vehicle.battery}%` }]} />
          <Text style={styles.batteryText}>{vehicle.battery}%</Text>
        </View>
        
        {/* Availability badge */}
        <View style={[
          styles.availabilityBadge,
          { backgroundColor: vehicle.isAvailable ? COLORS.success : COLORS.error }
        ]}>
          <Text style={styles.availabilityText}>
            {vehicle.isAvailable ? 'Sẵn sàng' : 'Đang thuê'}
          </Text>
        </View>
      </View>
      
      <View style={styles.vehicleInfo}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleName} numberOfLines={1}>{vehicle.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.rating}>{vehicle.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.vehicleModel} numberOfLines={1}>{vehicle.model}</Text>
        
        <View style={styles.vehicleDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{vehicle.distance}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{vehicle.pricePerHour.toLocaleString()}đ/h</Text>
          </View>
        </View>
        
        <Text style={styles.stationName} numberOfLines={1}>{vehicle.stationName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Xe nổi bật</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.vehiclesContainer}
      >
        {vehicles.map(renderVehicleCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  vehiclesContainer: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.md,
  },
  vehicleCard: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  vehicleImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  vehicleImagePlaceholder: {
    height: 100,
    borderRadius: RADII.card,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  batteryContainer: {
    position: 'relative',
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  batteryFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  batteryText: {
    position: 'absolute',
    right: 0,
    top: -20,
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADII.button,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '500',
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
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.xs,
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
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  vehicleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '500',
  },
});

export default FeaturedVehicles;