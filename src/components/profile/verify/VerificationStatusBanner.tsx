import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII } from '../../../utils/theme';

interface VerificationStatusBannerProps {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  hasUploadedDocuments?: boolean;
}

const VerificationStatusBanner: React.FC<VerificationStatusBannerProps> = ({ 
  status, 
  rejectionReason,
  hasUploadedDocuments = false
}) => {
  // Chỉ hiển thị banner PENDING nếu đã có documents được upload
  if (status === 'PENDING' && !hasUploadedDocuments) {
    return null;
  }

  if (!status) {
    // Chưa submit
    return (
      <View style={[styles.banner, styles.bannerInfo]}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Chưa xác minh</Text>
          <Text style={styles.message}>
            Vui lòng tải lên giấy tờ để xác minh tài khoản
          </Text>
        </View>
      </View>
    );
  }

  if (status === 'PENDING') {
    return (
      <View style={[styles.banner, styles.bannerWarning]}>
        <View style={styles.iconContainer}>
          <Ionicons name="time" size={24} color={COLORS.warning} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, styles.titleWarning]}>Đang chờ duyệt</Text>
          <Text style={styles.message}>
            Tài liệu của bạn đang được xem xét. Thời gian duyệt: 24-48 giờ
          </Text>
        </View>
      </View>
    );
  }

  if (status === 'APPROVED') {
    return (
      <View style={[styles.banner, styles.bannerSuccess]}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, styles.titleSuccess]}>Đã xác minh</Text>
          <Text style={styles.message}>
            Tài khoản của bạn đã được xác minh thành công
          </Text>
        </View>
      </View>
    );
  }

  if (status === 'REJECTED') {
    return (
      <View style={[styles.banner, styles.bannerError]}>
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle" size={24} color={COLORS.error} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, styles.titleError]}>Bị từ chối</Text>
          <Text style={styles.message}>
            {rejectionReason || 'Tài liệu không hợp lệ. Vui lòng tải lên lại'}
          </Text>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
  },
  bannerInfo: {
    backgroundColor: `${COLORS.primary}10`,
    borderLeftColor: COLORS.primary,
  },
  bannerWarning: {
    backgroundColor: `${COLORS.warning}10`,
    borderLeftColor: COLORS.warning,
  },
  bannerSuccess: {
    backgroundColor: `${COLORS.success}10`,
    borderLeftColor: COLORS.success,
  },
  bannerError: {
    backgroundColor: `${COLORS.error}10`,
    borderLeftColor: COLORS.error,
  },
  iconContainer: {
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  titleWarning: {
    color: COLORS.warning,
  },
  titleSuccess: {
    color: COLORS.success,
  },
  titleError: {
    color: COLORS.error,
  },
  message: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default VerificationStatusBanner;
