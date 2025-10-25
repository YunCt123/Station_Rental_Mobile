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

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: COLORS.success,
          bgColor: COLORS.success + '15',
          icon: 'play-circle',
          text: 'Đang thuê'
        };
      case 'completed':
        return {
          color: COLORS.primary,
          bgColor: COLORS.primary + '15',
          icon: 'checkmark-circle',
          text: 'Hoàn thành'
        };
      case 'cancelled':
        return {
          color: COLORS.error,
          bgColor: COLORS.error + '15',
          icon: 'close-circle',
          text: 'Đã hủy'
        };
      case 'upcoming':
        return {
          color: COLORS.warning,
          bgColor: COLORS.warning + '15',
          icon: 'time',
          text: 'Sắp tới'
        };
      default:
        return {
          color: COLORS.textSecondary,
          bgColor: COLORS.textSecondary + '15',
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
      {/* Image Container with Status Badge */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: booking.vehicleImage }} style={styles.image} />
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.vehicleName}>{booking.vehicleName}</Text>
            <Text style={styles.vehicleModel}>{booking.vehicleModel}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>
              {booking.totalPrice.toLocaleString('vi-VN')}đ
            </Text>
            <Text style={styles.priceLabel}>Tổng cộng</Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ngày thuê</Text>
              <Text style={styles.detailValue}>
                {booking.startDate} - {booking.endDate}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Thời gian</Text>
              <Text style={styles.detailValue}>{booking.totalHours} giờ</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="location-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Trạm</Text>
              <Text style={styles.detailValue}>{booking.location}</Text>
            </View>
          </View>
        </View>

        {/* Footer with Action */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            <Text style={styles.footerText}>Xem chi tiết</Text>
          </View>
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
    marginHorizontal: SPACING.xs,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
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
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
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
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  detailsGrid: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BookingCard;
