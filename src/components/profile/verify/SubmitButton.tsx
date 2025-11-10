import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../../utils/theme';

interface SubmitButtonProps {
  uploading: boolean;
  onSubmit: () => void;
  isUpdate?: boolean;
  disabled?: boolean;
  hasUploadedDocuments?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  uploading, 
  onSubmit, 
  isUpdate = false,
  disabled = false,
  hasUploadedDocuments = false
}) => {
  // Chỉ disable khi: đang upload HOẶC (disabled = true VÀ đã có documents)
  const isDisabled = uploading || (disabled && hasUploadedDocuments);
  
  return (
    <View style={styles.bottomContainer}>
      <TouchableOpacity
        style={[
          styles.submitButton, 
          isDisabled && styles.submitButtonDisabled
        ]}
        onPress={onSubmit}
        disabled={isDisabled}
      >
        {uploading ? (
          <>
            <ActivityIndicator size="small" color={COLORS.white} />
            <Text style={styles.submitButtonText}>Đang gửi...</Text>
          </>
        ) : (disabled && hasUploadedDocuments) ? (
          <>
            <Ionicons name="time-outline" size={20} color={COLORS.white} />
            <Text style={styles.submitButtonText}>Đang chờ phê duyệt...</Text>
          </>
        ) : (
          <>
            <Text style={styles.submitButtonText}>
              {isUpdate ? 'Cập nhật tài liệu' : 'Gửi xác minh'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.md,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default SubmitButton;
