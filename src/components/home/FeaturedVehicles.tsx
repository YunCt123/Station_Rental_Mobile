import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../utils/theme';
import VehicleCard from '../common/VehicleCard';
import { Vehicle } from '../../services';

interface FeaturedVehiclesProps {
  vehicles: Vehicle[];
  onVehiclePress: (vehicleId: string) => void;
}

const FeaturedVehicles: React.FC<FeaturedVehiclesProps> = ({ 
  vehicles, 
  onVehiclePress 
}) => {
  const renderVehicleCard = (vehicle: Vehicle) => (
    <VehicleCard 
      key={vehicle._id}
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