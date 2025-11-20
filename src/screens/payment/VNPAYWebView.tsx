import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;// Parse query params from return URL
      if (url.includes("myapp://payment")) {
        handlePaymentReturn(url);
      }
    };

    // Listen for deeplinks
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check if app was opened from deeplink
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("myapp://payment")) {handlePaymentReturn(url);
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
  const handlePaymentReturn = async (url: string) => {// Show loading immediately when payment return is detected
    setIsProcessingPayment(true);

    // Extract query params
    const queryString = url.split("?")[1] || "";
    const params = new URLSearchParams(queryString);
    const responseCode = params.get("vnp_ResponseCode");
    const transactionStatus = params.get("vnp_TransactionStatus");
    const secureHash = params.get("vnp_SecureHash");
    const amount = params.get("vnp_Amount");
    const txnRef = params.get("vnp_TxnRef");// 🚨 CRITICAL: Call backend callback to update payment & booking status
    try {// Build provider_metadata with all vnp_* params
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
      };// Build full API URL
      const apiUrl = `${API_CONFIG.BASE_URL}${PAYMENT_ENDPOINTS.VNPAY_CALLBACK}`;// Call backend callback endpoint
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(callbackParams),
      });const result = await response.json();if (!response.ok) {throw new Error(result.message || "Failed to process payment callback");
      }} catch (error) {// Continue to show UI even if backend call fails (IPN will handle it)
    } finally {
      // Hide loading after backend processing completes
      setIsProcessingPayment(false);
      
      // Show result modal after loading is hidden
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
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);

    const url = navState.url;// ========================================
    // 🔧 SANDBOX MODE: Keep payment in WebView (FIXED)
    // ========================================
    // 📝 NOTE: Removed automatic external browser opening
    // Payment now stays within WebView for better UX
    // Deeplink will still work when VNPay redirects back to app
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
    const { nativeEvent } = syntheticEvent;// ⚠️ Don't show error modal if we're processing payment callback
    // The payment may succeed even if WebView has navigation errors
    if (isProcessingPayment) {return;
    }

    // Don't show error if modal is already visible (result already shown)
    if (modalVisible) {return;
    }

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
      // ✅ Thanh toán thành công → về Bookings tab
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
        // Navigate to Bookings tab after resetting
        setTimeout(() => {
          (navigation as any).navigate("MainTabs", {
            screen: "Bookings",
          });
        }, 100);
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
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Thanh toán VNPAY</Text>
          </View>

          <View style={styles.headerButton} />
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

        {/* Payment Processing Overlay */}
        {isProcessingPayment && (
          <View style={styles.processingOverlay}>
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.processingTitle}>Đang xử lý thanh toán...</Text>
              <Text style={styles.processingSubtitle}>
                Vui lòng chờ trong giây lát
              </Text>
            </View>
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
    fontSize: FONTS.title,
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
  // Payment Processing Overlay
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 999,
  },
  processingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: "center",
    minWidth: 280,
    ...SHADOWS.lg,
  },
  processingTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  processingSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
});

export default VNPAYWebView;
