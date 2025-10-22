import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
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

interface AvailableVehiclesProps {
  vehicles: ElectricVehicle[];
  onVehiclePress: (vehicleId: string) => void;
}

const AvailableVehicles: React.FC<AvailableVehiclesProps> = ({ 
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

  const renderVehicleItem = ({ item }: { item: ElectricVehicle }) => (
    <TouchableOpacity
      style={styles.vehicleItem}
      onPress={() => onVehiclePress(item.id)}
    >
      <View style={styles.vehicleIconContainer}>
        <Ionicons 
          name={getVehicleIcon(item.type) as any} 
          size={24} 
          color={COLORS.primary} 
        />
      </View>
      
      <View style={styles.vehicleInfo}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleName}>{item.name}</Text>
          <Text style={styles.batteryLevel}>{item.battery}%</Text>
        </View>
        
        <Text style={styles.vehicleModel}>{item.model}</Text>
        
        <View style={styles.vehicleDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.distance}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.priceText}>{item.pricePerHour.toLocaleString()}đ/h</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionContainer}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.isAvailable ? COLORS.success + '20' : COLORS.error + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.isAvailable ? COLORS.success : COLORS.error }
          ]}>
            {item.isAvailable ? 'Sẵn sàng' : 'Đang thuê'}
          </Text>
        </View>
        
        <Ionicons name="chevron-forward-outline" size={16} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Xe có sẵn gần bạn</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.listContainer}>
        <FlatList
          data={vehicles.filter(vehicle => vehicle.isAvailable)}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
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
  listContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screenPadding,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
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
  },
  batteryLevel: {
    fontSize: FONTS.caption,
    fontWeight: '600',
    color: COLORS.success,
  },
  vehicleModel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  vehicleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
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
  priceText: {
    fontSize: FONTS.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADII.button,
  },
  statusText: {
    fontSize: FONTS.caption,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 76,
  },
});

export default AvailableVehicles;