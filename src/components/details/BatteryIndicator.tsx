import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { VehicleData } from '../../data/vehicles';

interface BatteryIndicatorProps {
  vehicle: VehicleData;
}

const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ vehicle }) => {
  const getBatteryColor = (level: number) => {
    if (level >= 80) return COLORS.success;
    if (level >= 50) return COLORS.warning;
    return COLORS.error;
  };

  const getBatteryIcon = (level: number) => {
    if (level >= 80) return 'battery-full';
    if (level >= 50) return 'battery-half';
    if (level >= 20) return 'battery-quarter';
    return 'battery-dead';
  };

  return (
    <View style={styles.batteryIndicator}>
      <Ionicons 
        name={getBatteryIcon(vehicle.batteryLevel) as any} 
        size={16} 
        color={getBatteryColor(vehicle.batteryLevel)} 
      />
      <Text style={[styles.batteryText, { color: getBatteryColor(vehicle.batteryLevel) }]}>
        {vehicle.batteryLevel}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  batteryIndicator: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...SHADOWS.sm,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BatteryIndicator;
