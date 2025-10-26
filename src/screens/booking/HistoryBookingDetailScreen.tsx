import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import StatusModal from '../../components/common/StatusModal';
import InvoiceModal from '../../components/common/InvoiceModal';

interface RouteParams {
  bookingId: string;
}

const HistoryBookingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { bookingId } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  // Mock data
  const booking = {
    id: bookingId,
    vehicleName: 'BMW iX3',
    vehicleModel: '2023 Impressive',
    vehicleImage: 'https://images.unsplash.com/photo-1617654112274-64cb6d55efbe?w=400',
    status: 'completed',
    bookingCode: 'BOOK1729088400000',
    startDate: '20/10/2025',
    startTime: '10:00',
    endDate: '20/10/2025',
    endTime: '16:00',
    actualStartTime: '10:15',
    actualEndTime: '15:50',
    totalHours: 6,
    actualHours: 5.58,
    hourlyRate: 100000,
    totalPrice: 600000,
    actualPrice: 558000,
    location: 'Trạm Bitexco',
    locationAddress: '2 Hải Triều, Quận 1, TP.HCM',
    paymentMethod: 'Tại trạm',
    paymentStatus: 'completed',
    vehicleDetails: {
      licensePlate: '51B-67890',
      startBattery: 100,
      endBattery: 72,
      distance: '45 km',
    },
    rating: 0,
  };

  const handleRateBooking = () => {
    Alert.alert(
      'Đánh giá phương tiện',
      'Chức năng đánh giá đang được phát triển',
      [{ text: 'OK' }]
    );
  };

  const handleBookAgain = () => {
    setModalType('success');
    setModalVisible(true);
  };

  const handleViewInvoice = () => {
    setInvoiceModalVisible(true);
  };

  const handleModalActionPress = () => {
    setModalVisible(false);
    // Navigate to payment screen with vehicle info
    setTimeout(() => {
      (navigation as any).navigate('BookingPayment', { 
        vehicleId: '2', // Mock vehicle ID - should match the booked vehicle
      });
    }, 300);
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Báo cáo vấn đề',
      'Bạn có vấn đề gì với chuyến đi này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xe bị hỏng' },
        { text: 'Tính phí sai' },
        { text: 'Vấn đề khác' },
      ]
    );
  };

  const getStatusInfo = () => {
    switch (booking.status) {
      case 'completed':
        return {
          label: 'Hoàn thành',
          color: COLORS.success,
          icon: 'checkmark-circle',
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: COLORS.error,
          icon: 'close-circle',
        };
      default:
        return {
          label: booking.status,
          color: COLORS.textSecondary,
          icon: 'information-circle',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
      colors={COLORS.gradient_4}
      style={styles.container}
    >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết lịch sử</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleReportIssue}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.white} />
          </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: `${statusInfo.color}15` }]}>
          <Ionicons name={statusInfo.icon as any} size={24} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>

        {/* Vehicle Card */}
        <View style={styles.card}>
          <Image source={{ uri: booking.vehicleImage }} style={styles.vehicleImage} />
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{booking.vehicleName}</Text>
            <Text style={styles.vehicleModel}>{booking.vehicleModel}</Text>
            <View style={styles.detailRow}>
              <Ionicons name="car-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{booking.vehicleDetails.licensePlate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>Quãng đường: {booking.vehicleDetails.distance}</Text>
            </View>
          </View>

          {/* Rating Section */}
          {booking.status === 'completed' && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.ratingButton} onPress={handleRateBooking}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={booking.rating >= star ? 'star' : 'star-outline'}
                      size={24}
                      color={booking.rating >= star ? COLORS.warning : COLORS.textTertiary}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>
                  {booking.rating > 0 ? 'Sửa đánh giá' : 'Đánh giá phương tiện'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Trip Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin chuyến đi</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="barcode-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabelText}>Mã đặt chỗ</Text>
            </View>
            <Text style={styles.infoValue}>{booking.bookingCode}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.tripTimeContainer}>
            <View style={styles.tripTimeRow}>
              <View style={styles.timePoint}>
                <View style={[styles.timeDot, { backgroundColor: COLORS.success }]} />
                <View style={styles.timeLine} />
              </View>
              <View style={styles.timeContent}>
                <Text style={styles.timeLabel}>Bắt đầu</Text>
                <Text style={styles.timeValue}>
                  {booking.startDate} {booking.actualStartTime || booking.startTime}
                </Text>
                <Text style={styles.batteryInfo}>
                  Pin: {booking.vehicleDetails.startBattery}%
                </Text>
              </View>
            </View>

            <View style={styles.tripTimeRow}>
              <View style={styles.timePoint}>
                <View style={[styles.timeDot, { backgroundColor: COLORS.error }]} />
              </View>
              <View style={styles.timeContent}>
                <Text style={styles.timeLabel}>Kết thúc</Text>
                <Text style={styles.timeValue}>
                  {booking.endDate} {booking.actualEndTime || booking.endTime}
                </Text>
                <Text style={styles.batteryInfo}>
                  Pin: {booking.vehicleDetails.endBattery}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabelText}>Thời gian thuê</Text>
            </View>
            <Text style={styles.infoValue}>
              {booking.actualHours ? booking.actualHours.toFixed(1) : booking.totalHours} giờ
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabelText}>Trạm</Text>
            </View>
            <Text style={[styles.infoValue, styles.locationText]}>{booking.location}</Text>
          </View>
          <Text style={styles.addressText}>{booking.locationAddress}</Text>
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Phương thức</Text>
            <Text style={styles.paymentValue}>{booking.paymentMethod}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Giá thuê ({booking.actualHours ? booking.actualHours.toFixed(1) : booking.totalHours}h x {booking.hourlyRate.toLocaleString('vi-VN')}đ)
            </Text>
            <Text style={styles.paymentValue}>
              {(booking.actualPrice || booking.totalPrice).toLocaleString('vi-VN')}đ
            </Text>
          </View>

          {booking.actualPrice !== booking.totalPrice && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Giảm giá (trả sớm)</Text>
              <Text style={[styles.paymentValue, { color: COLORS.success }]}>
                -{(booking.totalPrice - booking.actualPrice).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          )}

          <View style={styles.paymentRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>
              {(booking.actualPrice || booking.totalPrice).toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Receipt */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.receiptButton}
            onPress={handleViewInvoice}
          >
            <Ionicons name="receipt-outline" size={24} color={COLORS.primary} />
            <Text style={styles.receiptText}>Xem hóa đơn</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      {booking.status === 'completed' && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.bookAgainButton}
            onPress={handleBookAgain}
          >
            <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
            <Text style={styles.bookAgainButtonText}>Đặt lại xe này</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success Modal */}
      <StatusModal
        visible={modalVisible}
        type={modalType}
        title="Đặt xe thành công!"
        message="Xe đã được thêm vào giỏ hàng. Vui lòng hoàn tất thanh toán."
        onClose={() => setModalVisible(false)}
        actionButtonText="Xem đặt chỗ"
        onActionPress={handleModalActionPress}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        visible={invoiceModalVisible}
        onClose={() => setInvoiceModalVisible(false)}
        bookingCode={booking.bookingCode} 
        vehicleName={booking.vehicleName}
        vehicleModel={booking.vehicleModel}
        startDate={booking.startDate}
        endDate={booking.endDate}
        startTime={booking.startTime}
        endTime={booking.endTime}
        actualStartTime={booking.actualStartTime}
        actualEndTime={booking.actualEndTime}
        hourlyRate={booking.hourlyRate}
        totalHours={booking.totalHours}
        actualHours={booking.actualHours}
        totalPrice={booking.totalPrice}
        actualPrice={booking.actualPrice}
        paymentMethod={booking.paymentMethod}
        location={booking.location}
      />
      </LinearGradient>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.white,
  },
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
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
  },
  vehicleInfo: {
    gap: SPACING.xs,
  },
  vehicleName: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  ratingButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  ratingText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  infoLabelText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 28,
  },
  locationText: {
    fontWeight: '700',
  },
  addressText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: 28,
    marginTop: SPACING.xs,
  },
  tripTimeContainer: {
    paddingVertical: SPACING.sm,
  },
  tripTimeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timePoint: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timeLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timeValue: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  batteryInfo: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  paymentLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  paymentValue: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalLabel: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.primary,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  receiptText: {
    flex: 1,
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xxl,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  bookAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    backgroundColor: COLORS.primary,
    marginTop: -SPACING.md,
    ...SHADOWS.sm,
  },
  bookAgainButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default HistoryBookingDetailScreen;
