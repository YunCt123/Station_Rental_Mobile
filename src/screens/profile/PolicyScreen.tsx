import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, FONTS } from "../../utils/theme";
import {
  PolicySection,
  RentalConditions,
  RequirementCard,
  PaymentMethodCard,
  FeeTable,
} from "../../components/policy";

const PolicyScreen = () => {
  const navigation = useNavigation();

  const rentalConditions = [
    {
      title: "Tuổi tối thiểu: 18 tuổi và có giấy phép lái xe hợp lệ",
      items: [
        "Người thuê phải từ 18 tuổi trở lên",
        "Có giấy phép lái xe hợp lệ theo loại xe thuê",
      ],
    },
    {
      title: "Cung cấp đầy đủ giấy tờ tùy thân (CMND/CCCD, GPLX)",
      items: [
        "CMND/CCCD còn hiệu lực",
        "Giấy phép lái xe phù hợp với loại xe",
      ],
    },
    {
      title: "Hoàn thành xác minh danh tính và tải lên hệ thống",
      items: [
        "Upload ảnh CMND/CCCD mặt trước và sau",
        "Upload ảnh giấy phép lái xe",
        "Chụp ảnh selfie để xác thực",
      ],
    },
    {
      title: "Đặt cọc bảo đảm theo quy định",
      items: [
        "Số tiền cọc tùy theo loại xe",
        "Được hoàn trả sau khi trả xe",
      ],
    },
  ];

  const accountRequirements = {
    required: [
      "CMND/CCCD: Phải hợp lệ, đúng kỳ thuật 24/7",
      "Ảnh chân dung: Đầm bảo người lái có đủ năng lực và kinh nghiệm",
      "Giá hạn thời gian thuê khi cần",
      "Khiếu nại khi có vấn đề",
    ],
    forbidden: [
      "Cho người khác thuê xe lại xe",
      "Lái xe khi đã uống rượu bia",
      "Tự ý sửa chữa, thay đổi xe",
    ],
  };

  const paymentMethods = [
    {
      title: "Thẻ Tín Dụng/Ghi Nợ",
      description: "Visa, Mastercard, JCB",
      icon: "card",
      bgColor: "#2979FF",
    },
    {
      title: "Ví Điện Tử",
      description: "MoMo, ZaloPay, VNPay",
      icon: "wallet",
      bgColor: "#00C853",
    },
    {
      title: "Chuyển Khoản",
      description: "Ngân hàng nội địa",
      icon: "business",
      bgColor: "#9C27B0",
    },
  ];

  const feeStructure = [
    {
      label: "Phí Thuê Cơ Bản",
      description: "Giá thuê theo giờ/ngày",
      price: "50.000đ - 200.000đ/giờ",
    },
    {
      label: "Phí Bảo Hiểm",
      description: "Bảo hiểm trong quá trình thuê",
      price: "5% giá thuê",
    },
    {
      label: "Tiền Cọc",
      description: "Đặt cọc bảo đảm",
      price: "2.000.000đ - 5.000.000đ",
    },
    {
      label: "Phí Trễ Hạn",
      description: "Phạt khi trả xe muộn",
      price: "100.000đ/giờ",
    },
  ];

  const refundPolicies = {
    refund: [
      "Hủy trước 24h",
      "Lỗi từ phía hệ thống",
      "Xe bị hư hỏng không thể sử dụng",
    ],
    noRefund: [
      "Hủy trọng vòng 24h",
      "Không đến nhận xe",
      "Vi phạm điều khoản sử dụng",
    ],
  };

  const privacyPoints = [
    "Thông tin cá nhân được mã hóa và bảo mật tuyệt đối",
    "Không chia sẻ thông tin với bên thứ ba không được phép",
    "Dữ liệu GPS chỉ được sử dụng để theo dõi và bảo vệ xe",
    "Khách hàng có quyền yêu cầu xóa dữ liệu cá nhân",
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chính Sách & Điều Khoản</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Điều Kiện Thuê Xe */}
          <PolicySection
            title="Điều Kiện Thuê Xe"
            icon="document-text"
            defaultExpanded={true}
          >
            <RentalConditions conditions={rentalConditions} />
          </PolicySection>

          {/* Yêu Cầu Xác Minh Tài Khoản */}
          <PolicySection
            title="Yêu Cầu Xác Minh Tài Khoản - Ví Sự An Toàn"
            icon="shield-checkmark"
          >
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <Text style={styles.warningText}>
                Tài Sao Cần Xác Minh Tài Khoản?
              </Text>
            </View>
            <Text style={styles.descriptionText}>
              Để đảm bảo an toàn cho cộng đồng và cộng đồng, chúng tôi yêu cầu
              xác minh danh tính trước khi có thể đặt xe. Đây là biện pháp bảo vệ
              cần thiết giúp:
            </Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.success}
                  />
                </View>
                <Text style={styles.benefitText}>
                  Bảo vệ tài sản: Ngăn chặn việc sử dụng trái phép phương tiện
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.success}
                  />
                </View>
                <Text style={styles.benefitText}>
                  An toàn cho người khác: Đảm bảo người lái có đủ năng lực và kinh
                  nghiệm
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.success}
                  />
                </View>
                <Text style={styles.benefitText}>
                  Hỗ trợ khẩn cấp: Có nguồn tin chính xác để hỗ trợ cần thiết
                </Text>
              </View>
            </View>

            <RequirementCard
              title="Quyền Lợi"
              items={accountRequirements.required}
              type="required"
            />

            <RequirementCard
              title="Nghĩa Vụ"
              items={accountRequirements.forbidden}
              type="forbidden"
            />

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Quy Trình Xác Minh Nhanh Chóng
              </Text>
            </View>
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Tải lên giấy tờ</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Chụp ảnh chân dung</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Hệ thống kiểm tra</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>Xác minh hoàn tất</Text>
              </View>
            </View>
            <Text style={styles.noteText}>
              ⏱️ Thời gian xử lý: 15-30 phút trong giờ hành chính | 2-4 giờ ngoài
              giờ
            </Text>
          </PolicySection>

          {/* Chính Sách Thanh Toán */}
          <PolicySection title="Chính Sách Thanh Toán" icon="card">
            <Text style={styles.sectionTitle}>Phương Thức Thanh Toán</Text>
            {paymentMethods.map((method, index) => (
              <PaymentMethodCard
                key={index}
                title={method.title}
                description={method.description}
                icon={method.icon}
                bgColor={method.bgColor}
              />
            ))}

            <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
              Cấu Trúc Giá
            </Text>
            <FeeTable fees={feeStructure} />
          </PolicySection>

          {/* Thời Gian & Đặt Xe */}
          <PolicySection title="Thời Gian & Đặt Xe" icon="time">
            <View style={styles.timeSection}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeBlockTitle}>Thời Gian Thuê</Text>
                <View style={styles.timeItem}>
                  <View style={styles.timeBullet} />
                  <Text style={styles.timeText}>Tối thiểu: 1 giờ</Text>
                </View>
                <View style={styles.timeItem}>
                  <View style={styles.timeBullet} />
                  <Text style={styles.timeText}>Lên đến: 30 ngày</Text>
                </View>
                <View style={styles.timeItem}>
                  <View style={styles.timeBullet} />
                  <Text style={styles.timeText}>
                    Có thể gia hạn trong quá trình sử dụng
                  </Text>
                </View>
              </View>

              <View style={styles.timeBlock}>
                <Text style={styles.timeBlockTitle}>Đặt Xe Trước</Text>
                <View style={styles.timeItem}>
                  <View style={styles.timeBullet} />
                  <Text style={styles.timeText}>Đặt trước tối thiểu 30 phút</Text>
                </View>
                <View style={styles.timeItem}>
                  <View style={styles.timeBullet} />
                  <Text style={styles.timeText}>
                    Đặt trước tối đa 7 ngày
                  </Text>
                </View>
                <View style={styles.timeItem}>
                  <View style={styles.timeBullet} />
                  <Text style={styles.timeText}>Miễn phí hủy trong 24h</Text>
                </View>
              </View>
            </View>
          </PolicySection>

          {/* Nhận & Trả Xe */}
          <PolicySection title="Nhận & Trả Xe" icon="car">
            <View style={styles.deliverySection}>
              <View style={styles.deliveryBlock}>
                <Text style={styles.deliveryTitle}>Nhận Xe</Text>
                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryBullet} />
                  <Text style={styles.deliveryText}>
                    Tại các trạm được chỉ định
                  </Text>
                </View>
                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryBullet} />
                  <Text style={styles.deliveryText}>
                    Kiểm tra tình trạng xe trước khi nhận
                  </Text>
                </View>
                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryBullet} />
                  <Text style={styles.deliveryText}>
                    Báo cáo ngay nếu phát hiện có hỏng
                  </Text>
                </View>
                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryBullet} />
                  <Text style={styles.deliveryText}>
                    Ký xác nhận tình trạng xe
                  </Text>
                </View>
              </View>

              <View style={styles.deliveryBlock}>
                <Text style={styles.deliveryTitle}>Trả Xe</Text>
                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryBullet} />
                  <Text style={styles.deliveryText}>
                    Trả tại trạm được chỉ định
                  </Text>
                </View>
                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryBullet} />
                  <Text style={styles.deliveryText}>
                    Đảm bảo xe sạch sẽ, không hư hỏng
                  </Text>
                </View>
                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryBullet} />
                  <Text style={styles.deliveryText}>
                    Pin phải có ít nhất 20% dung lượng
                  </Text>
                </View>
                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryBullet} />
                  <Text style={styles.deliveryText}>
                    Trả đúng giờ để tránh phí phạt
                  </Text>
                </View>
              </View>
            </View>
          </PolicySection>

          {/* Điều Khoản Sử Dụng */}
          <PolicySection title="Điều Khoản Sử Dụng" icon="shield">
            <Text style={styles.sectionTitle}>Quyền & Nghĩa Vụ Của Khách Hàng</Text>
            
            <RequirementCard
              title="Quyền Lợi"
              items={[
                "Sử dụng xe trong thời gian thuê",
                "Được hỗ trợ kỹ thuật 24/7",
                "Được bảo hiểm trong quá trình sử dụng",
                "Giá hạn thời gian thuê khi cần",
                "Khiếu nại khi có vấn đề",
              ]}
              type="required"
            />

            <RequirementCard
              title="Các Hành Vi Bị Cấm"
              items={[
                "Cho người khác thuê lại xe",
                "Lái xe khi đã uống rượu bia",
                "Tự ý sửa chữa, thay đổi xe",
                "Sử dụng xe vào mục đích bất hợp pháp",
                "Chở quá số người quy định",
                "Sử dụng xe để đua xe trái phép",
              ]}
              type="forbidden"
            />
          </PolicySection>

          {/* Chính Sách Bảo Mật */}
          <PolicySection title="Chính Sách Bảo Mật Thông Tin" icon="lock-closed">
            <View style={styles.privacyContent}>
              {privacyPoints.map((point, index) => (
                <View key={index} style={styles.privacyItem}>
                  <View style={styles.privacyIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.privacyText}>{point}</Text>
                </View>
              ))}
            </View>

            <View style={styles.noteBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.noteBoxText}>
                Cam Kết Bảo Mật Thông Tin: Chúng tôi cam kết bảo mật tuyệt đối
                thông tin cá nhân của quý khách. Dữ liệu được mã hóa end-to-end và
                chỉ được sử dụng cho mục đích xác minh danh tính. Thông tin sẽ
                được lưu trữ an toàn theo quy định pháp luật và có thể xóa theo yêu
                cầu của khách hàng.
              </Text>
            </View>
          </PolicySection>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bằng việc sử dụng dịch vụ, bạn đồng ý với các điều khoản và chính
              sách trên.
            </Text>
            <Text style={styles.footerDate}>
              Cập nhật lần cuối: 14/11/2025
            </Text>
          </View>
        </ScrollView>
               </View>
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
  container:{
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,   
    marginHorizontal: -SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: "#f59e0b" + "15",
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  warningText: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: "#f59e0b",
  },
  descriptionText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  benefitsList: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  benefitIcon: {
    paddingTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.primary + "15",
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.primary,
  },
  stepsList: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  stepNumberText: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.white,
  },
  stepText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  noteText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  timeSection: {
    gap: SPACING.lg,
  },
  timeBlock: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
  },
  timeBlockTitle: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  timeBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  timeText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  deliverySection: {
    gap: SPACING.lg,
  },
  deliveryBlock: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
  },
  deliveryTitle: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  deliveryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  deliveryBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  deliveryText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  privacyContent: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  privacyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  privacyIcon: {
    paddingTop: 2,
  },
  privacyText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  noteBox: {
    flexDirection: "row",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + "10",
    padding: SPACING.md,
    borderRadius: 12,
  },
  noteBoxText: {
    flex: 1,
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    alignItems: "center",
  },
  footerText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  footerDate: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
});

export default PolicyScreen;
