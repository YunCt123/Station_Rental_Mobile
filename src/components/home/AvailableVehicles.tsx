import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { VehicleData } from '../../data/vehicles';
import VehicleCard from '../VehicleCard';

interface AvailableVehiclesProps {
  vehicles: VehicleData[];
  onVehiclePress: (vehicleId: string) => void;
}

const AvailableVehicles: React.FC<AvailableVehiclesProps> = ({ 
  vehicles, 
  onVehiclePress 
}) => {
  const renderVehicleItem = ({ item }: { item: VehicleData }) => (
    <VehicleCard 
      vehicle={item} 
      onPress={onVehiclePress}
      variant="vertical"
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Xe có sẵn gần bạn</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={vehicles.filter(vehicle => vehicle.status === 'Available')}
        renderItem={renderVehicleItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
    paddingHorizontal: SPACING.screenPadding,
    paddingRight: SPACING.screenPadding,
  },
});

export default AvailableVehicles;