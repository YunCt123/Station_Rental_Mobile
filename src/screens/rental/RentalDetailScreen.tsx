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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { Rental } from "../../types/rental";
import { rentalService } from "../../services/rentalService";
import { paymentService } from "../../services/paymentService";
import StatusModal from "../../components/common/StatusModal";
import CreateIssueModal from "../../components/issue/CreateIssueModal";
import {
  RentalVehicleInfo,
  RentalInfoCard,
} from "../../components/index";

interface RouteParams {
  rentalId: string;
}

const RentalDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { rentalId } = route.params;
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusModalType, setStatusModalType] = useState<"success" | "error">("success");
  const [statusModalTitle, setStatusModalTitle] = useState("");
  const [statusModalMessage, setStatusModalMessage] = useState("");
  const [createIssueModalVisible, setCreateIssueModalVisible] = useState(false);

  useEffect(() => {
    loadRentalDetails();
  }, [rentalId]);

  const loadRentalDetails = async () => {
    try {
      setLoading(true);
      const data = await rentalService.getRentalById(rentalId);
      setRental(data);
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể tải thông tin thuê xe. Vui lòng thử lại.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  /** Handle final payment for rental return */
  const handleCompleteReturn = async () => {
    if (!rental) return;

    // Check rental status
    if (rental.status?.toUpperCase() !== "RETURN_PENDING") {
      Alert.alert(
        "Không thể thanh toán",
        "Chỉ có thể thanh toán cho rental đang chờ trả xe (RETURN_PENDING)."
      );
      return;
    }

    const finalAmount = Math.max(0,
      (rental.pricing_snapshot.base_price || 0) + 
      (rental.charges.cleaning_fee || 0) + 
      (rental.charges.late_fee || 0) + 
      (rental.charges.damage_fee || 0) + 
      (rental.charges.other_fees || 0) + 
      (rental.pricing_snapshot?.taxes || 0) - 
      (rental.pricing_snapshot?.deposit || 0)
    );

    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn cần thanh toán ${finalAmount.toLocaleString("vi-VN")} VND để hoàn tất trả xe. Tiếp tục?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thanh toán",
          onPress: async () => {
            try {
              setPaymentLoading(true);

              console.log("🔍 [RentalDetail] Creating final payment for rental:", rental._id);
              console.log("🔍 [RentalDetail] Rental status:", rental.status);
              console.log("🔍 [RentalDetail] Final amount:", finalAmount);

              // Try to create final payment directly
              // Backend will validate if payment record exists
              const paymentResult = await paymentService.createFinalPayment(rental._id!);

              console.log("✅ [RentalDetail] Payment result:", paymentResult);

              if (paymentResult.data?.checkoutUrl) {
                // Navigate to payment screen with URL
                (navigation as any).navigate("PaymentWebView", {
                  paymentUrl: paymentResult.data.checkoutUrl,
                  rentalId: rental._id,
                  amount: finalAmount,
                });
              } else {
                // Payment completed directly (cash/wallet)
                setStatusModalType("success");
                setStatusModalTitle("Thanh toán thành công");
                setStatusModalMessage("Bạn đã hoàn tất trả xe thành công!");
                setStatusModalVisible(true);

                // Reload rental data
                await loadRentalDetails();
              }
            } catch (error: any) {
              console.error("❌ [RentalDetail] Payment error:", error);
              console.error("❌ [RentalDetail] Error response:", error.response?.data);
              
              let errorMessage = "Không thể tạo thanh toán. Vui lòng thử lại.";
              
              if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.message) {
                errorMessage = error.message;
              }

              // Handle specific error cases
              if (errorMessage.includes("No pending final payment found")) {
                errorMessage = "Chưa có thanh toán cuối được tạo. Vui lòng đợi nhân viên kiểm tra xe và xác nhận chi phí trước khi thanh toán.";
              }

              setStatusModalType("error");
              setStatusModalTitle("Lỗi thanh toán");
              setStatusModalMessage(errorMessage);
              setStatusModalVisible(true);
            } finally {
              setPaymentLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    const iconMap: { [key: string]: string } = {
      CONFIRMED: "checkmark-circle",
      ONGOING: "car-sport",
      RETURN_PENDING: "time",
      COMPLETED: "checkmark-done-circle",
      DISPUTED: "alert-circle",
      REJECTED: "close-circle",
    };
    return iconMap[status?.toUpperCase()] || "information-circle";
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      CONFIRMED: "Đã xác nhận",
      ONGOING: "Đang thuê",
      RETURN_PENDING: "Chờ trả xe",
      COMPLETED: "Hoàn thành",
      DISPUTED: "Tranh chấp",
      REJECTED: "Đã từ chối",
    };
    return statusMap[status?.toUpperCase()] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      CONFIRMED: COLORS.primary,
      ONGOING: COLORS.success,
      RETURN_PENDING: COLORS.warning,
      COMPLETED: COLORS.textSecondary,
      DISPUTED: COLORS.error,
      REJECTED: COLORS.error,
    };
    return colorMap[status?.toUpperCase()] || COLORS.textSecondary;
  };

  const formatDateTime = (date?: string | Date) => {
    if (!date) return { date: "N/A", time: "N/A" };
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("vi-VN"),
      time: d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (loading || !rental) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <LinearGradient colors={COLORS.gradient_4} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const vehicle = typeof rental.vehicle_id === "object" ? rental.vehicle_id : null;
  const vehicleName = (vehicle as any)?.name || "Xe điện";
  const vehicleModel = (vehicle as any)?.model || "";
  const vehicleImage = (vehicle as any)?.image || (vehicle as any)?.images?.[0];

  const station = typeof rental.station_id === "object" ? rental.station_id : null;
  const stationName = (station as any)?.name || "Trạm";
  const stationAddress = (station as any)?.address || "";

  const pickupTime = formatDateTime(rental.pickup?.at);
  const returnTime = formatDateTime(rental.return?.at);

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
          <Text style={styles.headerTitle}>Chi tiết thuê xe</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: `${getStatusColor(rental.status)}15` },
            ]}
          >
            <Ionicons
              name={getStatusIcon(rental.status) as any}
              size={24}
              color={getStatusColor(rental.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(rental.status) },
              ]}
            >
              {getStatusLabel(rental.status)}
            </Text>
          </View>

          {/* Vehicle Info */}
          <RentalVehicleInfo
            vehicleName={vehicleName}
            vehicleModel={vehicleModel}
            vehicleImage={vehicleImage}
          />

          {/* Rental Info */}
          <RentalInfoCard
            rentalId={rental._id}
            stationName={stationName}
            stationAddress={stationAddress}
            pickupDate={pickupTime.date}
            pickupTime={pickupTime.time}
            returnDate={returnTime.date}
            returnTime={returnTime.time}
          />

          {/* Charges - New Structure */}
          {rental.charges && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>

              {/* Thông tin booking */}
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Thông tin booking:</Text>
                <Text style={styles.infoBoxText}>
                  Loại thuê: {rental.pricing_snapshot?.details?.rentalType === "hourly" ? "Theo giờ" : "Theo ngày"}{" "}
                  {rental.pricing_snapshot?.details?.rentalType === "hourly" 
                    ? `(${rental.pricing_snapshot?.details?.hours} giờ)`
                    : `(${Math.floor(rental.pricing_snapshot?.details?.days || 0)} ngày)`}
                </Text>
                <Text style={styles.infoBoxText}>
                  Giá thuê: {(rental.pricing_snapshot?.details?.rentalType === "hourly" ? rental.pricing_snapshot?.hourly_rate : rental.pricing_snapshot?.daily_rate || 0).toLocaleString("vi-VN")} VND/{rental.pricing_snapshot?.details?.rentalType === "hourly" ? "giờ" : "ngày"}
                </Text>
              </View>


              {/* Tổng tiền thuê trong khoảng thời gian */}
              <View style={styles.chargeRow}>
                <Text style={styles.chargeLabel}>
                  Tổng tiền thuê:
                </Text>
                <Text style={styles.chargeValue}>
                  {(rental.pricing_snapshot?.base_price || 0).toLocaleString("vi-VN")} VND
                </Text>
              </View>

              {/* Thuế và phí dịch vụ */}
              <View style={styles.chargeRow}>
                <Text style={styles.chargeLabel}>Thuế và phí dịch vụ:</Text>
                <Text style={styles.chargeValue}>
                  {(rental.pricing_snapshot?.taxes || 0).toLocaleString("vi-VN")} VND
                </Text>
              </View>

              {/* Phí phát sinh */}
              {((rental.charges.cleaning_fee || 0) + (rental.charges.damage_fee || 0) + (rental.charges.late_fee || 0) + (rental.charges.other_fees || 0)) > 0 && (
                <>
                  <Text style={[styles.chargeLabel, { color: COLORS.warning, marginTop: SPACING.sm }]}>
                    Phí phát sinh:
                  </Text>

                  {/* Phí vệ sinh */}
                  {(rental.charges.cleaning_fee || 0) > 0 && (
                    <View style={styles.chargeRow}>
                      <Text style={styles.chargeLabel}>  Phí vệ sinh:</Text>
                      <Text style={styles.chargeValue}>
                        {(rental.charges.cleaning_fee || 0).toLocaleString("vi-VN")} VND
                      </Text>
                    </View>
                  )}

                  {/* Phí hư hỏng */}
                  {(rental.charges.damage_fee || 0) > 0 && (
                    <View style={styles.chargeRow}>
                      <Text style={styles.chargeLabel}>  Phí hư hỏng:</Text>
                      <Text style={styles.chargeValue}>
                        {(rental.charges.damage_fee || 0).toLocaleString("vi-VN")} VND
                      </Text>
                    </View>
                  )}

                  {/* Phí trả muộn */}
                  {(rental.charges.late_fee || 0) > 0 && (
                    <View style={styles.chargeRow}>
                      <Text style={styles.chargeLabel}>  Phí trả muộn:</Text>
                      <Text style={styles.chargeValue}>
                        {(rental.charges.late_fee || 0).toLocaleString("vi-VN")} VND
                      </Text>
                    </View>
                  )}

                  {/* Phí khác */}
                  {(rental.charges.other_fees || 0) > 0 && (
                    <View style={styles.chargeRow}>
                      <Text style={styles.chargeLabel}>  Phí khác:</Text>
                      <Text style={styles.chargeValue}>
                        {(rental.charges.other_fees || 0).toLocaleString("vi-VN")} VND
                      </Text>
                    </View>
                  )}

                  {/* Tổng phí phát sinh */}
                  <View style={styles.chargeRow}>
                    <Text style={styles.chargeLabel}>  Tổng phí phát sinh:</Text>
                    <Text style={[styles.chargeValue, { color: COLORS.warning }]}>
                      {((rental.charges.cleaning_fee || 0) + (rental.charges.damage_fee || 0) + (rental.charges.late_fee || 0) + (rental.charges.other_fees || 0)).toLocaleString("vi-VN")} VND
                    </Text>
                  </View>
                </>
              )}

              {/* Tổng phí */}
              <View style={styles.chargeRow}>
                <Text style={styles.chargeLabel}>Tổng phí:</Text>
                <Text style={styles.chargeValue}>
                  {Math.max(0, (rental.pricing_snapshot.base_price || 0) +  
                  (rental.charges.cleaning_fee || 0) +  (rental.charges.late_fee || 0)+ (rental.charges.damage_fee || 0) +  (rental.charges.other_fees || 0) + 
                  (rental.pricing_snapshot?.taxes || 0)).toLocaleString("vi-VN")} VND
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Đã đặt cọc */}
              <View style={styles.chargeRow}>
                <Text style={styles.chargeLabel}>Đã đặt cọc:</Text>
                <Text style={[styles.chargeValue, { color: COLORS.success }]}>
                  -{(rental.pricing_snapshot?.deposit || 0).toLocaleString("vi-VN")} VND
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Số tiền cần thanh toán / Đã thanh toán */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {rental.status?.toUpperCase() === "COMPLETED" ? "Đã thanh toán:" : "Số tiền cần thanh toán:"}
                </Text>
                <Text style={[styles.totalValue, rental.status?.toUpperCase() === "COMPLETED" && { color: COLORS.success }]}>
                  {Math.max(0,(rental.pricing_snapshot.base_price || 0) + 
                  (rental.charges.cleaning_fee || 0) +  (rental.charges.late_fee || 0)+ (rental.charges.damage_fee || 0) +  (rental.charges.other_fees || 0) + (rental.pricing_snapshot?.taxes || 0)
                  - (rental.pricing_snapshot?.deposit || 0)).toLocaleString("vi-VN")} VND
                </Text>
              </View>
            </View>
          )}

          {/* Payment Button or Status Message */}
          {rental.status?.toUpperCase() === "ONGOING" && (
            <>
              <View style={styles.infoMessageContainer}>
                <Ionicons name="information-circle" size={24} color={COLORS.accent} />
                <Text style={styles.infoMessageText}>
                  Vui lòng mang xe đến trạm để nhân viên kiểm tra và xác nhận trả xe
                </Text>
              </View>
              
              {/* Report Issue Button */}
              <TouchableOpacity
                style={styles.reportIssueButton}
                onPress={() => setCreateIssueModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="alert-circle-outline" size={24} color={COLORS.error} />
                <Text style={styles.reportIssueText}>Báo cáo vấn đề</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </>
          )}

          {rental.status?.toUpperCase() === "RETURN_PENDING" && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.paymentButton, paymentLoading && styles.paymentButtonDisabled]}
                onPress={handleCompleteReturn}
                disabled={paymentLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.success]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.paymentButtonGradient}
                >
                  {paymentLoading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <Ionicons name="card-outline" size={24} color={COLORS.white} />
                      <Text style={styles.paymentButtonText}>
                        Thanh toán hoàn tất
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {rental.status?.toUpperCase() === "COMPLETED" && (
            <View style={styles.successMessageContainer}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              <Text style={styles.successMessageText}>
                Đã hoàn tất thanh toán và trả xe
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Status Modal */}
        <StatusModal
          visible={statusModalVisible}
          type={statusModalType}
          title={statusModalTitle}
          message={statusModalMessage}
          onClose={() => {
            setStatusModalVisible(false);
            if (statusModalType === "success") {
              navigation.goBack();
            }
          }}
        />

        {/* Create Issue Modal */}
        {rental && (
          <CreateIssueModal
            visible={createIssueModalVisible}
            onClose={() => setCreateIssueModalVisible(false)}
            rentalId={rental._id!}
            onSuccess={() => {
              loadRentalDetails();
            }}
          />
        )}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: FONTS.title,
    color: COLORS.white,
    fontWeight: "700",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  statusText: {
    fontSize: FONTS.subtitle,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.subtitle,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoBox: {
    backgroundColor: `${COLORS.primary}10`,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
  },
  infoBoxTitle: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoBoxText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  chargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
    alignItems: "center",
  },
  chargeLabel: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  chargeValue: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: SPACING.sm,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: FONTS.subtitle,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONTS.subtitle,
    fontWeight: "700",
    color: COLORS.error,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  paymentButton: {
    borderRadius: RADII.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  infoMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.accent}15`,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADII.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    gap: SPACING.md,
  },
  infoMessageText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
    lineHeight: 20,
  },
  successMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.success}15`,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADII.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    gap: SPACING.md,
  },
  successMessageText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "600",
    lineHeight: 20,
  },
  paymentButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  paymentButtonText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.white,
    fontWeight: "700",
  },
  reportIssueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.error,
    ...SHADOWS.sm,
  },
  reportIssueText: {
    flex: 1,
    fontSize: FONTS.bodyLarge,
    color: COLORS.error,
    fontWeight: "600",
    marginLeft: SPACING.sm,
  },
});

export default RentalDetailScreen;
