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
import StatusModal from "../../components/common/StatusModal";
import InvoiceModal from "../../components/common/InvoiceModal";
import { bookingService } from "../../services/bookingService";
import { Booking } from "../../types/booking";

interface RouteParams {
  bookingId: string;
}

const HistoryBookingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { bookingId } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Load booking details from API
  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);const data = await bookingService.getBookingById(bookingId);setBooking(data);
    } catch (error: any) {Alert.alert("Lỗi", "Không thể tải thông tin đặt chỗ. Vui lòng thử lại.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
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

  const handleRateBooking = () => {
    Alert.alert(
      "Đánh giá phương tiện",
      "Chức năng đánh giá đang được phát triển",
      [{ text: "OK" }]
    );
  };

  const handleBookAgain = () => {
    setModalType("success");
    setModalVisible(true);
  };

  const handleViewInvoice = () => {
    setInvoiceModalVisible(true);
  };

  const handleModalActionPress = () => {
    setModalVisible(false);
    // Navigate to payment screen with vehicle info
    setTimeout(() => {
      (navigation as any).navigate("BookingPayment", {
        vehicleId: booking?.vehicle_id || "2", // Use actual vehicle ID if available
      });
    }, 300);
  };

  const handleReportIssue = () => {
    Alert.alert("Báo cáo vấn đề", "Bạn có vấn đề gì với chuyến đi này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xe bị hỏng" },
      { text: "Tính phí sai" },
      { text: "Vấn đề khác" },
    ]);
  };

  const getStatusInfo = () => {
    if (!booking)
      return {
        label: "",
        color: COLORS.textSecondary,
        icon: "information-circle",
      };

    switch (booking.status) {
      case "CANCELLED":
        return {
          label: "Đã hủy",
          color: COLORS.error,
          icon: "close-circle",
        };
      case "EXPIRED":
        return {
          label: "Đã hết hạn",
          color: COLORS.textSecondary,
          icon: "alert-circle",
        };
      case "CONFIRMED":
        return {
          label: "Hoàn thành",
          color: COLORS.success,
          icon: "checkmark-circle",
        };
      default:
        return {
          label: booking.status,
          color: COLORS.textSecondary,
          icon: "information-circle",
        };
    }
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
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết lịch sử</Text>
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
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết lịch sử</Text>
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
                    color={COLORS.primary}
                  />
                  <Text style={styles.detailText}>
                    Pin: {booking.vehicle_snapshot.battery_kWh} kWh
                  </Text>
                </View>
              )}
            </View>

            {/* Rating Section - For completed bookings only */}
            {booking.status === "CONFIRMED" && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.ratingButton}
                  onPress={handleRateBooking}
                >
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={"star-outline"}
                        size={24}
                        color={COLORS.textTertiary}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>Đánh giá phương tiện</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Trip Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin chuyến đi</Text>

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

            <View style={styles.tripTimeContainer}>
              <View style={styles.tripTimeRow}>
                <View style={styles.timePoint}>
                  <View
                    style={[
                      styles.timeDot,
                      { backgroundColor: COLORS.success },
                    ]}
                  />
                  <View style={styles.timeLine} />
                </View>
                <View style={styles.timeContent}>
                  <Text style={styles.timeLabel}>Bắt đầu</Text>
                  <Text style={styles.timeValue}>
                    {startDateTime.date} {startDateTime.time}
                  </Text>
                  {booking.vehicle_snapshot?.battery_kWh && (
                    <Text style={styles.batteryInfo}>
                      Pin: {booking.vehicle_snapshot.battery_kWh} kWh
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.tripTimeRow}>
                <View style={styles.timePoint}>
                  <View
                    style={[styles.timeDot, { backgroundColor: COLORS.error }]}
                  />
                </View>
                <View style={styles.timeContent}>
                  <Text style={styles.timeLabel}>Kết thúc</Text>
                  <Text style={styles.timeValue}>
                    {endDateTime.date} {endDateTime.time}
                  </Text>
                </View>
              </View>
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
                <Text style={styles.infoLabelText}>Trạm</Text>
              </View>
              <Text style={[styles.infoValue, styles.locationText]}>
                {getStationName()}
              </Text>
            </View>
            <Text style={styles.addressText}>{getStationAddress()}</Text>
          </View>

          {/* Payment Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phương thức</Text>
              <Text style={styles.paymentValue}>
                {booking.payment?.method || "Chưa thanh toán"}
              </Text>
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

            {/* Deposit Info */}
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
                {booking.status === "CANCELLED" && booking.payment?.status === "SUCCESS" && (
                  <Text style={[styles.paymentNote, { color: COLORS.error }]}>
                    ✗ Đã hủy - Chờ hoàn tiền
                  </Text>
                )}
              </View>
              <Text style={[styles.paymentValue, styles.depositValue]}>
                {depositAmount.toLocaleString("vi-VN")} VND
              </Text>
            </View>

            {/* Remaining Payment */}
            {booking.status === "CONFIRMED" && (
              <View style={styles.paymentRow}>
                <View style={styles.paymentLabelWithNote}>
                  <Text style={[styles.paymentLabel, styles.remainingLabel]}>
                    🔄 Còn lại{" "}
                    {totalPrice > 0 && remainingAmount > 0
                      ? `(${Math.round((remainingAmount / totalPrice) * 100)}%)`
                      : ""}
                  </Text>
                  <Text style={styles.paymentNote}>
                    Đã thanh toán trực tiếp tại trạm
                  </Text>
                </View>
                <Text style={styles.paymentValue}>
                  {remainingAmount.toLocaleString("vi-VN")} VND
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            {/* Total */}
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {totalPrice.toLocaleString("vi-VN")} VND
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  ratingButton: {
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  starsContainer: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  ratingText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "600",
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
  tripTimeContainer: {
    paddingVertical: SPACING.sm,
  },
  tripTimeRow: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  timePoint: {
    alignItems: "center",
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
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  batteryInfo: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
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
    flex: 1,
  },
  paymentValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  breakdownTitle: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  paymentLabelWithNote: {
    flex: 1,
  },
  depositLabel: {
    fontWeight: "600",
  },
  remainingLabel: {
    fontWeight: "600",
  },
  depositValue: {
    color: COLORS.success,
    fontWeight: "700",
  },
  paymentNote: {
    fontSize: FONTS.caption,
    color: COLORS.success,
    marginTop: SPACING.xs / 2,
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
  receiptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
  },
  receiptText: {
    flex: 1,
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xxl,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  bookAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    backgroundColor: COLORS.primary,
    marginTop: -SPACING.md,
    ...SHADOWS.sm,
  },
  bookAgainButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.white,
  },
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
});

export default HistoryBookingDetailScreen;
