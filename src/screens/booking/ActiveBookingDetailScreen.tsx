import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import {
  getBookingStatusLabel,
  getBookingStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "../../utils/statusHelper";
// ❌ REMOVED QR Code imports - no longer needed
// import QRCodeModal from "../../components/common/QRCodeModal";
// import QRCode from "react-native-qrcode-svg";
import StatusModal from "../../components/common/StatusModal";
import { bookingService } from "../../services/bookingService";
import { Booking } from "../../types/booking";

interface RouteParams {
  bookingId: string;
}

const ActiveBookingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { bookingId } = route.params;

  // ❌ REMOVED QR Modal state - no longer needed
  // const [qrModalVisible, setQrModalVisible] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load booking details from API
  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      console.log("[ActiveBookingDetail] Loading booking:", bookingId);
      const data = await bookingService.getBookingById(bookingId);
      console.log("[ActiveBookingDetail] Booking data:", data);
      setBooking(data);
    } catch (error: any) {
      console.error("[ActiveBookingDetail] Error loading booking:", error);
      setErrorMessage("Không thể tải thông tin đặt chỗ. Vui lòng thử lại.");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to extract data from booking
  const getVehicleImage = () => {
    if (!booking) return "https://via.placeholder.com/400x200?text=Vehicle";
    return (
      (booking.vehicle_snapshot as any)?.image ||
      (booking.vehicle_id as any)?.image ||
      (booking.vehicle_id as any)?.images?.[0] ||
      "https://via.placeholder.com/400x200?text=Vehicle"
    );
  };

  const getVehicleName = () => {
    if (!booking) return "";
    return (
      booking.vehicle_snapshot?.name ||
      (booking.vehicle_id as any)?.name ||
      "Xe điện"
    );
  };

  const getVehicleModel = () => {
    if (!booking) return "";
    const brand =
      booking.vehicle_snapshot?.brand ||
      (booking.vehicle_id as any)?.brand ||
      "";
    const model =
      booking.vehicle_snapshot?.model ||
      (booking.vehicle_id as any)?.model ||
      "";
    return `${brand} ${model}`.trim();
  };

  const getStationName = () => {
    if (!booking) return "";
    return (
      booking.station_snapshot?.name ||
      (booking.station_id as any)?.name ||
      "Trạm sạc"
    );
  };

  const getStationAddress = () => {
    if (!booking) return "";
    const snapshot = booking.station_snapshot;
    const stationObj = booking.station_id as any;

    if (snapshot?.address) {
      return `${snapshot.address}, ${snapshot.city || ""}`.trim();
    }
    if (stationObj?.address) {
      return `${stationObj.address}, ${stationObj.city || ""}`.trim();
    }
    return "";
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return { date: "", time: "" };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const calculateHours = () => {
    if (!booking || !booking.start_at || !booking.end_at) return 0;
    const start = new Date(booking.start_at);
    const end = new Date(booking.end_at);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.round(hours * 10) / 10; // Round to 1 decimal
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    Alert.alert(
      "Hủy đặt chỗ",
      "Bạn có chắc chắn muốn hủy đặt chỗ này? Tiền sẽ được hoàn lại trong 3-5 ngày làm việc.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đặt chỗ",
          style: "destructive",
          onPress: async () => {
            try {
              await bookingService.cancelBooking(booking._id, {
                bookingId: booking._id,
                reason: "Người dùng hủy",
                cancelledBy: "USER",
              });
              Alert.alert("Thành công", "Đã hủy đặt chỗ thành công", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Không thể hủy đặt chỗ");
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert("Hỗ trợ", "Hotline: 1900-xxxx\nEmail: support@station.vn");
  };

  const getStatusInfo = () => {
    if (!booking)
      return {
        label: "",
        color: COLORS.textSecondary,
        icon: "information-circle",
      };

    const status = booking.status;
    const label = getBookingStatusLabel(
      status as "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED"
    );
    const color = getBookingStatusColor(
      status as "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED"
    );

    const iconMap = {
      CONFIRMED: "checkmark-circle",
      HELD: "time",
      CANCELLED: "close-circle",
      EXPIRED: "alert-circle",
    };

    return {
      label,
      color,
      icon:
        iconMap[status as keyof typeof iconMap] ||
        ("information-circle" as any),
    };
  };

  const getPaymentStatusInfo = () => {
    if (!booking?.payment)
      return {
        label: "Chưa có thông tin",
        color: COLORS.textSecondary,
        icon: "help-circle",
      };

    const status = booking.payment.status;
    const label = getPaymentStatusLabel(status);
    const color = getPaymentStatusColor(status);

    const iconMap = {
      PENDING: "time-outline",
      SUCCESS: "checkmark-circle-outline",
      FAILED: "close-circle-outline",
    };

    return {
      label,
      color,
      icon: iconMap[status] || ("help-circle-outline" as any),
    };
  };

  if (loading) {
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
            <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
            <View style={styles.menuButton} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!booking) {
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
            <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
            <View style={styles.menuButton} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              Không tìm thấy thông tin đặt chỗ
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo();
  const startDateTime = formatDateTime(booking.start_at || booking.startAt);
  const endDateTime = formatDateTime(booking.end_at || booking.endAt);
  const totalHours = calculateHours();
  
  // 💰 Pricing information from backend
  const pricingSnapshot = booking.pricing_snapshot;
  const basePrice = pricingSnapshot?.base_price || 0;
  const taxes = pricingSnapshot?.taxes || 0;
  const insurancePrice = pricingSnapshot?.insurance_price || 0;
  const totalPrice = pricingSnapshot?.total_price || booking.totalPrice || 0;
  const depositAmount = pricingSnapshot?.deposit || 0;
  const remainingAmount = totalPrice - depositAmount;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradient_4} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleContactSupport}
          >
            <Ionicons
              name="help-circle-outline"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: `${statusInfo.color}15` },
            ]}
          >
            <Ionicons
              name={statusInfo.icon as any}
              size={24}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>

          {/* Vehicle Card */}
          <View style={styles.card}>
            <Image
              source={{ uri: getVehicleImage() }}
              style={styles.vehicleImage}
            />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{getVehicleName()}</Text>
              <Text style={styles.vehicleModel}>{getVehicleModel()}</Text>
              <View style={styles.detailRow}>
                <Ionicons
                  name="car-outline"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.detailText}>
                  {(booking.vehicle_id as any)?.license_plate || "N/A"}
                </Text>
              </View>
              {booking.vehicle_snapshot?.battery_kWh && (
                <View style={styles.detailRow}>
                  <Ionicons
                    name="battery-charging-outline"
                    size={16}
                    color={COLORS.success}
                  />
                  <Text style={styles.detailText}>
                    {booking.vehicle_snapshot.battery_kWh} kWh
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Booking Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin đặt chỗ</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons
                  name="barcode-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.infoLabelText}>Mã đặt chỗ</Text>
              </View>
              <Text style={styles.infoValue}>
                {booking._id.slice(-8).toUpperCase()}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.infoLabelText}>Ngày nhận xe</Text>
              </View>
              <Text style={styles.infoValue}>
                {startDateTime.date} {startDateTime.time}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.infoLabelText}>Ngày trả xe</Text>
              </View>
              <Text style={styles.infoValue}>
                {endDateTime.date} {endDateTime.time}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.infoLabelText}>Thời gian thuê</Text>
              </View>
              <Text style={styles.infoValue}>{totalHours} giờ</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.infoLabelText}>Địa điểm</Text>
              </View>
              <Text style={[styles.infoValue, styles.locationText]}>
                {getStationName()}
              </Text>
            </View>
            <Text style={styles.addressText}>{getStationAddress()}</Text>
          </View>

          {/* Payment Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>

            {/* Payment Method */}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phương thức</Text>
              <View style={styles.paymentMethodBadge}>
                <Ionicons
                  name="logo-usd"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.paymentMethodText}>
                  VNPAY
                </Text>
              </View>
            </View>

            {/* Payment Status */}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Trạng thái thanh toán</Text>
              <View style={styles.paidBadge}>
                <Ionicons
                  name={getPaymentStatusInfo().icon as any}
                  size={16}
                  color={getPaymentStatusInfo().color}
                />
                <Text
                  style={[
                    styles.paidText,
                    { color: getPaymentStatusInfo().color },
                  ]}
                >
                  {getPaymentStatusInfo().label}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 💰 Chi tiết giá - Price Breakdown */}
            <Text style={styles.breakdownTitle}>Chi tiết giá thuê</Text>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Giá cơ bản</Text>
              <Text style={styles.paymentValue}>
                {basePrice.toLocaleString("vi-VN")} VND
              </Text>
            </View>

            {taxes > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Thuế & phí</Text>
                <Text style={styles.paymentValue}>
                  {taxes.toLocaleString("vi-VN")} VND
                </Text>
              </View>
            )}

            {insurancePrice > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Bảo hiểm</Text>
                <Text style={styles.paymentValue}>
                  {insurancePrice.toLocaleString("vi-VN")} VND
                </Text>
              </View>
            )}

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { fontWeight: '600' }]}>
                Tổng giá thuê
              </Text>
              <Text style={[styles.paymentValue, { fontWeight: '700', color: COLORS.primary }]}>
                {totalPrice.toLocaleString("vi-VN")} VND
              </Text>
            </View>

            <View style={styles.divider} />

            {/* 💰 Chi tiết thanh toán - Payment Details */}
            <Text style={styles.breakdownTitle}>Chi tiết thanh toán</Text>

            {/* Deposit Info - ✅ Số tiền đã thanh toán VNPay */}
            <View style={styles.paymentRow}>
              <View style={styles.paymentLabelWithNote}>
                <Text style={[styles.paymentLabel, styles.depositLabel]}>
                  💰 Tiền cọc{" "}
                  {totalPrice > 0 && depositAmount > 0
                    ? `(${Math.round((depositAmount / totalPrice) * 100)}%)`
                    : ""}
                </Text>
                {booking.payment?.status === "SUCCESS" && (
                  <Text style={styles.paymentNote}>
                    ✓ Đã thanh toán qua VNPAY
                  </Text>
                )}
                {booking.payment?.status === "PENDING" && (
                  <Text style={[styles.paymentNote, { color: COLORS.warning }]}>
                    ⏳ Chờ thanh toán
                  </Text>
                )}
              </View>
              <Text style={[styles.paymentValue, styles.depositValue]}>
                {depositAmount.toLocaleString("vi-VN")} VND
              </Text>
            </View>

            {/* Remaining Payment - ✅ Số tiền phải trả khi trả xe */}
            <View style={styles.paymentRow}>
              <View style={styles.paymentLabelWithNote}>
                <Text style={[styles.paymentLabel, styles.remainingLabel]}>
                  🔄 Còn lại{" "}
                  {totalPrice > 0 && remainingAmount > 0
                    ? `(${Math.round((remainingAmount / totalPrice) * 100)}%)`
                    : ""}
                </Text>
                <Text style={styles.paymentNote}>
                  Thanh toán trực tiếp tại trạm khi trả xe
                </Text>
              </View>
              <Text style={styles.paymentValue}>
                {remainingAmount.toLocaleString("vi-VN")} VND
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Total */}
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {totalPrice.toLocaleString("vi-VN")} VND
              </Text>
            </View>
          </View>

          {/* ❌ REMOVED QR Code Section - no longer needed for check-in */}
          {/* Staff will manually check-in customer at station */}
          {/* <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mã QR nhận xe</Text>
            ...QR code UI removed...
          </View> */}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Actions */}
        {(booking.status === "HELD" || booking.status === "CONFIRMED") && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelBooking}
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={COLORS.error}
              />
              <Text style={styles.cancelButtonText}>Hủy đặt chỗ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactSupport}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.contactButtonText}>Liên hệ hỗ trợ</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ❌ REMOVED QR Code Modal - no longer needed */}
        {/* <QRCodeModal ... /> */}

        {/* Error Modal */}
        <StatusModal
          visible={errorModalVisible}
          type="error"
          title="Lỗi"
          message={errorMessage}
          onClose={() => {
            setErrorModalVisible(false);
            navigation.goBack();
          }}
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
  menuButton: {
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
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  statusText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
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
    width: "100%",
    height: 200,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
  },
  vehicleInfo: {
    gap: SPACING.xs,
  },
  vehicleName: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  infoLabelText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 28,
  },
  locationText: {
    fontWeight: "700",
  },
  addressText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: 28,
    marginTop: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  paymentLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  paymentValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  paidText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.success,
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
  depositLabel: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  depositValue: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  remainingLabel: {
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  paymentLabelWithNote: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  paymentNote: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: "italic",
  },
  breakdownTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  paymentMethodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  paymentMethodText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.primary,
  },
  // ❌ REMOVED QR-related styles (qrContainer, qrCodeWrapper, qrText, qrButton, qrButtonText)
  // These are no longer needed since QR check-in has been removed
  /*
  qrContainer: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  qrCodeWrapper: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    ...SHADOWS.sm,
  },
  qrText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.button,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  qrButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.white,
  },
  */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl * 2,
  },
  loadingText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: SPACING.md,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xxl,
    flexDirection: "row",
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    backgroundColor: COLORS.white,
    marginTop: -SPACING.md,
    ...SHADOWS.sm,
  },
  cancelButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.error,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
    marginTop: -SPACING.md,
  },
  contactButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.white,
  },
});

export default ActiveBookingDetailScreen;
