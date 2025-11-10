import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII } from '../../../utils/theme';

interface StatusInfoCardProps {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

const StatusInfoCard: React.FC<StatusInfoCardProps> = ({ status, rejectionReason }) => {
  if (!status) {
    return null;
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: 'time-outline' as const,
          color: COLORS.warning,
          bgColor: `${COLORS.warning}15`,
          label: 'Trạng thái',
          value: 'Đang chờ duyệt',
        };
      case 'APPROVED':
        return {
          icon: 'checkmark-circle-outline' as const,
          color: COLORS.success,
          bgColor: `${COLORS.success}15`,
          label: 'Trạng thái',
          value: 'Đã xác minh',
        };
      case 'REJECTED':
        return {
          icon: 'close-circle-outline' as const,
          color: COLORS.error,
          bgColor: `${COLORS.error}15`,
          label: 'Trạng thái',
          value: 'Bị từ chối',
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.statusRow, { backgroundColor: statusInfo.bgColor }]}>
        <View style={styles.iconWrapper}>
          <Ionicons name={statusInfo.icon} size={24} color={statusInfo.color} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.label}>{statusInfo.label}</Text>
          <Text style={[styles.value, { color: statusInfo.color }]}>{statusInfo.value}</Text>
        </View>
      </View>

      {status === 'REJECTED' && rejectionReason && (
        <View style={styles.reasonContainer}>
          <View style={styles.reasonHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.error} />
            <Text style={styles.reasonTitle}>Lý do từ chối</Text>
          </View>
          <Text style={styles.reasonText}>{rejectionReason}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADII.md,
  },
  iconWrapper: {
    marginRight: SPACING.md,
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: FONTS.body,
    fontWeight: '600',
  },
  reasonContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: `${COLORS.error}08`,
    borderRadius: RADII.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reasonTitle: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  reasonText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default StatusInfoCard;
