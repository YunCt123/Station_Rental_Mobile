import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../utils/theme';

interface EmptyStateProps {
  type: 'active' | 'history';
}

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const getMessage = () => {
    switch (type) {
      case 'active':
        return {
          icon: 'car-outline' as const,
          title: 'Chưa có chuyến thuê nào',
          description: 'Bạn chưa có chuyến thuê xe nào đang hoạt động'
        };
      case 'history':
        return {
          icon: 'time-outline' as const,
          title: 'Chưa có lịch sử',
          description: 'Bạn chưa có lịch sử thuê xe nào'
        };
      default:
        return {
          icon: 'information-circle-outline' as const,
          title: 'Không có dữ liệu',
          description: 'Không tìm thấy thông tin'
        };
    }
  };

  const message = getMessage();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={message.icon} size={64} color={COLORS.textTertiary} />
      </View>
      <Text style={styles.title}>{message.title}</Text>
      <Text style={styles.description}>{message.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.huge * 2,
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyState;
