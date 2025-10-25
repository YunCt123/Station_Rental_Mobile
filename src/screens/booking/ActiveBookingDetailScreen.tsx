import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import QRCodeModal from "../../components/common/QRCodeModal";
import QRCode from "react-native-qrcode-svg";

interface RouteParams {
  bookingId: string;
}

const ActiveBookingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { bookingId } = route.params;

  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Mock data
  const booking = {
    id: bookingId,
    vehicleName: "VinFast VF8",
    vehicleModel: "2024 Eco",
    vehicleImage:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
    status: "upcoming",
    bookingCode: "BOOK1729682400000",
    startDate: "25/10/2025",
    startTime: "09:00",
    endDate: "25/10/2025",
    endTime: "17:00",
    totalHours: 8,
    hourlyRate: 90000,
    totalPrice: 720000,
    location: "Trạm Landmark 81",
    locationAddress: "720A Điện Biên Phủ, P.22, Q.Bình Thạnh, TP.HCM",
    paymentMethod: "PayOS",
    paymentStatus: "paid",
    vehicleDetails: {
      batteryLevel: 95,
      range: "380 km",
      licensePlate: "51A-12345",
    },
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Hủy đặt chỗ",
      "Bạn có chắc chắn muốn hủy đặt chỗ này? Tiền sẽ được hoàn lại trong 3-5 ngày làm việc.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đặt chỗ",
          style: "destructive",
          onPress: () => {
            // Handle cancellation
            Alert.alert("Thành công", "Đã hủy đặt chỗ thành công", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert("Hỗ trợ", "Hotline: 1900-xxxx\nEmail: support@station.vn");
  };

  const getStatusInfo = () => {
    switch (booking.status) {
      case "active":
        return {
          label: "Đang sử dụng",
          color: COLORS.success,
          icon: "checkmark-circle",
        };
      case "upcoming":
        return {
          label: "Sắp tới",
          color: COLORS.warning,
          icon: "time",
        };
      default:
        return {
          label: booking.status,
          color: COLORS.textSecondary,
          icon: "information-circle",
        };
    }
  };

  const statusInfo = getStatusInfo();

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
              source={{ uri: booking.vehicleImage }}
              style={styles.vehicleImage}
            />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{booking.vehicleName}</Text>
              <Text style={styles.vehicleModel}>{booking.vehicleModel}</Text>
              <View style={styles.detailRow}>
                <Ionicons
                  name="car-outline"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.detailText}>
                  {booking.vehicleDetails.licensePlate}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons
                  name="battery-charging-outline"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={styles.detailText}>
                  {booking.vehicleDetails.batteryLevel}% •{" "}
                  {booking.vehicleDetails.range}
                </Text>
              </View>
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
              <Text style={styles.infoValue}>{booking.bookingCode}</Text>
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
                {booking.startDate} {booking.startTime}
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
                {booking.endDate} {booking.endTime}
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
              <Text style={styles.infoValue}>{booking.totalHours} giờ</Text>
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
                {booking.location}
              </Text>
            </View>
            <Text style={styles.addressText}>{booking.locationAddress}</Text>
          </View>

          {/* Payment Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phương thức</Text>
              <Text style={styles.paymentValue}>{booking.paymentMethod}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Trạng thái</Text>
              <View style={styles.paidBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={styles.paidText}>Đã thanh toán</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>
                Giá thuê ({booking.totalHours}h x{" "}
                {booking.hourlyRate.toLocaleString("vi-VN")}đ)
              </Text>
              <Text style={styles.paymentValue}>
                {booking.totalPrice.toLocaleString("vi-VN")}đ
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {booking.totalPrice.toLocaleString("vi-VN")}đ
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
                    bookingId: booking.bookingCode,
                    vehicleName: `${booking.vehicleName} ${booking.vehicleModel}`,
                    location: booking.locationAddress,
                    pickupTime: `${booking.startDate} ${booking.startTime}`,
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
        {booking.status === "upcoming" && (
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
          bookingId={booking.bookingCode}
          vehicleName={`${booking.vehicleName} ${booking.vehicleModel}`}
          location={booking.locationAddress}
          pickupTime={`${booking.startDate} ${booking.startTime}`}
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
