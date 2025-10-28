import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import StatusModal from "../../components/common/StatusModal";
import { CreatePayOSPaymentResponse } from "../../types/payment";
import { paymentService } from "../../services/paymentService";
import { bookingService } from "../../services/bookingService";
import { Vehicle } from "../../types/vehicle";
import { CreateBookingRequest } from "../../types/booking";
import { vehicleService } from "../../services/vehicleService";
import { authService } from "../../services/authService";

type BookingPaymentRouteProp = RouteProp<RootStackParamList, "BookingPayment">;
type BookingPaymentNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const BookingPaymentScreen = () => {
  const route = useRoute<BookingPaymentRouteProp>();
  const navigation = useNavigation<BookingPaymentNavigationProp>();
  const { vehicleId } = route.params;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<
    "vnpay" | "payos" | null
  >(null);
  const [rentalHours, setRentalHours] = useState("4");
  const [pickupTime, setPickupTime] = useState(
    new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Load vehicle details
  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);

  const checkAuthentication = async () => {
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để đặt xe. Vui lòng đăng nhập và thử lại.",
        [
          {
            text: "Đăng nhập",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            },
          },
          {
            text: "Hủy",
            style: "cancel",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      const vehicleData = await vehicleService.getVehicleById(vehicleId);
      setVehicle(vehicleData);
    } catch (error) {
      console.error("Error loading vehicle:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin xe");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!vehicle) return 0;
    const hours = parseInt(rentalHours) || 0;
    const hourlyRate = vehicle.pricing?.hourly || vehicle.pricePerHour || 0;
    return hours * hourlyRate;
  };

  // Calculate booking times
  const calculateBookingTimes = () => {
    const now = new Date();
    const [hours, minutes] = pickupTime.split(":").map(Number);

    const startAt = new Date(now);
    startAt.setHours(hours, minutes, 0, 0);

    // If pickup time is in the past, set it to tomorrow
    if (startAt < now) {
      startAt.setDate(startAt.getDate() + 1);
    }

    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + parseInt(rentalHours));

    return {
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };
  };

  /** --- CREATE BOOKING FIRST --- **/
  const createBooking = async (): Promise<string | null> => {
    try {
      if (!vehicle || !vehicle.station_id) {
        throw new Error("Thông tin xe hoặc trạm không hợp lệ");
      }

      // Check if vehicle is still available
      if (vehicle.status !== 'AVAILABLE') {
        throw new Error(`Xe không còn khả dụng. Trạng thái hiện tại: ${vehicle.status}`);
      }

      const { startAt, endAt } = calculateBookingTimes();

      const bookingData: CreateBookingRequest = {
        vehicleId: vehicleId,
        stationId: vehicle.station_id,
        startAt,
        endAt,
        agreement: {
          accepted: true,
        },
      };

      const booking = await bookingService.createBooking(bookingData);
      
      // Verify booking was created successfully
      if (!booking || !booking._id) {
        throw new Error("Booking không được tạo thành công");
      }
      
      console.log('Booking created:', booking);
      return booking._id;
    } catch (error: any) {
      console.error("Error creating booking:", error);
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.message || "Không thể tạo booking";
      throw new Error(errorMessage);
    }
  };

  /** --- HANDLE PAYOS PAYMENT --- **/
  const handlePayOSPayment = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Create booking with status HELD
      const bookingId = await createBooking();
      if (!bookingId) {
        throw new Error("Không thể tạo booking");
      }
      
      setCreatedBookingId(bookingId);

      // Step 2: Create PayOS payment (NOT VNPay!)
      const amount = calculateTotal();
      console.log('[handlePayOSPayment] Creating PayOS payment with amount:', amount);
      
      const response = await paymentService.createPayOSPayment({
        bookingId: bookingId,
        amount: amount,
        returnUrl: `myapp://payment/result?bookingId=${bookingId}`,
        cancelUrl: `myapp://payment/cancel?bookingId=${bookingId}`,
      });

      console.log('[handlePayOSPayment] Full payment response:', JSON.stringify(response, null, 2));
      
      // Backend returns: { payment, checkoutUrl, transaction_ref }
      const checkoutUrl = response?.checkoutUrl;

      console.log('[handlePayOSPayment] Checkout URL:', checkoutUrl);

      // Step 3: Navigate to PayOS WebView
      if (checkoutUrl) {
        setIsProcessing(false);
        
        console.log('[handlePayOSPayment] Navigating to PayOSWebView with URL:', checkoutUrl);
        
        navigation.navigate("PayOSWebView", {
          paymentUrl: checkoutUrl,
          bookingId: bookingId,
          amount: amount,
          vehicleName: vehicle?.name || "Xe",
        });
      } else {
        console.error('[handlePayOSPayment] No checkoutUrl in response:', response);
        throw new Error("Không nhận được URL thanh toán từ PayOS");
      }
    } catch (error: any) {
      console.error("[handlePayOSPayment] Error:", error);
      console.error("[handlePayOSPayment] Error response:", error.response?.data);
      console.error("[handlePayOSPayment] Error message:", error.message);
      setIsProcessing(false);
      
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.message || "Không thể khởi tạo thanh toán";
      
      setModalType("error");
      setModalTitle("Thanh toán thất bại");
      setModalMessage(errorMessage);
      setModalVisible(true);
    }
  };

  /** --- HANDLE VNPAY PAYMENT --- **/
  const handleVNPAYPayment = async () => {
    setIsProcessing(true);
    try {
      const bookingId = await createBooking();
      if (!bookingId) throw new Error("Không thể tạo booking");
      setCreatedBookingId(bookingId);

      const amount = calculateTotal();

      const response = await paymentService.createVNPAYDeposit(
        bookingId,
        amount
      );

      console.log('[handleVNPAYPayment] Response:', response);

      if (response?.checkoutUrl) {
        setIsProcessing(false);
        // @ts-ignore - navigation type issue
        navigation.navigate("VNPAYWebView", {
          paymentUrl: response.checkoutUrl,
          bookingId,
          amount: amount,
          vehicleName: vehicle?.name || "Xe",
        });
      } else {
        throw new Error("Không nhận được URL thanh toán");
      }
    } catch (error: any) {
      console.error("Lỗi VNPAY:", error);
      setIsProcessing(false);
      setModalType("error");
      setModalTitle("Thanh toán thất bại");
      setModalMessage(error.message || "Không thể khởi tạo thanh toán.");
      setModalVisible(true);
    }
  };

  /** --- HANDLE CONFIRM --- **/
  const handleConfirmBooking = async () => {
    // Kiểm tra authentication trước
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để đặt xe. Vui lòng đăng nhập và thử lại.",
        [
          {
            text: "Đăng nhập",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            },
          },
          {
            text: "Hủy",
            style: "cancel",
          },
        ]
      );
      return;
    }

    if (!selectedPayment) {
      setModalType("error");
      setModalTitle("Thiếu thông tin");
      setModalMessage("Vui lòng chọn phương thức thanh toán");
      setModalVisible(true);
      return;
    }

    if (selectedPayment === "payos") {
      await handlePayOSPayment();
    } else {
      await handleVNPAYPayment();
    }
  };

  /** --- MODAL HANDLING --- **/
  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      }, 300);
    }
  };

  const handleViewBooking = () => {
    setModalVisible(false);
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    }, 300);
  };

  // Show loading state
  if (loading || !vehicle) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <LinearGradient colors={COLORS.gradient_4} style={styles.container}>
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.loadingText}>Đang tải thông tin...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const hourlyRate = vehicle.pricing?.hourly || vehicle.pricePerHour || 0;
  const stationLocation = vehicle.station_name || "Chưa xác định";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient colors={COLORS.gradient_4} style={styles.container}>
        {/* HEADER */}
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

        {/* CONTENT */}
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* VEHICLE INFO */}
          <View style={styles.vehicleCard}>
            <Image
              source={{ uri: vehicle.image }}
              style={styles.vehicleImage}
            />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehicleModel}>
                {vehicle.brand} • {vehicle.year}
              </Text>
              <View style={styles.rateContainer}>
                <Text style={styles.rateText}>
                  {hourlyRate.toLocaleString("vi-VN")}đ
                </Text>
                <Text style={styles.rateUnit}>/giờ</Text>
              </View>
            </View>
          </View>

          {/* RENTAL DETAILS */}
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
                <Text style={styles.locationText}>{stationLocation}</Text>
              </View>
            </View>
          </View>

          {/* PAYMENT METHOD */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

            {/* PAYOS */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === "payos" && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPayment("payos")}
            >
              <Ionicons
                name="card"
                size={28}
                color={
                  selectedPayment === "payos"
                    ? COLORS.primary
                    : COLORS.textSecondary
                }
              />
              <View style={styles.paymentInfo}>
                <Text
                  style={[
                    styles.paymentTitle,
                    selectedPayment === "payos" && styles.paymentTitleSelected,
                  ]}
                >
                  PayOS
                </Text>
                <Text style={styles.paymentDesc}>
                  Thanh toán online qua ví điện tử
                </Text>
              </View>
            </TouchableOpacity>

            {/* VNPAY */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === "vnpay" && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPayment("vnpay")}
            >
              <Ionicons
                name="logo-usd"
                size={28}
                color={
                  selectedPayment === "vnpay"
                    ? COLORS.primary
                    : COLORS.textSecondary
                }
              />
              <View style={styles.paymentInfo}>
                <Text
                  style={[
                    styles.paymentTitle,
                    selectedPayment === "vnpay" && styles.paymentTitleSelected,
                  ]}
                >
                  VNPAY
                </Text>
                <Text style={styles.paymentDesc}>
                  Thanh toán nhanh qua cổng VNPAY
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* SUMMARY */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng kết</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Đơn giá</Text>
              <Text style={styles.summaryValue}>
                {hourlyRate.toLocaleString("vi-VN")}đ/giờ
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
                {calculateTotal().toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* BOTTOM BUTTON */}
        <View style={styles.bottomContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Tổng thanh toán</Text>
            <Text style={styles.priceValue}>
              {calculateTotal().toLocaleString("vi-VN")}đ
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedPayment || isProcessing) &&
                styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmBooking}
            disabled={!selectedPayment || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.confirmButtonText}>Xác nhận đặt xe</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* MODAL */}
        <StatusModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={handleModalClose}
          actionButtonText={modalType === "success" ? "Xem đặt chỗ" : "Thử lại"}
          onActionPress={
            modalType === "success"
              ? handleViewBooking
              : () => setModalVisible(false)
          }
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.white,
  },
  contentContainer: {
    marginBottom: SPACING.huge,
  },
  vehicleCard: {
    flexDirection: "row",
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
    justifyContent: "center",
  },
  vehicleName: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  rateContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  rateText: {
    fontSize: FONTS.title,
    fontWeight: "700",
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
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.body,
    fontWeight: "600",
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
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(41, 121, 255, 0.05)",
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentTitle: {
    fontSize: FONTS.body,
    fontWeight: "600",
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
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.primary,
  },
  bottomContainer: {
    position: "absolute",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    marginTop: -SPACING.sm,
  },
  priceLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.white,
  },
  processingText: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    marginTop: SPACING.md,
  },
});

export default BookingPaymentScreen;
