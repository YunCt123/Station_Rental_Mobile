import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { COLORS, SPACING, FONTS, SHADOWS } from "../../utils/theme";
import { emailVerificationService } from "../../services/emailVerificationService";
import StatusModal from "../../components/common/StatusModal";

type EmailVerificationRouteParams = {
  email: string;
  fromRegistration?: boolean;
};

type EmailVerificationRoute = RouteProp<
  { EmailVerification: EmailVerificationRouteParams },
  "EmailVerification"
>;

const EmailVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EmailVerificationRoute>();
  const { email, fromRegistration = false } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(5);

  // Status Modal
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  // Refs for OTP inputs
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text: string) => {
    // Handle paste of 6-digit code
    const digits = text.replace(/\D/g, "").slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or first empty
    const lastIndex = Math.min(digits.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setStatusModal({
        visible: true,
        type: "error",
        title: "Lỗi",
        message: "Vui lòng nhập đầy đủ 6 số mã OTP",
      });
      return;
    }

    if (attempts >= maxAttempts) {
      setStatusModal({
        visible: true,
        type: "error",
        title: "Vượt quá số lần thử",
        message: "Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await emailVerificationService.verifyEmail({
        code: otpCode,
      });

      if (response.success) {
        setStatusModal({
          visible: true,
          type: "success",
          title: "Xác thực thành công!",
          message: response.data.message || "Email của bạn đã được xác thực.",
        });

        // Navigate to login or main app after 2 seconds
        setTimeout(() => {
          if (fromRegistration) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" as never }],
            });
          } else {
            navigation.goBack();
          }
        }, 2000);
      }
    } catch (error: any) {
      setAttempts((prev) => prev + 1);
      const remainingAttempts = maxAttempts - attempts - 1;

      setStatusModal({
        visible: true,
        type: "error",
        title: "Xác thực thất bại",
        message:
          error.response?.data?.message ||
          `Mã OTP không đúng. Còn ${remainingAttempts} lần thử.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setResending(true);
      const response = await emailVerificationService.resendVerification({
        email,
      });

      if (response.success) {
        // Reset OTP inputs
        setOtp(["", "", "", "", "", ""]);
        setAttempts(0);
        inputRefs.current[0]?.focus();

        // Reset countdown
        setCountdown(60);
        setCanResend(false);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setStatusModal({
          visible: true,
          type: "success",
          title: "Đã gửi mã mới",
          message: "Mã OTP mới đã được gửi đến email của bạn",
        });
      }
    } catch (error: any) {
      setStatusModal({
        visible: true,
        type: "error",
        title: "Lỗi",
        message:
          error.response?.data?.message || "Không thể gửi lại mã. Vui lòng thử lại.",
      });
    } finally {
      setResending(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
         
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="chevron-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Xác Thực Email</Text>
              <View style={styles.backButton} />
            </View>
         <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Content Card */}
            <View style={styles.card}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="mail" size={48} color={COLORS.primary} />
                </View>
              </View>

              {/* Title & Description */}
              <Text style={styles.title}>Nhập Mã Xác Thực</Text>
              {!fromRegistration && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.infoBoxText}>
                    Tài khoản của bạn chưa xác thực email. Vui lòng xác thực để có thể đăng nhập.
                  </Text>
                </View>
              )}
              <Text style={styles.description}>
                Chúng tôi đã gửi mã OTP 6 số đến email
              </Text>
              <Text style={styles.email}>{email}</Text>
              <Text style={styles.subDescription}>
                Vui lòng kiểm tra hộp thư đến (hoặc spam) và nhập mã bên dưới
              </Text>

              {/* OTP Input */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      attempts >= maxAttempts && styles.otpInputDisabled,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={attempts < maxAttempts && !loading}
                  />
                ))}
              </View>

              {/* Attempts Info */}
              {attempts > 0 && (
                <View style={styles.attemptsInfo}>
                  <Ionicons name="warning" size={16} color={COLORS.warning} />
                  <Text style={styles.attemptsText}>
                    Bạn đã nhập sai {attempts}/{maxAttempts} lần
                  </Text>
                </View>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (loading || attempts >= maxAttempts) &&
                    styles.verifyButtonDisabled,
                ]}
                onPress={handleVerify}
                disabled={loading || attempts >= maxAttempts}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.verifyButtonText}>Xác Thực</Text>
                )}
              </TouchableOpacity>

              {/* Resend Section */}
              <View style={styles.resendSection}>
                <Text style={styles.resendText}>Không nhận được mã?</Text>
                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resending}
                  >
                    <Text style={styles.resendButton}>
                      {resending ? "Đang gửi..." : "Gửi lại mã"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.countdownText}>
                    Gửi lại sau {formatCountdown(countdown)}
                  </Text>
                )}
              </View>

              {/* Tips */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Lưu ý:</Text>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>
                    Mã OTP có hiệu lực trong 24 giờ
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>
                    Kiểm tra cả thư mục spam nếu không thấy email
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>
                    Bạn có tối đa 5 lần nhập sai
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Status Modal */}
        <StatusModal
          visible={statusModal.visible}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onClose={() => setStatusModal({ ...statusModal, visible: false })}
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
  gradientBackground: {
    flex: 1,
      },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
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
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.white,
  },
  card: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FONTS.subtitle,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + "10",
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoBoxText: {
    flex: 1,
    fontSize: FONTS.caption,
    color: COLORS.text,
    lineHeight: 18,
  },
  description: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subDescription: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: FONTS.header,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    backgroundColor: COLORS.background,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  otpInputDisabled: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    opacity: 0.5,
  },
  attemptsInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.warning + "15",
    borderRadius: 8,
  },
  attemptsText: {
    fontSize: FONTS.caption,
    color: COLORS.warning,
    fontWeight: "600",
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.white,
  },
  resendSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  resendText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  resendButton: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.primary,
  },
  countdownText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  tipsContainer: {
    backgroundColor: COLORS.primary + "10",
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  tipsTitle: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default EmailVerificationScreen;
