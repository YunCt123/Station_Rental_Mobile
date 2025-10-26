import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import StatusModal from "../common/StatusModal";
import { authApi } from "../../api/authApi";
import { User } from "../../types/auth";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Load user data khi modal mở
  useEffect(() => {
    if (visible) {
      loadUserData();
    }
  }, [visible]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await authApi.getStoredUser();
      if (user) {
        setFormData({
          name: user.name || user.fullName || "",
          email: user.email,
          phone: user.phone || "",
          dateOfBirth: user.dateOfBirth || "",
        });
      }
    } catch (error) {
      console.error("Load user error:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên và email");
      return;
    }

    try {
      setSaving(true);
      // TODO: Implement update user API call when backend is ready
      // await authApi.updateProfile({
      //   name: formData.name,
      //   email: formData.email,
      //   phone: formData.phone,
      //   dateOfBirth: formData.dateOfBirth
      // });

      setModalType("success");
      setModalTitle("Cập nhật thành công!");
      setModalMessage("Thông tin cá nhân của bạn đã được cập nhật.");
      setStatusModalVisible(true);
    } catch (error) {
      console.error("Update profile error:", error);
      setModalType("error");
      setModalTitle("Cập nhật thất bại");
      setModalMessage("Không thể cập nhật thông tin. Vui lòng thử lại.");
      setStatusModalVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusModalClose = () => {
    setStatusModalVisible(false);
    if (modalType === "success") {
      setTimeout(() => {
        onUpdate?.();
        onClose();
      }, 300);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              
              <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>
                
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.white} />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Form Section */}
                <View style={styles.formSection}>
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={COLORS.textSecondary}
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

                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={COLORS.textSecondary}
                      />
                      <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(text) =>
                          setFormData({ ...formData, email: text })
                        }
                        placeholder="Nhập email"
                        placeholderTextColor={COLORS.textTertiary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={false}
                      />
                    </View>
                    <Text style={styles.hint}>Email không thể thay đổi</Text>
                  </View>

                  {/* Phone Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Số điện thoại</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={COLORS.textSecondary}
                      />
                      <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(text) =>
                          setFormData({ ...formData, phone: text })
                        }
                        placeholder="Nhập số điện thoại"
                        placeholderTextColor={COLORS.textTertiary}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  {/* Date of Birth Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ngày sinh</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={COLORS.textSecondary}
                      />
                      <TextInput
                        style={styles.input}
                        value={formData.dateOfBirth}
                        onChangeText={(text) =>
                          setFormData({ ...formData, dateOfBirth: text })
                        }
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={COLORS.textTertiary}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
        </View>
        <View style={styles.buttonContainer}>
        <TouchableOpacity
                style={[
                  styles.saveButton,
                  saving && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
        </View>

      {/* Status Modal */}
      <StatusModal
        visible={statusModalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleStatusModalClose}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
  buttonContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xxl,
    ...SHADOWS.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    marginTop: -SPACING.md,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.black,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginBottom: -SPACING.md,
  },
  formSection: {
    padding: SPACING.md,
    paddingBottom: -SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  input: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.black,
    paddingVertical: SPACING.sm,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});

export default EditProfileModal;
