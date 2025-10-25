import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import StatusModal from "../../components/common/StatusModal";

const EditProfileScreen = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: "Nguyễn Văn An",
    email: "nguyenvanan@email.com",
    phone: "+84 123 456 789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    dateOfBirth: "01/01/1990",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleSave = () => {
    setModalType("success");
    setModalTitle("Cập nhật thành công!");
    setModalMessage("Thông tin cá nhân của bạn đã được cập nhật.");
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      setTimeout(() => {
        navigation.goBack();
      }, 300);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert("Thay đổi ảnh đại diện", "Chọn nguồn ảnh", [
      { text: "Chụp ảnh", onPress: () => console.log("Camera") },
      { text: "Chọn từ thư viện", onPress: () => console.log("Gallery") },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradient_4} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Lưu</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleChangeAvatar}
              >
                <Ionicons name="camera" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</Text>
          </View>

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
                />
              </View>
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

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                  placeholder="Nhập địa chỉ"
                  placeholderTextColor={COLORS.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>

          {/* Additional Options */}
          <View style={styles.optionsSection}>
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.text}
                />
                <Text style={styles.optionText}>Đổi mật khẩu</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={COLORS.text}
                />
                <Text style={styles.optionText}>Xác thực hai yếu tố</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Delete Account */}
          <TouchableOpacity style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Status Modal */}
        <StatusModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={handleModalClose}
          actionButtonText="OK"
          onActionPress={handleModalClose}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer:{
    padding: SPACING.md,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.screenPadding,
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
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  saveButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.primary,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    borderRadius: RADII.card
  },
  avatarContainer: {
    position: "relative",
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.border,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
  },
  avatarHint: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  formSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADII.card
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADII.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    minHeight: 80,
  },
  textAreaIcon: {
    marginTop: SPACING.xs,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  optionsSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.xxl,
    borderRadius: RADII.card
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  optionText: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.xl,
    marginTop: -SPACING.md,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.error,
  },
});

export default EditProfileScreen;
