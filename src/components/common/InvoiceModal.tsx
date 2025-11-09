import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";

interface InvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  bookingCode: string;
  vehicleName: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  hourlyRate: number;
  totalHours: number;
  actualHours?: number;
  totalPrice: number;
  actualPrice?: number;
  paymentMethod: string;
  location: string;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  visible,
  onClose,
  bookingCode,
  vehicleName,
  vehicleModel,
  startDate,
  endDate,
  startTime,
  endTime,
  actualStartTime,
  actualEndTime,
  hourlyRate,
  totalHours,
  actualHours,
  totalPrice,
  actualPrice,
  paymentMethod,
  location,
}) => {
  const finalPrice = actualPrice || totalPrice;
  const finalHours = actualHours || totalHours;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayBackground}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Hóa đơn chi tiết</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Invoice Header */}
              <View style={styles.invoiceHeader}>
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={COLORS.primary}
                />
                <Text style={styles.invoiceTitle}>Station Rental</Text>
                <Text style={styles.invoiceSubtitle}>Hóa đơn thanh toán</Text>
              </View>

              {/* Booking Code */}
              <View style={styles.codeSection}>
                <Text style={styles.codeLabel}>Mã đặt xe</Text>
                <Text style={styles.codeValue}>{bookingCode}</Text>
              </View>

              {/* Vehicle Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin xe</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Xe</Text>
                  <Text style={styles.infoValue}>
                    {vehicleName} {vehicleModel}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Trạm</Text>
                  <Text style={styles.infoValue}>{location}</Text>
                </View>
              </View>

              {/* Time Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thời gian</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Đặt trước</Text>
                  <Text style={styles.infoValue}>
                    {startDate} {startTime} - {endDate} {endTime}
                  </Text>
                </View>
                {actualStartTime && actualEndTime && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Thực tế</Text>
                    <Text style={styles.infoValue}>
                      {startDate} {actualStartTime} - {endDate} {actualEndTime}
                    </Text>
                  </View>
                )}
              </View>

              {/* Price Breakdown */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chi tiết giá</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Đơn giá</Text>
                  <Text style={styles.priceValue}>
                    {hourlyRate.toLocaleString("vi-VN")} VND/giờ
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Số giờ thuê</Text>
                  <Text style={styles.priceValue}>{finalHours} giờ</Text>
                </View>
                {actualPrice && actualPrice !== totalPrice && (
                  <>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Dự tính</Text>
                      <Text style={[styles.priceValue, styles.strikethrough]}>
                        {totalPrice.toLocaleString("vi-VN")} VND
                      </Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Điều chỉnh</Text>
                      <Text
                        style={[styles.priceValue, { color: COLORS.success }]}
                      >
                        -{(totalPrice - actualPrice).toLocaleString("vi-VN")}{" "}
                        VND
                      </Text>
                    </View>
                  </>
                )}

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tổng cộng</Text>
                  <Text style={styles.totalValue}>
                    {finalPrice.toLocaleString("vi-VN")} VND
                  </Text>
                </View>
              </View>

              {/* Payment Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thanh toán</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phương thức</Text>
                  <Text style={styles.infoValue}>{paymentMethod}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Trạng thái</Text>
                  <View style={styles.paidBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={COLORS.success}
                    />
                    <Text style={styles.paidText}>Đã thanh toán</Text>
                  </View>
                </View>
              </View>

              {/* Footer Note */}
              <View style={styles.footerNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.footerText}>
                  Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
                </Text>
              </View>

              {/* Bottom Spacing */}
              <View style={{ height: SPACING.xl }} />
            </ScrollView>

            {/* Action Button */}
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => {}}
              >
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.downloadButtonText}>Tải xuống PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeActionButton}
                onPress={onClose}
              >
                <Text style={styles.closeActionButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    maxHeight: "92%",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    ...SHADOWS.lg,
    height: "100%",
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  invoiceHeader: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.primary + "08",
    marginTop: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: RADII.md,
  },
  invoiceTitle: {
    fontSize: FONTS.header,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  invoiceSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  codeSection: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  codeLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  codeValue: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  priceLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: COLORS.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONTS.header,
    fontWeight: "700",
    color: COLORS.primary,
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.success + "15",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  paidText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.success,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: RADII.md,
    gap: SPACING.sm,
  },
  footerText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionButtonContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  downloadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary + "15",
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    gap: SPACING.xs,
    marginTop: -SPACING.sm,
  },
  downloadButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.primary,
  },
  closeActionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    alignItems: "center",
    ...SHADOWS.sm,
    marginTop: -SPACING.sm,
  },
  closeActionButtonText: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.white,
  },
});

export default InvoiceModal;
