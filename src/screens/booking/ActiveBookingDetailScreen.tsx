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
import QRCodeModal from "../../components/common/QRCodeModal";
import StatusModal from "../../components/common/StatusModal";
import QRCode from "react-native-qrcode-svg";
import { bookingService } from "../../services/bookingService";
import { Booking } from "../../types/booking";

interface RouteParams {
  bookingId: string;
}

const ActiveBookingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { bookingId } = route.params;

  const [qrModalVisible, setQrModalVisible] = useState(false);
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

    switch (booking.status) {
      case "CONFIRMED":
        return {
          label: "Đang sử dụng",
          color: COLORS.success,
          icon: "checkmark-circle",
        };
      case "HELD":
        return {
          label: "Đang giữ chỗ",
          color: COLORS.warning,
          icon: "time",
        };
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
  const hourlyRate = booking.pricing_snapshot?.hourly_rate || 0;
  const totalPrice =
    booking.pricing_snapshot?.total_price || booking.totalPrice || 0;

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

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phương thức</Text>
              <Text style={styles.paymentValue}>
                {booking.payment?.method || "Chưa thanh toán"}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Trạng thái</Text>
              <View style={styles.paidBadge}>
                <Ionicons
                  name={
                    booking.payment?.status === "SUCCESS"
                      ? "checkmark-circle"
                      : "time"
                  }
                  size={16}
                  color={
                    booking.payment?.status === "SUCCESS"
                      ? COLORS.success
                      : COLORS.warning
                  }
                />
                <Text
                  style={[
                    styles.paidText,
                    {
                      color:
                        booking.payment?.status === "SUCCESS"
                          ? COLORS.success
                          : COLORS.warning,
                    },
                  ]}
                >
                  {booking.payment?.status === "SUCCESS"
                    ? "Đã thanh toán"
                    : "Chờ thanh toán"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>
                Giá thuê ({totalHours}h x {hourlyRate.toLocaleString("vi-VN")}đ)
              </Text>
              <Text style={styles.paymentValue}>
                {totalPrice.toLocaleString("vi-VN")}đ
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {totalPrice.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>

          {/* QR Code Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mã QR nhận xe</Text>
            <TouchableOpacity
              style={styles.qrContainer}
              onPress={() => setQrModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={JSON.stringify({
                    bookingId: booking._id,
                    vehicleName: `${getVehicleName()} ${getVehicleModel()}`,
                    location: getStationAddress(),
                    pickupTime: `${startDateTime.date} ${startDateTime.time}`,
                    timestamp: new Date().toISOString(),
                  })}
                  size={180}
                  color={COLORS.text}
                  backgroundColor={COLORS.white}
                />
              </View>
              <Text style={styles.qrText}>Nhấn để xem mã QR check-in</Text>
              <View style={styles.qrButton}>
                <Text style={styles.qrButtonText}>Xem chi tiết</Text>
                <Ionicons
                  name="expand-outline"
                  size={16}
                  color={COLORS.white}
                />
              </View>
            </TouchableOpacity>
          </View>

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

        {/* QR Code Modal */}
        <QRCodeModal
          visible={qrModalVisible}
          onClose={() => setQrModalVisible(false)}
          bookingId={booking._id}
          vehicleName={`${getVehicleName()} ${getVehicleModel()}`}
          location={getStationAddress()}
          pickupTime={`${startDateTime.date} ${startDateTime.time}`}
        />

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
