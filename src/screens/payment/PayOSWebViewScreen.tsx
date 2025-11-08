import React, { useState, useRef } from "react";
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
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import StatusModal from "../../components/common/StatusModal";
import { bookingService } from "../../services/bookingService";
import { paymentService } from "../../services/paymentService";
import { SafeAreaView } from "react-native-safe-area-context";

interface RouteParams {
  paymentUrl: string;
  bookingId: string;
  amount: number;
  vehicleName: string;
}

const PayOSWebViewScreen = () => {
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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Parse URL query params
  const parseUrlParams = (url: string): Record<string, string> => {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    } catch (error) {
      return {};
    }
  };

  // Handle PayOS client callback
  const handlePayOSClientCallback = async (url: string) => {
    if (isCheckingStatus) return;

    setIsCheckingStatus(true);
    try {
      const params = parseUrlParams(url);

      console.log("[PayOSWebView] Parsed URL params:", params);

      // Check if this is VNPay callback (has vnp_ prefix)
      if (params.vnp_TxnRef || params.vnp_txnref) {
        console.log(
          "[PayOSWebView] Detected VNPay callback, calling VNPay handler"
        );

        const callbackData = {
          transaction_ref: params.vnp_TxnRef || params.vnp_txnref || "",
          provider_payment_id:
            params.vnp_TransactionNo || params.vnp_transactionno || "",
          status:
            (params.vnp_ResponseCode || params.vnp_responsecode) === "00"
              ? "SUCCESS"
              : "FAILED",
          amount: amount,
          code: params.vnp_ResponseCode || params.vnp_responsecode || "99",
          bookingId: bookingId,
          vnp_SecureHash: params.vnp_SecureHash || params.vnp_securehash,
          vnp_ResponseCode: params.vnp_ResponseCode || params.vnp_responsecode,
          vnp_Amount: params.vnp_Amount || params.vnp_amount,
          vnp_TransactionNo:
            params.vnp_TransactionNo || params.vnp_transactionno,
          vnp_TxnRef: params.vnp_TxnRef || params.vnp_txnref,
          vnp_BankCode: params.vnp_BankCode || params.vnp_bankcode,
          vnp_CardType: params.vnp_CardType || params.vnp_cardtype,
          vnp_OrderInfo: params.vnp_OrderInfo || params.vnp_orderinfo,
          vnp_PayDate: params.vnp_PayDate || params.vnp_paydate,
          vnp_TmnCode: params.vnp_TmnCode || params.vnp_tmncode,
          vnp_TransactionStatus:
            params.vnp_TransactionStatus || params.vnp_transactionstatus,
          provider: "VNPAY_SANDBOX",
          provider_metadata: params,
        };

        const result = await paymentService.handleVnpayCallback(callbackData);

        if (result.success) {
          setModalType("success");
          setModalTitle("Thanh toán thành công!");
          setModalMessage(
            `Đã đặt xe ${vehicleName} thành công. Vui lòng đến trạm để nhận xe.`
          );
          setModalVisible(true);
        } else {
          setModalType("error");
          setModalTitle("Thanh toán thất bại");
          setModalMessage("Thanh toán không thành công. Vui lòng thử lại.");
          setModalVisible(true);
        }
        return;
      }

      // PayOS callback params: code, id, cancel, status, orderCode
      const callbackData = {
        transaction_ref: params.orderCode || params.id || "",
        provider_payment_id: params.orderCode || "",
        status:
          params.cancel === "true" ? "CANCELLED" : params.status || "PAID",
        amount: amount,
        code: params.code || "00",
        bookingId: bookingId,
      };

      console.log(
        "[PayOSWebView] Calling PayOS client callback:",
        callbackData
      );

      const result = await paymentService.handlePayOSClientCallback(
        callbackData
      );

      console.log("[PayOSWebView] Client callback result:", result);

      if (result.status === "SUCCESS") {
        // Verify vehicle status after payment
        try {
          const booking = await bookingService.getBookingById(bookingId);
          console.log("[PayOSWebView] Booking after payment:", booking);
          console.log(
            "[PayOSWebView] Vehicle status should be RESERVED:",
            booking.vehicle_id
          );
        } catch (err) {
          console.error("[PayOSWebView] Error fetching booking:", err);
        }

        setModalType("success");
        setModalTitle("Thanh toán thành công!");
        setModalMessage(
          `Đã đặt xe ${vehicleName} thành công. Vui lòng đến trạm để nhận xe.`
        );
        setModalVisible(true);
      } else {
        setModalType("error");
        setModalTitle("Thanh toán thất bại");
        setModalMessage("Thanh toán không thành công. Vui lòng thử lại.");
        setModalVisible(true);
      }
    } catch (error: any) {
      console.error("Error handling callback:", error);
      console.error("Error response:", error.response?.data);
      // Fallback to checking booking status
      await checkPaymentStatus();
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Check payment status from backend
  const checkPaymentStatus = async () => {
    if (isCheckingStatus) return; // Prevent duplicate checks

    setIsCheckingStatus(true);
    try {
      // Get booking details to check payment status
      const booking = await bookingService.getBookingById(bookingId);

      if (booking.status === "CONFIRMED") {
        setModalType("success");
        setModalTitle("Thanh toán thành công!");
        setModalMessage(
          `Đã đặt xe ${vehicleName} thành công. Vui lòng đến trạm để nhận xe.`
        );
        setModalVisible(true);
      } else if (booking.status === "CANCELLED") {
        setModalType("error");
        setModalTitle("Thanh toán thất bại");
        setModalMessage("Booking đã bị hủy. Vui lòng thử lại.");
        setModalVisible(true);
      }
      // If status is HELD, payment might still be processing
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);

    // Check if payment is successful or cancelled based on URL
    const url = navState.url.toLowerCase();

    console.log("[PayOSWebView] URL changed:", url);

    // Detect PayOS return URL patterns
    // PayOS returns to: returnUrl?code=00&id=xxx&cancel=false&status=PAID&orderCode=xxx
    if (
      url.includes("code=") ||
      url.includes("ordercode=") ||
      url.includes("cancel=")
    ) {
      console.log("[PayOSWebView] Detected PayOS callback URL");
      handlePayOSClientCallback(navState.url);
    }
    // Legacy patterns for other payment gateways
    else if (url.includes("payment-success") || url.includes("/success")) {
      handlePayOSClientCallback(navState.url);
    } else if (url.includes("payment-cancel") || url.includes("/cancel")) {
      setModalType("error");
      setModalTitle("Thanh toán bị hủy");
      setModalMessage(
        "Bạn đã hủy thanh toán. Booking vẫn ở trạng thái chờ, bạn có thể thử thanh toán lại."
      );
      setModalVisible(true);
    } else if (
      url.includes("payment-error") ||
      url.includes("/error") ||
      url.includes("payment-failed")
    ) {
      setModalType("error");
      setModalTitle("Thanh toán thất bại");
      setModalMessage("Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.");
      setModalVisible(true);
    }
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log("WebView error:", nativeEvent);

    // If error is about redirect/connection after payment
    // It might be because the callback URL is not accessible from mobile
    // Check payment status instead of showing error immediately
    if (
      nativeEvent.url &&
      (nativeEvent.url.includes("payment") ||
        nativeEvent.url.includes("callback") ||
        nativeEvent.url.includes("return"))
    ) {
      console.log("Callback URL error, checking payment status...");
      checkPaymentStatus();
      return;
    }

    setModalType("error");
    setModalTitle("Lỗi kết nối");
    setModalMessage(
      "Không thể tải trang thanh toán. Vui lòng kiểm tra kết nối mạng và thử lại."
    );
    setModalVisible(true);
  };

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      Alert.alert("Hủy thanh toán", "Bạn có chắc chắn muốn hủy thanh toán?", [
        { text: "Không", style: "cancel" },
        { text: "Có", onPress: () => navigation.goBack() },
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
        { text: "Có", onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      }, 300);
    } else {
      // For error, go back to booking payment screen
      setTimeout(() => {
        navigation.goBack();
      }, 300);
    }
  };

  const handleCheckStatus = () => {
    setModalVisible(false);
    checkPaymentStatus();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.primary }}
      edges={["top"]}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Thanh toán PayOS</Text>
          </View>

          <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
          <Text style={styles.securityText}>Kết nối bảo mật với PayOS</Text>
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

          <TouchableOpacity
            style={[styles.footerButton]}
            onPress={checkPaymentStatus}
            disabled={isCheckingStatus}
          ></TouchableOpacity>
          <View style={styles.footerInfo}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={COLORS.white}
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
          actionButtonText={
            modalType === "success" ? "Xem đặt chỗ" : "Quay lại"
          }
          onActionPress={handleModalClose}
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
    marginHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 2,
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
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
});

export default PayOSWebViewScreen;
