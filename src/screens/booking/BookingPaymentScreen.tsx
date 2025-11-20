import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import StatusModal from "../../components/common/StatusModal";
import { paymentService } from "../../services/paymentService";
import { bookingService } from "../../services/bookingService";
import { Vehicle } from "../../types/vehicle";
import { CreateBookingRequest } from "../../types/booking";
import { vehicleService, UIVehicle, mapVehicleToUI } from "../../services/vehicleService";
import { authService } from "../../services/authService";
import {
  VehicleInfoCard,
  RentalTypeSelector,
  PricingSummary,
  HourlyRentalInput,
  DailyRentalInput,
} from "../../components/index";

type BookingPaymentRouteProp = RouteProp<RootStackParamList, "BookingPayment">;
type BookingPaymentNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const BookingPaymentScreen = () => {
  const route = useRoute<BookingPaymentRouteProp>();
  const navigation = useNavigation<BookingPaymentNavigationProp>();
  const { vehicleId } = route.params;

  // Vehicle & UI states
  const [vehicle, setVehicle] = useState<UIVehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Rental configuration
  const [rentalType, setRentalType] = useState<"hourly" | "daily">("hourly");
  const [rentalHours, setRentalHours] = useState("4");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [pickupDate, setPickupDate] = useState(new Date());

  // Time states for hourly rental
  const [pickupTime, setPickupTime] = useState({
    hour: new Date().getHours() + 1,
    minute: 0,
  });

  // Time states for daily rental
  const [startTime, setStartTime] = useState({ hour: 9, minute: 0 });

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Pricing states
  const [backendPricing, setBackendPricing] = useState<{
    totalPrice: number;
    deposit: number;
    basePrice: number;
    taxes: number;
    insurancePrice: number;
    hourlyRate?: number;
    dailyRate?: number;
  } | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Effects
  useEffect(() => {
    checkAuthenticationAndLoadVehicle();
  }, [vehicleId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsProcessing(false);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchBackendPricing();
  }, [
    vehicleId,
    rentalType,
    rentalHours,
    startDate,
    endDate,
    pickupDate,
    pickupTime,
    startTime,
  ]);

  // Authentication & data loading
  const checkAuthenticationAndLoadVehicle = async () => {
    const authenticated = await checkAuthentication();
    if (authenticated) {
      loadVehicleDetails();
    }
  };

  const checkAuthentication = async () => {
    try {
      console.log("🔍 Checking authentication...");
      const isAuth = await authService.isAuthenticated();
      console.log("🔍 Is authenticated:", isAuth);

      if (!isAuth) {
        Alert.alert("Yêu cầu đăng nhập", "Bạn cần đăng nhập để đặt xe.", [
          {
            text: "Đăng nhập",
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: "Login" }] }),
          },
          { text: "Hủy", style: "cancel", onPress: () => navigation.goBack() },
        ]);
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Authentication check failed:", error);
      Alert.alert("Lỗi", "Không thể xác thực. Vui lòng đăng nhập lại.");
      return false;
    }
  };

  /**
   * Check if user account is verified (document verification)
   * User must have APPROVED verification status to book vehicle
   */
  const checkAccountVerification = async (): Promise<boolean> => {
    try {
      console.log(
        "🔍 [BookingPayment] Checking account verification status..."
      );

      // Try primary endpoint first
      let verificationData;
      try {
        verificationData = await authService.getAccountVerificationStatus();
      } catch (primaryError) {
        console.warn(
          "⚠️ [BookingPayment] Primary endpoint failed, trying fallback from /auth/me"
        );
        // Fallback to /auth/me endpoint
        verificationData =
          await authService.getAccountVerificationStatusFromMe();
      }

      console.log(
        "📋 [BookingPayment] Verification data received:",
        JSON.stringify(verificationData, null, 2)
      );
      console.log(
        "🎯 [BookingPayment] Verification Status:",
        verificationData.verificationStatus
      );
      console.log(
        "🖼️ [BookingPayment] Has Images:",
        verificationData.hasImages
      );

      // Check if verification is approved
      if (verificationData.verificationStatus !== "APPROVED") {
        console.log(
          "⚠️ [BookingPayment] Account not verified. Status:",
          verificationData.verificationStatus
        );

        let alertTitle = "Yêu cầu xác thực tài khoản";
        let alertMessage = "";
        let actionButtonText = "Xác thực ngay";

        if (verificationData.verificationStatus === "REJECTED") {
          alertMessage = `Tài khoản của bạn đã bị từ chối xác thực.\n\nLý do: ${
            verificationData.rejectionReason || "Không rõ"
          }\n\nVui lòng cập nhật lại thông tin và gửi lại yêu cầu xác thực.`;
          actionButtonText = "Gửi lại xác thực";
        } else if (verificationData.verificationStatus === "PENDING") {
          // Check if user has submitted documents
          const hasSubmittedDocuments =
            verificationData.hasImages.idCardFront ||
            verificationData.hasImages.idCardBack ||
            verificationData.hasImages.driverLicense ||
            verificationData.hasImages.selfiePhoto;

          console.log(
            "📄 [BookingPayment] Has submitted documents:",
            hasSubmittedDocuments
          );

          if (hasSubmittedDocuments) {
            alertMessage =
              "Tài khoản của bạn đang được xét duyệt.\n\nVui lòng đợi quản trị viên xác nhận hoặc liên hệ hỗ trợ để được xử lý nhanh hơn.";
            actionButtonText = "Liên hệ hỗ trợ";
          } else {
            alertMessage =
              "Bạn cần hoàn tất xác thực tài khoản (CMND/CCCD và GPLX) trước khi có thể đặt xe.";
            actionButtonText = "Xác thực ngay";
          }
        }

        console.log(
          "🚫 [BookingPayment] Showing alert:",
          alertTitle,
          alertMessage
        );
        Alert.alert(alertTitle, alertMessage, [
          {
            text: actionButtonText,
            onPress: () => {
              // Navigate to verification screen
              navigation.navigate("VerifyAccount" as never);
            },
          },
          {
            text: "Đóng",
            style: "cancel",
            onPress: () => navigation.goBack(),
          },
        ]);
        return false;
      }

      console.log(
        "✅ [BookingPayment] Account verification APPROVED! User can proceed with booking."
      );
      return true;
    } catch (error: any) {
      console.error(
        "❌ [BookingPayment] Account verification check failed:",
        error
      );
      console.error("❌ [BookingPayment] Error details:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      Alert.alert(
        "Lỗi kiểm tra xác thực",
        error.response?.data?.message ||
          error.message ||
          "Không thể kiểm tra trạng thái xác thực tài khoản. Vui lòng thử lại."
      );
      return false;
    }
  };

  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      const vehicleData = await vehicleService.getVehicleById(vehicleId);
      const uiVehicle = mapVehicleToUI(vehicleData);
      setVehicle(uiVehicle);
      await fetchBackendPricingWithVehicle(vehicleData);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin xe");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Pricing calculations
  const fetchBackendPricingWithVehicle = async (vehicleData: Vehicle) => {
    if (!vehicleData || !vehicleId) return;

    try {
      if (rentalType === "hourly" && parseInt(rentalHours) <= 0) {
        return;
      }
      if (rentalType === "daily") {
        const days = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (days <= 0) return;
      }

      setPricingLoading(true);
      const { startAt, endAt } = calculateBookingTimes();

      const pricingData = await bookingService.calculateBookingPrice({
        vehicleId,
        startAt,
        endAt,
        insurancePremium: false,
        currency: "VND",
      });

      const normalized = {
        totalPrice: pricingData.totalPrice || pricingData.total_price || 0,
        deposit: pricingData.deposit || 0,
        basePrice: pricingData.basePrice || pricingData.base_price || 0,
        taxes: pricingData.taxes || 0,
        insurancePrice:
          pricingData.insurancePrice || pricingData.insurance_price || 0,
        hourlyRate: pricingData.hourly_rate || 0,
        dailyRate: pricingData.daily_rate || 0,
      };

      if (!normalized.deposit && normalized.totalPrice > 0) {
        normalized.deposit = Math.round(normalized.totalPrice * 0.2);
      }

      setBackendPricing(normalized);
    } catch (error) {
      setBackendPricing(null);
    } finally {
      setPricingLoading(false);
    }
  };

  const fetchBackendPricing = async () => {
    if (!vehicle || !vehicleId) return;
    await fetchBackendPricingWithVehicle(vehicle);
  };

  const calculateBookingTimes = () => {
    if (rentalType === "hourly") {
      const hours = parseInt(rentalHours) || 0;
      if (hours <= 0) {
        throw new Error("Vui lòng nhập số giờ thuê hợp lệ (> 0)");
      }

      // Combine pickupDate + pickupTime
      const startAt = new Date(pickupDate);
      startAt.setHours(pickupTime.hour, pickupTime.minute, 0, 0);

      const endAt = new Date(startAt);
      endAt.setHours(endAt.getHours() + hours);

      return {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };
    } else {
      // Combine startDate + startTime
      const startAt = new Date(startDate);
      startAt.setHours(startTime.hour, startTime.minute, 0, 0);

      // Combine endDate + same time as start (not end of day)
      const endAt = new Date(endDate);
      endAt.setHours(startTime.hour, startTime.minute, 0, 0);

      // Validate end is after start
      if (endAt <= startAt) {
        throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu");
      }

      return {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };
    }
  };

  // Date handlers
  const onStartDateChange = (selectedDate: Date) => {
    setStartDate(selectedDate);
    if (selectedDate >= endDate) {
      setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const onEndDateChange = (selectedDate: Date) => {
    setEndDate(selectedDate);
  };

  // Booking creation
  const createBooking = async (): Promise<{
    bookingId: string;
    deposit: number;
  }> => {
    try {
      const latestVehicle = await vehicleService.getVehicleById(vehicleId);
      const uiVehicle = mapVehicleToUI(latestVehicle);
      setVehicle(uiVehicle);

      if (!latestVehicle) {
        throw new Error("Không tìm thấy thông tin xe");
      }

      if (!latestVehicle.station_id) {
        throw new Error(
          "Xe chưa được gán trạm. Vui lòng liên hệ quản trị viên."
        );
      }

      if (
        latestVehicle.status !== "AVAILABLE" &&
        latestVehicle.status !== "RESERVED"
      ) {
        throw new Error(
          `Xe không khả dụng. Trạng thái: ${latestVehicle.status}.`
        );
      }

      const { startAt, endAt } = calculateBookingTimes();

      const pricingData = await bookingService.calculateBookingPrice({
        vehicleId,
        startAt,
        endAt,
        insurancePremium: false,
        currency: "VND",
      });

      const normalizedPricing = {
        deposit: pricingData.deposit || 0,
        totalPrice: pricingData.totalPrice || pricingData.total_price || 0,
        basePrice: pricingData.basePrice || pricingData.base_price || 0,
        insurancePrice:
          pricingData.insurancePrice || pricingData.insurance_price || 0,
        taxes: pricingData.taxes || 0,
        hourly_rate: pricingData.hourly_rate || 0,
        daily_rate: pricingData.daily_rate || 0,
        currency: pricingData.currency || "VND",
        details: pricingData.details || {
          rawBase: pricingData.basePrice || pricingData.base_price || 0,
          rentalType,
          hours: 0,
          days: 0,
        },
        policy_version: pricingData.policy_version || "v1.0",
      };

      let depositAmount = normalizedPricing.deposit;
      if (!depositAmount || depositAmount <= 0) {
        depositAmount = Math.round(normalizedPricing.totalPrice * 0.2);
      }

      const bookingData: CreateBookingRequest = {
        vehicleId,
        stationId: latestVehicle.station_id,
        startAt,
        endAt,
        pricing_snapshot: {
          hourly_rate: normalizedPricing.hourly_rate,
          daily_rate: normalizedPricing.daily_rate,
          currency: normalizedPricing.currency,
          deposit: depositAmount,
          total_price: normalizedPricing.totalPrice,
          base_price: normalizedPricing.basePrice,
          insurance_price: normalizedPricing.insurancePrice,
          taxes: normalizedPricing.taxes,
          details: {
            rawBase:
              normalizedPricing.details.rawBase || normalizedPricing.basePrice,
            rentalType: normalizedPricing.details.rentalType || rentalType,
            hours: normalizedPricing.details.hours || 0,
            days: normalizedPricing.details.days || 0,
          },
          policy_version: normalizedPricing.policy_version,
        },
        agreement: { accepted: true },
        insuranceOption: { premium: false },
      };

      const booking = await bookingService.createBooking(bookingData);

      if (!booking || !booking._id) {
        throw new Error("Booking không được tạo thành công");
      }

      return { bookingId: booking._id, deposit: depositAmount };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo booking";
      throw new Error(errorMessage);
    }
  };

  // Payment handling
  const handleVNPAYPayment = async () => {
    setIsProcessing(true);
    try {
      if (rentalType === "hourly" && parseInt(rentalHours) <= 0) {
        throw new Error("Vui lòng nhập số giờ thuê hợp lệ");
      }
      if (rentalType === "daily") {
        const days = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (days <= 0) {
          throw new Error("Vui lòng chọn ngày kết thúc sau ngày bắt đầu");
        }
      }

      const result = await createBooking();
      if (!result || !result.bookingId) {
        throw new Error("Không thể tạo booking");
      }

      const response = await paymentService.createVNPAYDeposit(
        result.bookingId,
        result.deposit
      );

      if (response?.checkoutUrl) {
        setIsProcessing(false);
        // @ts-ignore
        navigation.navigate("VNPAYWebView", {
          paymentUrl: response.checkoutUrl,
          bookingId: result.bookingId,
          amount: result.deposit,
          vehicleName: vehicle?.name || "Xe",
        });
      } else {
        throw new Error("Không nhận được URL thanh toán");
      }
    } catch (error: any) {
      setIsProcessing(false);
      setModalType("error");
      setModalTitle("Thanh toán thất bại");
      setModalMessage(
        error.response?.data?.message ||
          error.message ||
          "Không thể khởi tạo thanh toán."
      );
      setModalVisible(true);
    }
  };

  const handleConfirmBooking = async () => {
    // Step 1: Check if user is authenticated
    const isAuth = await checkAuthentication();
    if (!isAuth) return;

    // Step 2: Check if user account is verified (document verification)
    const isVerified = await checkAccountVerification();
    if (!isVerified) return;

    // Step 3: Proceed with payment
    await handleVNPAYPayment();
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      }, 300);
    }
  };

  // Render loading state
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
            <ActivityIndicator size="large" color={COLORS.primary} />
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
        {/* Header */}
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

        {/* Content */}
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Vehicle Info */}
          <VehicleInfoCard vehicle={vehicle} />

          {/* Rental Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết thuê xe</Text>

            <RentalTypeSelector
              rentalType={rentalType}
              onSelect={setRentalType}
            />

            {rentalType === "hourly" ? (
              <HourlyRentalInput
                rentalHours={rentalHours}
                onChangeHours={setRentalHours}
                onQuickSelect={(hours) => setRentalHours(hours.toString())}
                stationLocation={stationLocation}
                pickupDate={pickupDate}
                onPickupDateChange={setPickupDate}
                pickupTime={pickupTime}
                onPickupTimeChange={(hour, minute) =>
                  setPickupTime({ hour, minute })
                }
              />
            ) : (
              <DailyRentalInput
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={onStartDateChange}
                onEndDateChange={onEndDateChange}
                stationLocation={stationLocation}
                startTime={startTime}
                onStartTimeChange={(hour, minute) =>
                  setStartTime({ hour, minute })
                }
              />
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentOption}>
              <Ionicons name="logo-usd" size={28} color={COLORS.primary} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>VNPAY</Text>
                <Text style={styles.paymentDesc}>
                  Thanh toán nhanh qua cổng VNPAY
                </Text>
              </View>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <PricingSummary
              rentalType={rentalType}
              rentalHours={rentalHours}
              startDate={startDate}
              endDate={endDate}
              basePrice={backendPricing?.basePrice || 0}
              taxes={backendPricing?.taxes || 0}
              insurancePrice={backendPricing?.insurancePrice || 0}
              totalPrice={backendPricing?.totalPrice || 0}
              deposit={backendPricing?.deposit || 0}
              hourlyRate={backendPricing?.hourlyRate}
              dailyRate={backendPricing?.dailyRate}
              loading={pricingLoading}
            />
          </View>

          <View style={{ height: 150 }} />
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Tổng thanh toán</Text>
            <Text style={styles.priceValue}>
              {pricingLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : backendPricing?.totalPrice ? (
                `${backendPricing.totalPrice.toLocaleString("vi-VN")} VND`
              ) : (
                "Đang tính..."
              )}
            </Text>
            <Text style={styles.depositSubLabel}>
              (Tiền cọc{" "}
              {backendPricing?.deposit
                ? `${backendPricing.deposit.toLocaleString("vi-VN")} VND`
                : ""}{" "}
              - Thanh toán trước)
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              isProcessing && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmBooking}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.processingText}>Đang xử lý...</Text>
              </>
            ) : (
              <Text style={styles.confirmButtonText}>Xác nhận đặt xe</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Status Modal */}
        <StatusModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={handleModalClose}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.body,
    color: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: "rgba(41, 121, 255, 0.05)",
  },
  paymentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentTitle: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  paymentDesc: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    paddingVertical: SPACING.xl,
    paddingTop: SPACING.sm,
    ...SHADOWS.md,
  },
  priceContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  priceLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  priceValue: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.primary,
  },
  depositSubLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: "italic",
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
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
    marginLeft: SPACING.sm,
  },
});

export default BookingPaymentScreen;
