import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../utils/theme';
import { VehicleData } from '../../data/vehicles';

interface StatusBannerProps {
  vehicle: VehicleData;
}

const StatusBanner: React.FC<StatusBannerProps> = ({ vehicle }) => {
  const getStatusInfo = () => {
    switch (vehicle.status) {
      case 'Available':
        return {
          label: 'Có sẵn',
          color: COLORS.success,
          icon: 'checkmark-circle',
        };
      case 'Maintenance Due':
        return {
          label: 'Bảo trì',
          color: COLORS.error,
          icon: 'warning',
        };
      default:
        return {
          label: vehicle.status,
          color: COLORS.textSecondary,
          icon: 'information-circle',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={[styles.statusBanner, { backgroundColor: `${statusInfo.color}15` }]}>
      <Ionicons name={statusInfo.icon as any} size={24} color={statusInfo.color} />
      <Text style={[styles.statusText, { color: statusInfo.color }]}>
        {statusInfo.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  statusText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
  },
});

export default StatusBanner;
