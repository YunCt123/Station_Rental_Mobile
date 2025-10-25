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

const BookingCardMinimal: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: COLORS.success,
          icon: 'play-circle',
          text: 'Đang thuê'
        };
      case 'completed':
        return {
          color: COLORS.primary,
          icon: 'checkmark-circle',
          text: 'Hoàn thành'
        };
      case 'cancelled':
        return {
          color: COLORS.error,
          icon: 'close-circle',
          text: 'Đã hủy'
        };
      case 'upcoming':
        return {
          color: COLORS.warning,
          icon: 'time',
          text: 'Sắp tới'
        };
      default:
        return {
          color: COLORS.textSecondary,
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
      {/* Main Content */}
      <View style={styles.content}>
        {/* Left Side - Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: booking.vehicleImage }} style={styles.image} />
          <View style={styles.statusDot}>
            <View style={[styles.dot, { backgroundColor: statusInfo.color }]} />
          </View>
        </View>

        {/* Right Side - Info */}
        <View style={styles.infoContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.vehicleName}>{booking.vehicleName}</Text>
              <Text style={styles.vehicleModel}>{booking.vehicleModel}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>
                {booking.startDate} - {booking.endDate}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{booking.totalHours} giờ</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{booking.location}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.priceLabel}>Tổng cộng</Text>
            <Text style={styles.priceValue}>
              {booking.totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    gap: 4,
    marginBottom: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
  },
  arrowContainer: {
    marginLeft: SPACING.sm,
  },
});

export default BookingCardMinimal;
