import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import mockVehicles from '../../data/vehicles';
import StatusModal from '../../components/common/StatusModal';

type BookingPaymentRouteProp = RouteProp<RootStackParamList, 'BookingPayment'>;
type BookingPaymentNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BookingPaymentScreen = () => {
  const route = useRoute<BookingPaymentRouteProp>();
  const navigation = useNavigation<BookingPaymentNavigationProp>();
  const { vehicleId } = route.params;
  
  const vehicle = mockVehicles.find(v => v.id === vehicleId);
  
  const [selectedPayment, setSelectedPayment] = useState<'station' | 'payos' | null>(null);
  const [rentalHours, setRentalHours] = useState('4');
  const [pickupTime, setPickupTime] = useState(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy xe</Text>
      </View>
    );
  }

  const calculateTotal = () => {
    const hours = parseInt(rentalHours) || 0;
    return hours * vehicle.hourlyRate;
  };

  const handlePayOSPayment = async () => {
    setIsProcessing(true);
    
    try {
      const paymentData = {
        amount: calculateTotal(),
        description: `Thuê xe ${vehicle.name} - ${rentalHours} giờ`,
        orderCode: `BOOK${Date.now()}`,
        returnUrl: 'myapp://payment-success',
        cancelUrl: 'myapp://payment-cancel',
      };

      // TODO: Replace with your actual PayOS API call
      // See PAYOS_INTEGRATION.md for detailed instructions
      
      // OPTION 1: Call your backend API (RECOMMENDED - when ready)
      // const response = await fetch('https://your-backend.com/api/create-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(paymentData),
      // });
      // const { checkoutUrl } = await response.json();
      
      // OPTION 2: Demo mode - Simulate success without WebView
      setIsProcessing(false);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setModalType('success');
      setModalTitle('Thanh toán thành công!');
      setModalMessage(`Đã đặt xe ${vehicle.name} thành công. (Demo mode - Chưa tích hợp backend PayOS)`);
      setModalVisible(true);
      return;
      
      // OPTION 3: Test WebView with a working URL (uncomment when you have real PayOS URL)
      // const paymentUrl = checkoutUrl; // from API response
      // navigation.navigate('PayOSWebView', {
      //   paymentUrl: paymentUrl,
      //   bookingId: paymentData.orderCode,
      //   amount: paymentData.amount,
      //   vehicleName: vehicle.name,
      // });
      
    } catch (error) {
      setIsProcessing(false);
      setModalType('error');
      setModalTitle('Thanh toán thất bại');
      setModalMessage('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
      setModalVisible(true);
    }
  };

  const handleStationPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      setIsProcessing(false);
      setModalType('success');
      setModalTitle('Đặt xe thành công!');
      setModalMessage(`Vui lòng đến trạm để thanh toán và nhận xe ${vehicle.name}.`);
      setModalVisible(true);
      
    } catch (error) {
      setIsProcessing(false);
      setModalType('error');
      setModalTitle('Đặt xe thất bại');
      setModalMessage('Có lỗi xảy ra. Vui lòng thử lại.');
      setModalVisible(true);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedPayment) {
      setModalType('error');
      setModalTitle('Thiếu thông tin');
      setModalMessage('Vui lòng chọn phương thức thanh toán');
      setModalVisible(true);
      return;
    }

    if (selectedPayment === 'payos') {
      await handlePayOSPayment();
    } else {
      await handleStationPayment();
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === 'success') {
      // Navigate to bookings screen after success
      setTimeout(() => {
        navigation.navigate('MainTabs' as any, { screen: 'Bookings' });
      }, 300);
    }
  };

  const handleViewBooking = () => {
    setModalVisible(false);
    setTimeout(() => {
      navigation.navigate('MainTabs' as any, { screen: 'Bookings' });
    }, 300);
  };

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
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt xe & Thanh toán</Text>
          <View style={{ width: 40 }} />
        </View>

      <ScrollView style={styles.contentContainer} 
      showsVerticalScrollIndicator={false}>
        {/* Vehicle Info */}
        <View style={styles.vehicleCard}>
          <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{vehicle.name}</Text>
            <Text style={styles.vehicleModel}>{vehicle.brand} • {vehicle.year}</Text>
            <View style={styles.rateContainer}>
              <Text style={styles.rateText}>{vehicle.hourlyRate.toLocaleString('vi-VN')}đ</Text>
              <Text style={styles.rateUnit}>/giờ</Text>
            </View>
          </View>
        </View>

        {/* Rental Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thuê xe</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Thời gian thuê (giờ)</Text>
            <TextInput
              style={styles.input}
              value={rentalHours}
              onChangeText={setRentalHours}
              keyboardType="numeric"
              placeholder="Nhập số giờ"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Thời gian nhận xe</Text>
            <TextInput
              style={styles.input}
              value={pickupTime}
              onChangeText={setPickupTime}
              placeholder="HH:MM"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa điểm nhận xe</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.locationText}>{vehicle.location}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'station' && styles.paymentOptionSelected
            ]}
            onPress={() => setSelectedPayment('station')}
          >
            <View style={styles.paymentIconContainer}>
              <Ionicons 
                name="business" 
                size={24} 
                color={selectedPayment === 'station' ? COLORS.primary : COLORS.textSecondary} 
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle,
                selectedPayment === 'station' && styles.paymentTitleSelected
              ]}>
                Thanh toán tại trạm
              </Text>
              <Text style={styles.paymentDesc}>
                Thanh toán trực tiếp khi nhận xe
              </Text>
            </View>
            <View style={[
              styles.radioButton,
              selectedPayment === 'station' && styles.radioButtonSelected
            ]}>
              {selectedPayment === 'station' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'payos' && styles.paymentOptionSelected
            ]}
            onPress={() => setSelectedPayment('payos')}
          >
            <View style={styles.paymentIconContainer}>
              <Ionicons 
                name="card" 
                size={24} 
                color={selectedPayment === 'payos' ? COLORS.primary : COLORS.textSecondary} 
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle,
                selectedPayment === 'payos' && styles.paymentTitleSelected
              ]}>
                PayOS
              </Text>
              <Text style={styles.paymentDesc}>
                Thanh toán online qua ví điện tử
              </Text>
            </View>
            <View style={[
              styles.radioButton,
              selectedPayment === 'payos' && styles.radioButtonSelected
            ]}>
              {selectedPayment === 'payos' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng kết</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đơn giá</Text>
            <Text style={styles.summaryValue}>
              {vehicle.hourlyRate.toLocaleString('vi-VN')}đ/giờ
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Thời gian thuê</Text>
            <Text style={styles.summaryValue}>{rentalHours} giờ</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>
              {calculateTotal().toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Tổng thanh toán</Text>
          <Text style={styles.priceValue}>
            {calculateTotal().toLocaleString('vi-VN')}đ
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedPayment || isProcessing) && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirmBooking}
          disabled={!selectedPayment || isProcessing}
        >
          <Text style={styles.confirmButtonText}>
            {isProcessing ? 'Đang xử lý...' : 'Xác nhận đặt xe'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Modal */}
      <StatusModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        actionButtonText={modalType === 'success' ? 'Xem đặt chỗ' : 'Thử lại'}
        onActionPress={modalType === 'success' ? handleViewBooking : () => setModalVisible(false)}
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
    ...SHADOWS.md,
  },
  backButton: {
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
  contentContainer:{
    marginBottom: SPACING.huge
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  vehicleImage: {
    width: 100,
    height: 100,
    borderRadius: RADII.md,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rateText: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.primary,
  },
  rateUnit: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADII.card,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADII.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  locationText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(41, 121, 255, 0.05)',
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentTitle: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  paymentTitleSelected: {
    color: COLORS.primary,
  },
  paymentDesc: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
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
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    paddingVertical: SPACING.xxl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.md,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: -SPACING.sm,
  },
  priceLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
  processingText: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
});

export default BookingPaymentScreen;
