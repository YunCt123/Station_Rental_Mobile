import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../../utils/theme';

interface DocumentCardProps {
  title: string;
  description: string;
  icon: string;
  required: boolean;
  frontImage: string | null;
  backImage: string | null;
  uploading: boolean;
  showBackSide?: boolean; // Mặc định true, set false để ẩn mặt sau
  onPickFront: () => void;
  onPickBack: () => void;
  onRemoveFront: () => void;
  onRemoveBack: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  description,
  icon,
  required,
  frontImage,
  backImage,
  uploading,
  showBackSide = true,
  onPickFront,
  onPickBack,
  onRemoveFront,
  onRemoveBack,
}) => {
  return (
    <View style={styles.documentCard}>
      {/* Header */}
      <View style={styles.documentHeader}>
        <View style={styles.documentIconContainer}>
          <Ionicons name={icon as any} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.documentTitleContainer}>
          <Text style={styles.documentTitle}>{title}</Text>
          <Text style={styles.documentDescription}>{description}</Text>
        </View>
        {required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>Bắt buộc</Text>
          </View>
        )}
      </View>

      {/* Upload Section */}
      <View style={styles.uploadSection}>
        {/* Front Side */}
        <View style={styles.uploadItem}>
          <Text style={styles.uploadLabel}>Mặt trước</Text>
          {frontImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: frontImage }} style={styles.uploadedImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={onRemoveFront}
                disabled={uploading}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onPickFront}
              disabled={uploading}
            >
              <Ionicons name="cloud-upload-outline" size={32} color={COLORS.textSecondary} />
              <Text style={styles.uploadButtonText}>Tải lên ảnh</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Back Side - Chỉ hiển thị nếu showBackSide = true */}
        {showBackSide && (
          <View style={styles.uploadItem}>
            <Text style={styles.uploadLabel}>Mặt sau</Text>
            {backImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: backImage }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={onRemoveBack}
                  disabled={uploading}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={onPickBack}
                disabled={uploading}
              >
                <Ionicons name="cloud-upload-outline" size={32} color={COLORS.textSecondary} />
                <Text style={styles.uploadButtonText}>Tải lên ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  documentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADII.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentTitleContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  documentTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  documentDescription: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  requiredBadge: {
    backgroundColor: `${COLORS.error}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  requiredText: {
    fontSize: FONTS.caption,
    fontWeight: '600',
    color: COLORS.error,
  },
  uploadSection: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  uploadItem: {
    flex: 1,
  },
  uploadLabel: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  uploadButton: {
    height: 140,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  uploadButtonText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    borderRadius: RADII.md,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: RADII.md,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
});

export default DocumentCard;
