import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { paymentService } from "../../services/paymentService";
import { rentalService } from "../../services/rentalService";
import StatusModal from "../../components/common/StatusModal";

type FinalPaymentRouteProp = RouteProp<RootStackParamList, "FinalPayment">;
type FinalPaymentNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FinalPaymentScreen = () => {
  const route = useRoute<FinalPaymentRouteProp>();
  const navigation = useNavigation<FinalPaymentNavigationProp>();
  const { rentalId, totalCharges, depositPaid, vehicleName } = route.params;

  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Calculate final amount to pay
  const finalAmount = totalCharges - depositPaid;
  const needsPayment = finalAmount > 0;
  const needsRefund = finalAmount < 0;

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Call complete-return endpoint (direct payment, not via VNPAY)
      const response = await rentalService.completeReturn(rentalId);

      setIsProcessing(false);
      setModalType("success");
      setModalTitle("Hoàn tất thuê xe");

      const { finalPayment } = response;

      if (finalPayment.amount > 0) {
        setModalMessage(
          `Bạn đã thanh toán ${finalPayment.amount.toLocaleString(
            "vi-VN"
          )} VND trực tiếp tại trạm. Cảm ơn bạn đã sử dụng dịch vụ!`
        );
      } else if (finalPayment.amount < 0) {
        setModalMessage(
          `Bạn đã được hoàn ${Math.abs(finalPayment.amount).toLocaleString(
            "vi-VN"
          )} VND. Tiền sẽ được hoàn về tài khoản trong 3-5 ngày làm việc.`
        );
      } else {
        setModalMessage(
          "Bạn đã thanh toán đủ khi đặt cọc. Cảm ơn bạn đã sử dụng dịch vụ!"
        );
      }

      setModalVisible(true);
    } catch (error: any) {
      setIsProcessing(false);
      setModalType("error");
      setModalTitle("Thanh toán thất bại");

      const errorMsg = error.response?.data?.message || error.message;

      // Handle specific error cases
      if (errorMsg?.includes("not ready for completion")) {
        setModalMessage(
          "Nhân viên chưa hoàn tất kiểm tra trả xe. Vui lòng liên hệ trạm để được hỗ trợ."
        );
      } else if (errorMsg?.includes("Access denied")) {
        setModalMessage("Bạn không có quyền thực hiện thao tác này.");
      } else {
        setModalMessage(
          errorMsg || "Không thể hoàn tất thanh toán. Vui lòng thử lại."
        );
      }

      setModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      // Navigate back to bookings list after successful completion
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" as never }],
      });
    }
  };

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
          <Text style={styles.headerTitle}>Thanh toán cuối</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="receipt-outline"
                size={48}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.infoTitle}>Hoàn tất thuê xe</Text>
            <Text style={styles.infoSubtitle}>
              Bạn đã trả xe thành công. Vui lòng thanh toán số tiền còn lại để
              hoàn tất.
            </Text>
          </View>

          {/* Vehicle Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin xe</Text>
            <View style={styles.detailRow}>
              <Ionicons
                name="car-sport-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.detailText}>{vehicleName || "Xe thuê"}</Text>
            </View>
          </View>

          {/* Payment Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng chi phí thuê xe</Text>
              <Text style={styles.summaryValue}>
                {totalCharges.toLocaleString("vi-VN")} VND
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Đã thanh toán (Cọc)</Text>
              <Text style={[styles.summaryValue, styles.paidAmount]}>
                - {depositPaid.toLocaleString("vi-VN")} VND
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>
                {needsPayment
                  ? "Còn phải trả"
                  : needsRefund
                  ? "Hoàn lại"
                  : "Đã thanh toán"}
              </Text>
              <Text
                style={[styles.totalValue, needsRefund && styles.refundAmount]}
              >
                {needsRefund ? "+" : ""}
                {Math.abs(finalAmount).toLocaleString("vi-VN")} VND
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          {needsPayment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
              <View style={styles.paymentOption}>
                <Ionicons
                  name="cash-outline"
                  size={28}
                  color={COLORS.primary}
                />
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>Thanh toán trực tiếp</Text>
                  <Text style={styles.paymentDesc}>
                    Thanh toán trực tiếp tại trạm khi trả xe
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment Status Info */}
          {!needsPayment && (
            <View style={styles.statusCard}>
              <Ionicons
                name={needsRefund ? "cash-outline" : "checkmark-circle-outline"}
                size={32}
                color={needsRefund ? COLORS.warning : COLORS.success}
              />
              <Text style={styles.statusText}>
                {needsRefund
                  ? "Bạn đã thanh toán thừa. Số tiền hoàn lại sẽ được xử lý trong 3-5 ngày làm việc."
                  : "Bạn đã thanh toán đủ khi đặt cọc. Không cần thanh toán thêm."}
              </Text>
            </View>
          )}

          <View style={{ height: 150 }} />
        </ScrollView>

        {/* Bottom Action - Always show for confirmation */}
        <View style={styles.bottomContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>
              {needsPayment
                ? "Số tiền cần thanh toán"
                : needsRefund
                ? "Số tiền hoàn lại"
                : "Tổng thanh toán"}
            </Text>
            <Text
              style={[styles.priceValue, needsRefund && styles.refundAmount]}
            >
              {needsRefund ? "+" : ""}
              {Math.abs(finalAmount).toLocaleString("vi-VN")} VND
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.processingText}>Đang xử lý...</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.payButtonText}>
                  {needsPayment
                    ? "Xác nhận đã thanh toán"
                    : needsRefund
                    ? "Xác nhận nhận hoàn tiền"
                    : "Hoàn tất"}
                </Text>
              </>
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
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
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  infoTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
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
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
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
  paidAmount: {
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
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
  refundAmount: {
    color: COLORS.warning,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  paymentDesc: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  statusText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
    lineHeight: 20,
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
    color: COLORS.error,
  },
  refundAmount: {
    color: COLORS.success,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
    opacity: 0.5,
  },
  payButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.white,
  },
  processingText: {
    fontSize: FONTS.body,
    color: COLORS.white,
  },
});

export default FinalPaymentScreen;
