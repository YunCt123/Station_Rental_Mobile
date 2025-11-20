import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

interface RouteParams {
  paymentUrl: string;
  rentalId: string;
  bookingId: string;
  amount: number;
  vehicleName: string;
}

const RentalFinalPaymentWebView = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { paymentUrl, rentalId, bookingId, amount, vehicleName } = route.params;

  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Handle VNPAY return after payment
  const handlePaymentReturn = async (url: string) => {
    setIsProcessingPayment(true);

    // Extract query params
    const queryString = url.split("?")[1] || "";
    const params = new URLSearchParams(queryString);
    const responseCode = params.get("vnp_ResponseCode");
    const transactionStatus = params.get("vnp_TransactionStatus");
    const secureHash = params.get("vnp_SecureHash");
    const amountParam = params.get("vnp_Amount");
    const txnRef = params.get("vnp_TxnRef");

    console.log("🔄 [RentalFinalPayment] Processing VNPAY callback:", {
      responseCode,
      transactionStatus,
      txnRef,
      amount: amountParam,
    });

    // Call backend callback to update payment & rental status
    try {
      const provider_metadata: any = {};
      params.forEach((value, key) => {
        provider_metadata[key] = value;
      });

      const callbackParams = {
        transaction_ref: txnRef,
        status: responseCode === "00" ? "SUCCESS" : "FAILED",
        provider: "VNPAY_SANDBOX",
        amount: amountParam ? parseFloat(amountParam) / 100 : 0,
        vnp_ResponseCode: responseCode,
        vnp_TransactionStatus: transactionStatus,
        vnp_TransactionNo: params.get("vnp_TransactionNo"),
        vnp_Amount: amountParam,
        vnp_SecureHash: secureHash,
        vnp_TxnRef: txnRef,
        vnp_BankCode: params.get("vnp_BankCode"),
        vnp_CardType: params.get("vnp_CardType"),
        vnp_PayDate: params.get("vnp_PayDate"),
        vnp_OrderInfo: params.get("vnp_OrderInfo"),
        provider_metadata: provider_metadata,
      };

      const apiUrl = `${API_CONFIG.BASE_URL}${PAYMENT_ENDPOINTS.VNPAY_CALLBACK}`;

      console.log("📤 [RentalFinalPayment] Sending callback to backend:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(callbackParams),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to process payment callback");
      }

      console.log("✅ [RentalFinalPayment] Backend callback successful:", result);
    } catch (error) {
      console.error("❌ [RentalFinalPayment] Backend callback error:", error);
      // Continue to show UI even if backend call fails (IPN will handle it)
    } finally {
      setIsProcessingPayment(false);

      // Show result modal
      if (responseCode === "00" && transactionStatus === "00") {
        setModalType("success");
        setModalTitle("Thanh toán thành công!");
        setModalMessage(
          `Bạn đã thanh toán hoàn tất thành công! Cảm ơn bạn đã sử dụng dịch vụ thuê ${vehicleName}.`
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
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);

    const url = navState.url;

    // Handle payment result in WebView
    if (
      url.includes("vnp_ResponseCode=00") ||
      url.includes("payment-success") ||
      url.includes("success")
    ) {
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
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("⚠️ [RentalFinalPayment] WebView error:", nativeEvent);
  };

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      Alert.alert(
        "Hủy thanh toán",
        "Bạn có chắc muốn hủy thanh toán và quay lại?",
        [
          { text: "Không", style: "cancel" },
          {
            text: "Có",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      // Success → Navigate to Rentals screen
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
        // Navigate to Rentals screen after resetting
        setTimeout(() => {
          (navigation as any).navigate("Rentals");
        }, 100);
      }, 300);
    } else {
      // Error → Back to rental detail
      setTimeout(() => {
        navigation.goBack();
      }, 300);
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
  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Thanh toán cuối</Text>
          </View>

          <View style={styles.headerButton} />
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleWebViewError}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="always"
          allowsBackForwardNavigationGestures={true}
        />

        {/* Loading Overlay */}
        {(loading || isProcessingPayment) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {isProcessingPayment
                ? "Đang xử lý thanh toán..."
                : "Đang tải..."}
            </Text>
          </View>
        )}

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
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
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
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginTop: 4,
    opacity: 0.9,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.sm,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: COLORS.background,
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
});

export default RentalFinalPaymentWebView;
