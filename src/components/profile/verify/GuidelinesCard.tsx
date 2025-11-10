import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../../utils/theme';

const GuidelinesCard: React.FC = () => {
  return (
    <View style={styles.guidelinesCard}>
      <View style={styles.guidelinesHeader}>
        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
        <Text style={styles.guidelinesTitle}>Hướng dẫn chụp ảnh</Text>
      </View>
      <View style={styles.guidelinesContent}>
        <View style={styles.guidelineItem}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.guidelineText}>Ảnh rõ nét, không bị mờ hoặc nhòe</Text>
        </View>
        <View style={styles.guidelineItem}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.guidelineText}>Chụp toàn bộ giấy tờ, không bị cắt xén</Text>
        </View>
        <View style={styles.guidelineItem}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.guidelineText}>Đảm bảo ánh sáng đủ, không bị chói</Text>
        </View>
        <View style={styles.guidelineItem}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.guidelineText}>Giấy tờ phải còn hiệu lực</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  guidelinesCard: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  guidelinesTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  guidelinesContent: {
    gap: SPACING.sm,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  guidelineText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
});

export default GuidelinesCard;
