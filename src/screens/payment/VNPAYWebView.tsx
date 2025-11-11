import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, SPACING, FONTS, SHADOWS } from "../../utils/theme";
import { API_CONFIG, PAYMENT_ENDPOINTS } from "../../constants/apiEndpoints";
import StatusModal from "../../components/common/StatusModal";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

interface RouteParams {
  paymentUrl: string;
  bookingId: string;
  amount: number;
  vehicleName: string;
}

const VNPAYWebView = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { paymentUrl, bookingId, amount, vehicleName } = route.params;

  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [qrModalVisible, setQrModalVisible] = useState(false); // 🆕 QR Modal state

  // ========================================
  // 🔧 SANDBOX MODE: Check if URL is sandbox
  // ========================================
  // 📝 NOTE: Remove this check when moving to PRODUCTION
  // In production, VNPay will use real payment gateway
  const isSandboxUrl = (url: string) => {
    return url.includes("sandbox.vnpayment.vn");
  };

  // ========================================
  // 🔧 SANDBOX MODE: Setup deeplink listener
  // ========================================
  // 📝 NOTE: Keep this in PRODUCTION but update return URL
  // Production return URL: https://yourdomain.com/api/v1/payments/vnpay/callback
  // Sandbox return URL: myapp://payment/result
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log("📱 [VNPAYWebView] Deeplink received:", url);

      // Parse query params from return URL
      if (url.includes("myapp://payment")) {
        handlePaymentReturn(url);
      }
    };

    // Listen for deeplinks
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check if app was opened from deeplink
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("myapp://payment")) {
        console.log("📱 [VNPAYWebView] Initial URL:", url);
        handlePaymentReturn(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ========================================
  // 🔧 SANDBOX MODE: Handle payment return
  // ========================================
  // 📝 NOTE: Keep this in PRODUCTION
  // This handles the callback from VNPay after payment
  const handlePaymentReturn = async (url: string) => {
    console.log("💳 [VNPAYWebView] Processing payment return:", url);

    // Extract query params
    const queryString = url.split("?")[1] || "";
    const params = new URLSearchParams(queryString);
    const responseCode = params.get("vnp_ResponseCode");
    const transactionStatus = params.get("vnp_TransactionStatus");
    const secureHash = params.get("vnp_SecureHash");
    const amount = params.get("vnp_Amount");
    const txnRef = params.get("vnp_TxnRef");

    console.log("💳 [VNPAYWebView] Payment params:", {
      responseCode,
      transactionStatus,
      secureHash,
      amount,
      txnRef,
    });

    // 🚨 CRITICAL: Call backend callback to update payment & booking status
    try {
      console.log("📡 [VNPAYWebView] Calling backend callback API...");

      // Build provider_metadata with all vnp_* params
      const provider_metadata: any = {};
      params.forEach((value, key) => {
        provider_metadata[key] = value;
      });

      // Backend expects this exact format (matching validation schema)
      const callbackParams = {
        transaction_ref: txnRef,
        status: responseCode === "00" ? "SUCCESS" : "FAILED", // ✅ Required by validator
        provider: "VNPAY_SANDBOX", // ✅ Required by validator
        amount: amount ? parseFloat(amount) / 100 : 0, // Convert from VND smallest unit
        vnp_ResponseCode: responseCode,
        vnp_TransactionStatus: transactionStatus,
        vnp_TransactionNo: params.get("vnp_TransactionNo"),
        vnp_Amount: amount,
        vnp_SecureHash: secureHash,
        vnp_TxnRef: txnRef,
        vnp_BankCode: params.get("vnp_BankCode"),
        vnp_CardType: params.get("vnp_CardType"),
        vnp_PayDate: params.get("vnp_PayDate"),
        vnp_OrderInfo: params.get("vnp_OrderInfo"),
        provider_metadata: provider_metadata,
      };

      console.log("📤 [VNPAYWebView] Sending callback params:", callbackParams);

      // Build full API URL
      const apiUrl = `${API_CONFIG.BASE_URL}${PAYMENT_ENDPOINTS.VNPAY_CALLBACK}`;
      console.log("🌐 [VNPAYWebView] API URL:", apiUrl);

      // Call backend callback endpoint
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(callbackParams),
      });

      console.log("📥 [VNPAYWebView] Response status:", response.status);

      const result = await response.json();
      console.log("✅ [VNPAYWebView] Backend callback result:", result);

      if (!response.ok) {
        console.error("❌ [VNPAYWebView] Backend error:", result);
        throw new Error(result.message || "Failed to process payment callback");
      }

      console.log("🎉 [VNPAYWebView] Payment callback successful!");
    } catch (error) {
      console.error(
        "❌ [VNPAYWebView] Failed to call backend callback:",
        error
      );
      // Continue to show UI even if backend call fails (IPN will handle it)
    }

    // Check response code (00 = success)
    if (responseCode === "00" && transactionStatus === "00") {
      setModalType("success");
      setModalTitle("Thanh toán thành công!");
      setModalMessage(
        `Đã đặt xe ${vehicleName} thành công qua VNPAY. Vui lòng đến trạm để nhận xe.`
      );
      setModalVisible(true);
    } else {
      setModalType("error");
      setModalTitle("Thanh toán thất bại");
      setModalMessage(
        responseCode === "24"
          ? "Bạn đã hủy thanh toán. Vui lòng thử lại."
          : "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại."
      );
      setModalVisible(true);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);

    const url = navState.url;
    console.log("🌐 [VNPAYWebView] Navigation to:", url);

    // ========================================
    // 🔧 SANDBOX MODE: Open payment in external browser
    // ========================================
    // 📝 NOTE: REMOVE this block when moving to PRODUCTION
    // In sandbox, we open VNPay page in external browser for testing
    // In production, payment will happen entirely within WebView
    if (isSandboxUrl(url) && url.includes("vpcpay.html")) {
      console.log("🔗 [VNPAYWebView] Opening sandbox URL in external browser");
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
      return;
    }
    // ========================================

    // ========================================
    // ✅ PRODUCTION: Handle payment result in WebView
    // ========================================
    // 📝 NOTE: Keep this in PRODUCTION
    // This handles the return URL after payment completion
    if (
      url.includes("vnp_ResponseCode=00") ||
      url.includes("payment-success") ||
      url.includes("success")
    ) {
      // Parse full URL for complete payment info
      handlePaymentReturn(url);
    } else if (
      url.includes("vnp_ResponseCode=24") ||
      url.includes("cancel") ||
      url.includes("payment-cancel")
    ) {
      setModalType("error");
      setModalTitle("Thanh toán đã hủy");
      setModalMessage("Bạn đã hủy thanh toán. Vui lòng thử lại.");
      setModalVisible(true);
    } else if (
      url.includes("vnp_ResponseCode") &&
      !url.includes("vnp_ResponseCode=00")
    ) {
      setModalType("error");
      setModalTitle("Thanh toán thất bại");
      setModalMessage("Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.");
      setModalVisible(true);
    }
    // ========================================
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error: ", nativeEvent);

    setModalType("error");
    setModalTitle("Không thể tải trang");
    setModalMessage(
      "URL thanh toán không hợp lệ hoặc không khả dụng. Vui lòng liên hệ bộ phận hỗ trợ để được trợ giúp."
    );
    setModalVisible(true);
  };

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      Alert.alert("Hủy thanh toán", "Bạn có chắc chắn muốn hủy thanh toán?", [
        { text: "Không", style: "cancel" },
        {
          text: "Có",
          onPress: () => {
            // 🔥 Back 2 pages: VNPAYWebView + BookingPaymentScreen
            // This prevents user from returning to booking screen and creating duplicate booking
            navigation.goBack(); // Exit VNPAYWebView
            setTimeout(() => {
              if (navigation.canGoBack()) {
                navigation.goBack(); // Exit BookingPaymentScreen
              }
            }, 100);
          },
        },
      ]);
    }
  };

  const handleForward = () => {
    if (canGoForward && webViewRef.current) {
      webViewRef.current.goForward();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleClose = () => {
    Alert.alert(
      "Đóng thanh toán",
      "Bạn có chắc chắn muốn đóng trang thanh toán?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Có",
          onPress: () => {
            // 🔥 Back 2 pages: VNPAYWebView + BookingPaymentScreen
            // This prevents user from returning to booking screen and creating duplicate booking
            navigation.goBack(); // Exit VNPAYWebView
            setTimeout(() => {
              if (navigation.canGoBack()) {
                navigation.goBack(); // Exit BookingPaymentScreen
              }
            }, 100);
          },
        },
      ]
    );
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      // ✅ Thanh toán thành công → về MainTabs
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      }, 300);
    } else {
      // ❌ Thanh toán thất bại → back 2 pages (VNPAYWebView + BookingPaymentScreen)
      // This prevents user from returning to booking screen and creating duplicate booking
      setTimeout(() => {
        navigation.goBack(); // Exit VNPAYWebView
        setTimeout(() => {
          if (navigation.canGoBack()) {
            navigation.goBack(); // Exit BookingPaymentScreen
          }
        }, 100);
      }, 300);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Thanh toán VNPAY</Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setQrModalVisible(true)}
          >
            <Ionicons name="qr-code" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
          <Text style={styles.securityText}>Kết nối bảo mật với VNPAY</Text>
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleWebViewError}
          onHttpError={handleWebViewError}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                Đang tải trang thanh toán...
              </Text>
            </View>
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
        />

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}

        {/* Navigation Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.footerButton,
              !canGoBack && styles.footerButtonDisabled,
            ]}
            onPress={handleBack}
            disabled={!canGoBack}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={canGoBack ? COLORS.text : COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.footerButton,
              !canGoForward && styles.footerButtonDisabled,
            ]}
            onPress={handleForward}
            disabled={!canGoForward}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={canGoForward ? COLORS.text : COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.footerInfo}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.footerInfoText}>Mã: {bookingId}</Text>
          </View>
        </View>

        {/* Status Modal */}
        <StatusModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={handleModalClose}
          actionButtonText={modalType === "success" ? "Xem đặt chỗ" : "Đóng"}
          onActionPress={
            modalType === "success"
              ? handleModalClose
              : () => {
                  setModalVisible(false);
                  navigation.goBack();
                }
          }
        />

        {/* 🆕 QR Code Modal - For Sandbox Payment */}
        <Modal
          visible={qrModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setQrModalVisible(false)}
        >
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModalContent}>
              <ScrollView
                contentContainerStyle={styles.qrScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Header */}
                <View style={styles.qrModalHeader}>
                  <Text style={styles.qrModalTitle}>
                    Quét mã QR để thanh toán
                  </Text>
                  <TouchableOpacity
                    onPress={() => setQrModalVisible(false)}
                    style={styles.qrCloseButton}
                  >
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                {/* Important Notice */}
                <View style={styles.qrNoticeContainer}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={COLORS.primary}
                  />
                  <View style={styles.qrNoticeTextContainer}>
                    <Text style={styles.qrNoticeTitle}>
                      ✅ Môi trường TEST - KHÔNG trừ tiền thật
                    </Text>
                    <Text style={styles.qrNoticeText}>
                      • Đây là VNPay Sandbox (môi trường thử nghiệm){"\n"}• Sử
                      dụng OTP giả (bất kỳ số nào đều OK){"\n"}• Không có giao
                      dịch thật, không trừ tiền{"\n"}• Hoàn toàn miễn phí để
                      test
                    </Text>
                  </View>
                </View>

                {/* QR Code */}
                <View style={styles.qrCodeContainer}>
                  <QRCode
                    value={paymentUrl}
                    size={250}
                    color={COLORS.text}
                    backgroundColor={COLORS.white}
                    logo={require("../../../assets/icon.png")}
                    logoSize={50}
                    logoBackgroundColor={COLORS.white}
                    logoMargin={2}
                    logoBorderRadius={10}
                  />
                </View>

                {/* Payment Info */}
                <View style={styles.qrPaymentInfo}>
                  <View style={styles.qrInfoRow}>
                    <Text style={styles.qrInfoLabel}>Xe thuê:</Text>
                    <Text style={styles.qrInfoValue}>{vehicleName}</Text>
                  </View>
                  <View style={styles.qrInfoRow}>
                    <Text style={styles.qrInfoLabel}>Số tiền cọc:</Text>
                    <Text style={[styles.qrInfoValue, styles.qrInfoAmount]}>
                      {amount.toLocaleString("vi-VN")} VND
                    </Text>
                  </View>
                  <View style={styles.qrInfoRow}>
                    <Text style={styles.qrInfoLabel}>Mã booking:</Text>
                    <Text style={styles.qrInfoValue}>{bookingId}</Text>
                  </View>
                </View>

                {/* Instructions */}
                <View style={styles.qrInstructions}>
                  <Text style={styles.qrInstructionsTitle}>
                    📱 Cách thanh toán:
                  </Text>
                  <Text style={styles.qrInstructionsText}>
                    1. Mở ứng dụng ngân hàng trên điện thoại{"\n"}
                    2. Chọn "Quét mã QR" hoặc "QR Pay"{"\n"}
                    3. Quét mã QR phía trên{"\n"}
                    4. Chọn ngân hàng test (VD: Vietcombank){"\n"}
                    5. Nhập OTP bất kỳ (VD: 123456){"\n"}
                    6. Hoàn tất thanh toán (KHÔNG trừ tiền thật)
                  </Text>
                </View>

                {/* Alternative Payment Button */}
                <TouchableOpacity
                  style={styles.qrAlternativeButton}
                  onPress={() => {
                    setQrModalVisible(false);
                    Linking.openURL(paymentUrl);
                  }}
                >
                  <Ionicons
                    name="open-outline"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.qrAlternativeButtonText}>
                    Hoặc mở trình duyệt để thanh toán
                  </Text>
                </TouchableOpacity>

                {/* Warning */}
                <View style={styles.qrWarning}>
                  <Ionicons name="warning" size={16} color={COLORS.warning} />
                  <Text style={styles.qrWarningText}>
                    Lưu ý: Sau khi thanh toán thành công trên app ngân hàng,
                    quay lại đây để hoàn tất
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.primary,
    marginTop: -SPACING.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  securityBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.success + "10",
    gap: SPACING.xs,
  },
  securityText: {
    fontSize: FONTS.caption,
    color: COLORS.success,
    fontWeight: "500",
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.body,
    color: COLORS.primary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary,
    gap: SPACING.sm,
  },
  footerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  footerButtonDisabled: {
    opacity: 0.4,
  },
  footerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: SPACING.xs,
  },
  footerInfoText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
  },
  // 🆕 QR Modal Styles
  qrModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  qrModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    ...SHADOWS.lg,
  },
  qrScrollContent: {
    padding: SPACING.xl,
  },
  qrModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  qrModalTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  qrCloseButton: {
    padding: SPACING.xs,
  },
  qrNoticeContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(41, 121, 255, 0.1)",
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  qrNoticeTextContainer: {
    flex: 1,
  },
  qrNoticeTitle: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  qrNoticeText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    lineHeight: 20,
  },
  qrCodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  qrPaymentInfo: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  qrInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  qrInfoLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  qrInfoValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  qrInfoAmount: {
    color: COLORS.primary,
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
  },
  qrInstructions: {
    marginBottom: SPACING.lg,
  },
  qrInstructionsTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  qrInstructionsText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  qrAlternativeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  qrAlternativeButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.white,
  },
  qrWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  qrWarningText: {
    flex: 1,
    fontSize: FONTS.caption,
    color: COLORS.text,
    lineHeight: 18,
  },
});

export default VNPAYWebView;
