import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { Vehicle } from '../../services';

interface BatteryIndicatorProps {
  vehicle: Vehicle;
}

const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ vehicle }) => {
  const getBatteryColor = (level: number) => {
    if (level >= 80) return COLORS.success;
    if (level >= 50) return COLORS.warning;
    return COLORS.error;
  };

  const getBatteryIcon = (level: number) => {
  if (level > 80) return 'battery-full';
  if (level > 40) return 'battery-half';
  if (level > 10) return 'battery-dead';
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
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
