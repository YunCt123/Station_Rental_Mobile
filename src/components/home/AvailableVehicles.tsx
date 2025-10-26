import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import VehicleCard from '../common/VehicleCard';
import { Vehicle } from '../../services';

interface AvailableVehiclesProps {
  vehicles: Vehicle[];
  onVehiclePress: (vehicleId: string) => void;
}

const AvailableVehicles: React.FC<AvailableVehiclesProps> = ({ 
  vehicles, 
  onVehiclePress 
}) => {
  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
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
        data={vehicles.filter(vehicle => vehicle.status === 'AVAILABLE')}
        renderItem={renderVehicleItem}
        keyExtractor={(item) => item._id}
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