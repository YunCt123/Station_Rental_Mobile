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
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const [selectedPayment, setSelectedPayment] = useState<"vnpay" | null>(
    "vnpay"
  ); // Only VNPAY is supported in backend
  const [rentalType, setRentalType] = useState<"hourly" | "daily">("hourly");
  const [rentalHours, setRentalHours] = useState("4");
  const [pickupTime, setPickupTime] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  ); // +1 day
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [pickupDateTime, setPickupDateTime] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [calculatedDeposit, setCalculatedDeposit] = useState<number>(0); // 💰 Lưu deposit đã tính

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Load vehicle details
  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);

  // Reset form when screen gains focus (user comes back from payment)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("📱 Screen focused - resetting payment state");
      setIsProcessing(false);
      setCreatedBookingId(null);
      // Keep other fields (rentalHours, dates) so user doesn't have to re-enter
    });

    return unsubscribe;
  }, [navigation]);

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

  // Calculate total price (estimate for UI display)
  // Note: Actual pricing will be calculated by backend with business rules
  const calculateTotal = () => {
    if (!vehicle) return 0;

    if (rentalType === "hourly") {
      const hours = parseInt(rentalHours) || 0;
      const hourlyRate = vehicle.pricing?.hourly || vehicle.pricePerHour || 0;
      return hours * hourlyRate;
    } else {
      // Calculate days from date range
      const days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const dailyRate = vehicle.pricing?.daily || vehicle.pricePerDay || 0;
      return days * dailyRate;
    }
  };

  // Calculate booking times
  const calculateBookingTimes = () => {
    if (rentalType === "hourly") {
      // For hourly: start from now
      const hours = parseInt(rentalHours) || 0;

      console.log("📅 Calculating hourly times:", {
        rentalHours,
        parsedHours: hours,
        isValid: hours > 0,
      });

      if (hours <= 0) {
        throw new Error("Vui lòng nhập số giờ thuê hợp lệ (> 0)");
      }

      const startAt = new Date();
      const endAt = new Date(startAt);
      endAt.setHours(endAt.getHours() + hours);

      return {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };
    } else {
      // For daily: use selected date range
      const days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log("📅 Calculating daily times:", {
        startDate,
        endDate,
        days,
        isValid: days > 0,
      });

      if (days <= 0) {
        throw new Error("Vui lòng chọn ngày kết thúc sau ngày bắt đầu");
      }

      // Set start date to 00:00:00
      const startAt = new Date(startDate);
      startAt.setHours(0, 0, 0, 0);

      // Set end date to 23:59:59
      const endAt = new Date(endDate);
      endAt.setHours(23, 59, 59, 999);

      return {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };
    }
  };

  // Handle start date change (for daily rental)
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
      // Auto-adjust end date if it's before start date
      if (selectedDate > endDate) {
        setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
      }
    }
  };

  // Handle end date change (for daily rental)
  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      // Ensure end date is after start date
      if (selectedDate > startDate) {
        setEndDate(selectedDate);
      } else {
        Alert.alert("Lỗi", "Ngày kết thúc phải sau ngày bắt đầu");
      }
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Handle pickup time change
  const onPickupTimeChange = (event: any, selectedTime?: Date) => {
    setShowPickupTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setPickupDateTime(selectedTime);
      setPickupTime(formatTime(selectedTime));
    }
  };

  // Quick select hours
  const selectQuickHours = (hours: number) => {
    setRentalHours(hours.toString());
  };

  /** --- CREATE BOOKING FIRST --- **/
  const createBooking = async (): Promise<{
    bookingId: string;
    deposit: number;
  }> => {
    try {
      // 🔄 Reload vehicle data to get latest status
      console.log("🔄 Reloading vehicle data before booking...");
      const latestVehicle = await vehicleService.getVehicleById(vehicleId);

      // Log vehicle data để debug
      console.log("🚗 Vehicle data:", {
        _id: latestVehicle?._id,
        name: latestVehicle?.name,
        status: latestVehicle?.status,
        station_id: latestVehicle?.station_id,
        station_name: latestVehicle?.station_name,
      });

      // Update vehicle state with latest data
      setVehicle(latestVehicle);

      if (!latestVehicle) {
        throw new Error("Không tìm thấy thông tin xe");
      }

      // ✅ Kiểm tra station_id - backend đã fix nên giờ sẽ có
      if (!latestVehicle.station_id) {
        console.error("❌ Vehicle vẫn không có station_id sau khi fix backend");
        throw new Error(
          "Xe chưa được gán trạm. Vui lòng liên hệ quản trị viên."
        );
      }

      console.log("✅ Station ID:", latestVehicle.station_id);

      // Check if vehicle is available or already reserved by this booking attempt
      if (
        latestVehicle.status !== "AVAILABLE" &&
        latestVehicle.status !== "RESERVED"
      ) {
        throw new Error(
          `Xe không khả dụng. Trạng thái: ${latestVehicle.status}. Vui lòng chọn xe khác.`
        );
      }

      // If vehicle is RESERVED, show warning but allow retry (might be from previous failed attempt)
      if (latestVehicle.status === "RESERVED") {
        console.warn(
          "⚠️ Vehicle is RESERVED, attempting to create booking anyway..."
        );
      }

      const { startAt, endAt } = calculateBookingTimes();

      console.log("📅 Booking times:", { startAt, endAt, rentalType });

      // Step 1: Call backend calculateBookingPrice API to get accurate pricing
      // Backend will calculate with business rules (peak hours, weekends, etc.)
      const pricingData = await bookingService.calculateBookingPrice({
        vehicleId: vehicleId,
        startAt,
        endAt,
        insurancePremium: false, // Can be made configurable
        currency: "VND",
      });

      console.log("💰 Backend calculated pricing:", {
        deposit: pricingData.deposit,
        totalPrice: pricingData.totalPrice || pricingData.total_price,
        basePrice: pricingData.basePrice || pricingData.base_price,
        insurancePrice:
          pricingData.insurancePrice || pricingData.insurance_price,
        taxes: pricingData.taxes,
        hourlyRate: pricingData.hourly_rate,
        dailyRate: pricingData.daily_rate,
        currency: pricingData.currency,
        details: pricingData.details,
      });

      // ✅ Normalize response: backend may return both camelCase and snake_case
      const normalizedPricing = {
        deposit: pricingData.deposit || 0,
        totalPrice: pricingData.totalPrice || pricingData.total_price || 0,
        basePrice: pricingData.basePrice || pricingData.base_price || 0,
        insurancePrice:
          pricingData.insurancePrice || pricingData.insurance_price || 0,
        taxes: pricingData.taxes || 0,
        hourly_rate: pricingData.hourly_rate || pricingData.hourlyRate || 0,
        daily_rate: pricingData.daily_rate || pricingData.dailyRate || 0,
        currency: pricingData.currency || "VND",
        details: pricingData.details || {
          rawBase: pricingData.basePrice || pricingData.base_price || 0,
          rentalType: rentalType,
          hours: 0,
          days: 0,
        },
        policy_version: pricingData.policy_version || "v1.0",
      };

      // ✅ Calculate deposit if backend doesn't provide it (should be 20% of total)
      let depositAmount = normalizedPricing.deposit;
      if (!depositAmount || depositAmount <= 0) {
        depositAmount = Math.round(normalizedPricing.totalPrice * 0.2);
        console.log("⚠️ Backend deposit is 0, calculating 20% of total:", {
          totalPrice: normalizedPricing.totalPrice,
          calculatedDeposit: depositAmount,
        });
      }

      // � LƯU deposit để dùng lại trong payment (tránh duplicate API call)
      setCalculatedDeposit(depositAmount);

      // �🔥 Step 2: Create booking with backend-calculated pricing
      const bookingData: CreateBookingRequest = {
        vehicleId: vehicleId,
        stationId: latestVehicle.station_id, // ✅ Backend đã fix, giờ có station_id
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
        agreement: {
          accepted: true,
        },
        // Backend only accepts premium flag, not note field
        insuranceOption: {
          premium: false,
        },
      };

      console.log(
        "Creating booking with data:",
        JSON.stringify(bookingData, null, 2)
      );
      const booking = await bookingService.createBooking(bookingData);

      // Verify booking was created successfully
      if (!booking || !booking._id) {
        throw new Error("Booking không được tạo thành công");
      }

      console.log("Booking created:", booking);
      return { bookingId: booking._id, deposit: depositAmount };
    } catch (error: any) {
      console.error("Error creating booking:", error);
      // Extract error message from API response
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo booking";
      throw new Error(errorMessage);
    }
  };

  /** --- HANDLE PAYOS PAYMENT --- **/
  const handlePayOSPayment = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Create booking with status HELD
      const result = await createBooking();
      if (!result || !result.bookingId) {
        throw new Error("Không thể tạo booking");
      }

      setCreatedBookingId(result.bookingId);

      // Step 2: Create PayOS payment (NOT VNPay!)
      const amount = calculateTotal();
      console.log(
        "[handlePayOSPayment] Creating PayOS payment with amount:",
        amount
      );

      const response = await paymentService.createPayOSPayment({
        bookingId: result.bookingId,
        amount: amount,
        returnUrl: `myapp://payment/result?bookingId=${result.bookingId}`,
        cancelUrl: `myapp://payment/cancel?bookingId=${result.bookingId}`,
      });

      console.log(
        "[handlePayOSPayment] Full payment response:",
        JSON.stringify(response, null, 2)
      );

      // Backend returns: { payment, checkoutUrl, transaction_ref }
      const checkoutUrl = response?.checkoutUrl;

      console.log("[handlePayOSPayment] Checkout URL:", checkoutUrl);

      // Step 3: Navigate to PayOS WebView
      if (checkoutUrl) {
        setIsProcessing(false);

        console.log(
          "[handlePayOSPayment] Navigating to PayOSWebView with URL:",
          checkoutUrl
        );

        navigation.navigate("PayOSWebView", {
          paymentUrl: checkoutUrl,
          bookingId: result.bookingId,
          amount: amount,
          vehicleName: vehicle?.name || "Xe",
        });
      } else {
        console.error(
          "[handlePayOSPayment] No checkoutUrl in response:",
          response
        );
        throw new Error("Không nhận được URL thanh toán từ PayOS");
      }
    } catch (error: any) {
      console.error("[handlePayOSPayment] Error:", error);
      console.error(
        "[handlePayOSPayment] Error response:",
        error.response?.data
      );
      console.error("[handlePayOSPayment] Error message:", error.message);
      setIsProcessing(false);

      // Extract error message from API response
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể khởi tạo thanh toán";

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
      // ✅ Validate thông tin trước khi tính toán
      if (rentalType === "hourly") {
        const hours = parseInt(rentalHours) || 0;
        if (hours <= 0) {
          throw new Error("Vui lòng nhập số giờ thuê hợp lệ");
        }
      } else {
        const days = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (days <= 0) {
          throw new Error("Vui lòng chọn ngày kết thúc sau ngày bắt đầu");
        }
      }

      // 🔥 Tính deposit mỗi lần user bấm
      const { startAt, endAt } = calculateBookingTimes();

      console.log("[handleVNPAYPayment] Calculating pricing with:", {
        vehicleId,
        startAt,
        endAt,
        rentalType,
      });

      const pricingData = await bookingService.calculateBookingPrice({
        vehicleId: vehicleId,
        startAt,
        endAt,
        insurancePremium: false,
        currency: "VND",
      });

      console.log("[handleVNPAYPayment] Backend pricing response:", {
        totalPrice: pricingData.totalPrice || pricingData.total_price,
        basePrice: pricingData.basePrice || pricingData.base_price,
        deposit: pricingData.deposit,
        hourlyRate: pricingData.hourly_rate,
        details: pricingData.details,
      });

      // Normalize response: backend may return both camelCase and snake_case
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
          rentalType: rentalType,
          hours: 0,
          days: 0,
        },
        policy_version: pricingData.policy_version || "v1.0",
      };

      if (!normalizedPricing.totalPrice || normalizedPricing.totalPrice <= 0) {
        console.error(
          "[handleVNPAYPayment] Backend returned invalid pricing:",
          {
            fullResponse: pricingData,
            normalizedPricing,
            vehicleId,
            vehicleName: vehicle?.name,
            vehicleHourlyRate:
              vehicle?.pricing?.hourly || vehicle?.pricePerHour,
            vehicleDailyRate: vehicle?.pricing?.daily || vehicle?.pricePerDay,
          }
        );

        // Check if it's a backend validation error (will have better message)
        const backendError = pricingData?.message || pricingData?.error;
        if (backendError) {
          throw new Error(backendError);
        }

        // Generic error if no backend message
        throw new Error(
          `Xe "${vehicle?.name || "này"}" chưa có giá thuê.\n\n` +
            `Vui lòng chọn xe khác hoặc liên hệ quản trị viên để cập nhật giá cho xe này.`
        );
      }

      // Calculate deposit (20% of total)
      let depositAmount = normalizedPricing.deposit;
      if (!depositAmount || depositAmount <= 0) {
        depositAmount = Math.round(normalizedPricing.totalPrice * 0.2);
        console.log(
          "[handleVNPAYPayment] Backend deposit is 0, calculating 20%:",
          {
            totalPrice: normalizedPricing.totalPrice,
            deposit: depositAmount,
          }
        );
      }

      console.log("[handleVNPAYPayment] Calculated deposit:", depositAmount);

      // Validate deposit
      if (!depositAmount || depositAmount <= 0) {
        throw new Error(
          `Số tiền đặt cọc không hợp lệ (${depositAmount}). Vui lòng thử lại.`
        );
      }

      // Save deposit to use in createBooking()
      setCalculatedDeposit(depositAmount);

      // Create booking (will return {bookingId, deposit})
      const result = await createBooking();
      if (!result || !result.bookingId) {
        throw new Error("Không thể tạo booking");
      }
      setCreatedBookingId(result.bookingId);

      console.log(
        "[handleVNPAYPayment] Creating VNPay payment with deposit:",
        result.deposit
      );

      const response = await paymentService.createVNPAYDeposit(
        result.bookingId,
        result.deposit
      );

      console.log("[handleVNPAYPayment] Response:", response);

      if (response?.checkoutUrl) {
        setIsProcessing(false);
        // @ts-ignore - navigation type issue
        navigation.navigate("VNPAYWebView", {
          paymentUrl: response.checkoutUrl,
          bookingId: result.bookingId,
          amount: calculateTotal(), // Display full amount for user reference
          vehicleName: vehicle?.name || "Xe",
        });
      } else {
        throw new Error("Không nhận được URL thanh toán");
      }
    } catch (error: any) {
      console.error("Lỗi VNPAY:", error);
      console.error("Chi tiết lỗi:", error.response?.data);
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

    // Only VNPAY is supported
    await handleVNPAYPayment();
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
                  {hourlyRate.toLocaleString("vi-VN")} VND
                </Text>
                <Text style={styles.rateUnit}>/giờ</Text>
              </View>
            </View>
          </View>

          {/* RENTAL DETAILS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết thuê xe</Text>

            {/* Rental Type Selector */}
            <View style={styles.rentalTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.rentalTypeButton,
                  rentalType === "hourly" && styles.rentalTypeButtonActive,
                ]}
                onPress={() => setRentalType("hourly")}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={
                    rentalType === "hourly" ? COLORS.white : COLORS.primary
                  }
                />
                <Text
                  style={[
                    styles.rentalTypeText,
                    rentalType === "hourly" && styles.rentalTypeTextActive,
                  ]}
                >
                  Thuê theo giờ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rentalTypeButton,
                  rentalType === "daily" && styles.rentalTypeButtonActive,
                ]}
                onPress={() => setRentalType("daily")}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={rentalType === "daily" ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.rentalTypeText,
                    rentalType === "daily" && styles.rentalTypeTextActive,
                  ]}
                >
                  Thuê theo ngày
                </Text>
              </TouchableOpacity>
            </View>

            {/* Rental Duration Input */}
            {rentalType === "hourly" ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Thời gian thuê (giờ)</Text>

                  {/* Quick Select Buttons */}
                  <View style={styles.quickSelectContainer}>
                    {[4, 8, 12, 24].map((hours) => (
                      <TouchableOpacity
                        key={hours}
                        style={[
                          styles.quickSelectButton,
                          rentalHours === hours.toString() &&
                            styles.quickSelectButtonActive,
                        ]}
                        onPress={() => selectQuickHours(hours)}
                      >
                        <Text
                          style={[
                            styles.quickSelectText,
                            rentalHours === hours.toString() &&
                              styles.quickSelectTextActive,
                          ]}
                        >
                          {hours}h
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Custom Input */}
                  <TextInput
                    style={styles.input}
                    value={rentalHours}
                    onChangeText={setRentalHours}
                    keyboardType="numeric"
                    placeholder="Hoặc nhập số giờ tùy chỉnh"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Giờ nhận xe</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowPickupTimePicker(true)}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.dateTimeButtonText}>
                      {pickupTime || formatTime(pickupDateTime)}
                    </Text>
                  </TouchableOpacity>

                  {showPickupTimePicker && (
                    <DateTimePicker
                      value={pickupDateTime}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={onPickupTimeChange}
                    />
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ngày bắt đầu</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.dateTimeButtonText}>
                      {formatDate(startDate)}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ngày kết thúc</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.dateTimeButtonText}>
                      {formatDate(endDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

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

            {/* VNPAY - Only payment method supported by backend */}
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
                {rentalType === "hourly"
                  ? `${hourlyRate.toLocaleString("vi-VN")} VND/giờ`
                  : `${(
                      vehicle?.pricing?.daily ||
                      vehicle?.pricePerDay ||
                      0
                    ).toLocaleString("vi-VN")} VND/ngày`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thời gian thuê</Text>
              <Text style={styles.summaryValue}>
                {rentalType === "hourly"
                  ? `${rentalHours} giờ`
                  : `${Math.ceil(
                      (endDate.getTime() - startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} ngày`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {calculateTotal().toLocaleString("vi-VN")} VND
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
              {calculateTotal().toLocaleString("vi-VN")} VND
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
              <ActivityIndicator color={COLORS.primary} />
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

        {/* Date Pickers for Daily Rental */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onStartDateChange}
            minimumDate={new Date()}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onEndDateChange}
            minimumDate={startDate}
          />
        )}
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
  rentalTypeContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  rentalTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
  },
  rentalTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rentalTypeText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.primary,
  },
  rentalTypeTextActive: {
    color: COLORS.white,
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
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADII.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dateTimeButtonText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "500",
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
    color: COLORS.primary,
    fontSize: FONTS.body,
    marginTop: SPACING.md,
  },
  quickSelectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  quickSelectButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  quickSelectButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  quickSelectText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  quickSelectTextActive: {
    color: COLORS.white,
  },
});

export default BookingPaymentScreen;
