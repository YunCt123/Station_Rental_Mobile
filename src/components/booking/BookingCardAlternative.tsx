import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface Booking {
  id: string;
  vehicleName: string;
  vehicleModel: string;
  vehicleImage: string;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  startDate: string;
  endDate: string;
  totalHours: number;
  totalPrice: number;
  location: string;
}

interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
}

const BookingCardAlternative: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: COLORS.success,
          bgColor: COLORS.success + '20',
          icon: 'play-circle',
          text: 'Đang thuê'
        };
      case 'completed':
        return {
          color: COLORS.primary,
          bgColor: COLORS.primary + '20',
          icon: 'checkmark-circle',
          text: 'Hoàn thành'
        };
      case 'cancelled':
        return {
          color: COLORS.error,
          bgColor: COLORS.error + '20',
          icon: 'close-circle',
          text: 'Đã hủy'
        };
      case 'upcoming':
        return {
          color: COLORS.warning,
          bgColor: COLORS.warning + '20',
          icon: 'time',
          text: 'Sắp tới'
        };
      default:
        return {
          color: COLORS.textSecondary,
          bgColor: COLORS.textSecondary + '20',
          icon: 'information-circle',
          text: status
        };
    }
  };

  const statusInfo = getStatusInfo(booking.status);

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(booking)}
      activeOpacity={0.8}
    >
      {/* Header with Status */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.vehicleName}>{booking.vehicleName}</Text>
          <Text style={styles.vehicleModel}>{booking.vehicleModel}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: booking.vehicleImage }} style={styles.image} />
        <View style={styles.imageOverlay}>
          <View style={styles.priceTag}>
            <Text style={styles.priceValue}>
              {booking.totalPrice.toLocaleString('vi-VN')}đ
            </Text>
            <Text style={styles.priceLabel}>Tổng cộng</Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Ngày thuê</Text>
            <Text style={styles.detailValue}>
              {booking.startDate} - {booking.endDate}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Thời gian</Text>
            <Text style={styles.detailValue}>{booking.totalHours} giờ</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Trạm</Text>
            <Text style={styles.detailValue}>{booking.location}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>Xem chi tiết</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
  },
  vehicleName: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.button,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    marginHorizontal: SPACING.md,
    borderRadius: RADII.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: SPACING.sm,
  },
  priceTag: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  priceValue: {
    fontSize: FONTS.body,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  details: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BookingCardAlternative;
