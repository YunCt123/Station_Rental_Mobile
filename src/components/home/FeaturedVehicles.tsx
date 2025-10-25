import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../utils/theme';
import { VehicleData } from '../../data/vehicles';
import VehicleCard from '../common/VehicleCard';

interface FeaturedVehiclesProps {
  vehicles: VehicleData[];
  onVehiclePress: (vehicleId: string) => void;
}

const FeaturedVehicles: React.FC<FeaturedVehiclesProps> = ({ 
  vehicles, 
  onVehiclePress 
}) => {
  const renderVehicleCard = (vehicle: VehicleData) => (
    <VehicleCard 
      key={vehicle.id}
      vehicle={vehicle}
      onPress={onVehiclePress}
      variant="vertical"
    />
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
    paddingTop: SPACING.md,
  },
  seeAll: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: '500',
    paddingTop: SPACING.md,
  },
  vehiclesContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingRight: SPACING.screenPadding,
  },
});

export default FeaturedVehicles;