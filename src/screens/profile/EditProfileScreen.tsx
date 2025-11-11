import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import StatusModal from "../../components/common/StatusModal";
import { authApi } from "../../api/authApi";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    dateOfBirth: "",
    licenseNumber: "",
    licenseExpiry: "",
    licenseClass: "",
  });

  // Display values for date fields
  const [dateOfBirthDisplay, setDateOfBirthDisplay] = useState("");
  const [licenseExpiryDisplay, setLicenseExpiryDisplay] = useState("");

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Load user data khi component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await authApi.getCurrentUser();

      setFormData({
        name: currentUser.name || currentUser.fullName || "",
        phoneNumber: currentUser.phoneNumber || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        licenseNumber: currentUser.licenseNumber || "",
        licenseExpiry: currentUser.licenseExpiry || "",
        licenseClass: currentUser.licenseClass || "",
      });

      // Set display values
      if (currentUser.dateOfBirth) {
        setDateOfBirthDisplay(formatDate(currentUser.dateOfBirth));
      }
      if (currentUser.licenseExpiry) {
        setLicenseExpiryDisplay(formatDate(currentUser.licenseExpiry));
      }
    } catch (error) {showStatus("error", "Lỗi", "Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    if (!formData.name.trim()) {
      showStatus("error", "Lỗi", "Vui lòng nhập họ và tên");
      return;
    }

    try {
      setSaving(true);

      // Prepare update data
      const updateData: any = {
        name: formData.name.trim(),
      };

      // Only include fields that have values
      if (formData.phoneNumber.trim()) {
        updateData.phoneNumber = formData.phoneNumber.trim();
      }
      if (formData.dateOfBirth) {
        updateData.dateOfBirth = formData.dateOfBirth;
      }
      if (formData.licenseNumber.trim()) {
        updateData.licenseNumber = formData.licenseNumber.trim();
      }
      if (formData.licenseExpiry) {
        updateData.licenseExpiry = formData.licenseExpiry;
      }
      if (formData.licenseClass.trim()) {
        updateData.licenseClass = formData.licenseClass.trim();
      }

      await authApi.updateProfile(updateData);

      showStatus("success", "Thành công", "Cập nhật thông tin thành công");

      // Navigate back after 1.5 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {showStatus(
        "error",
        "Lỗi",
        error.message || "Không thể cập nhật thông tin"
      );
    } finally {
      setSaving(false);
    }
  };

  const showStatus = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setStatusModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "";
    }
  };

  const formatDateInput = (text: string, previousValue: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, "");

    let formatted = cleaned;

    // Auto add / after day (2 digits)
    if (cleaned.length >= 3) {
      formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }

    // Auto add / after month (5 digits total)
    if (cleaned.length >= 5) {
      formatted =
        cleaned.slice(0, 2) +
        "/" +
        cleaned.slice(2, 4) +
        "/" +
        cleaned.slice(4, 8);
    }

    return formatted;
  };

  const handleDateOfBirthChange = (text: string) => {
    const formatted = formatDateInput(text, dateOfBirthDisplay);
    setDateOfBirthDisplay(formatted);

    // Try to parse date in DD/MM/YYYY format
    if (formatted.length === 10) {
      const parts = formatted.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
          setFormData({ ...formData, dateOfBirth: date.toISOString() });
        }
      }
    } else {
      // Clear the ISO date if incomplete
      setFormData({ ...formData, dateOfBirth: "" });
    }
  };

  const handleLicenseExpiryChange = (text: string) => {
    const formatted = formatDateInput(text, licenseExpiryDisplay);
    setLicenseExpiryDisplay(formatted);

    // Try to parse date in DD/MM/YYYY format
    if (formatted.length === 10) {
      const parts = formatted.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
          setFormData({ ...formData, licenseExpiry: date.toISOString() });
        }
      }
    } else {
      // Clear the ISO date if incomplete
      setFormData({ ...formData, licenseExpiry: "" });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <LinearGradient
          colors={COLORS.gradient_4}
          style={styles.gradientBackground}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={0}
        >
          <ScrollView keyboardShouldPersistTaps="always">
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Personal Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

                {/* Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Họ và tên <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={(text) =>
                        setFormData({ ...formData, name: text })
                      }
                      placeholder="Nhập họ và tên"
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.phoneNumber}
                      onChangeText={(text) =>
                        setFormData({ ...formData, phoneNumber: text })
                      }
                      placeholder="Nhập số điện thoại"
                      placeholderTextColor={COLORS.textTertiary}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Date of Birth */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ngày sinh</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={dateOfBirthDisplay}
                      onChangeText={handleDateOfBirthChange}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={COLORS.textTertiary}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    Nhập theo định dạng: 01/01/1990
                  </Text>
                </View>
              </View>

              {/* Driver's License Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Giấy phép lái xe</Text>

                {/* License Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số giấy phép lái xe</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="card-outline"
                      size={20}
                      color={COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.licenseNumber}
                      onChangeText={(text) =>
                        setFormData({ ...formData, licenseNumber: text })
                      }
                      placeholder="Nhập số giấy phép"
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>
                </View>

                {/* License Class */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Hạng giấy phép</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="ribbon-outline"
                      size={20}
                      color={COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.licenseClass}
                      onChangeText={(text) =>
                        setFormData({ ...formData, licenseClass: text })
                      }
                      placeholder="Ví dụ: B1, B2, A1..."
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>
                </View>

                {/* License Expiry */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ngày hết hạn</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={licenseExpiryDisplay}
                      onChangeText={handleLicenseExpiryChange}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={COLORS.textTertiary}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    Nhập theo định dạng: 31/12/2030
                  </Text>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Status Modal */}
        <StatusModal
          visible={statusModalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setStatusModalVisible(false)}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    ...SHADOWS.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.body,
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.huge * 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.subtitle,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.body,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.error,
  },
  helperText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADII.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    ...SHADOWS.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  saveButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
    marginBottom: -SPACING.xl,
  },
  saveButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
  },
});

export default EditProfileScreen;
