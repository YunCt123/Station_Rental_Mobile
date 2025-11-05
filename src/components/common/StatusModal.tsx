import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface StatusModalProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
  actionButtonText?: string;
  onActionPress?: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  actionButtonText = 'Đóng',
  onActionPress,
}) => {
  const iconName = type === 'success' ? 'checkmark-circle' : 'close-circle';
  const iconColor = type === 'success' ? COLORS.success : COLORS.error;
  const primaryColor = type === 'success' ? COLORS.success : COLORS.error;

  const handleActionPress = () => {
    if (onActionPress) {
      onActionPress();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackground} 
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
              <Ionicons name={iconName} size={60} color={iconColor} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={handleActionPress}
            >
              <Text style={styles.actionButtonText}>{actionButtonText}</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.header,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  actionButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
  closeButton: {
    paddingVertical: SPACING.sm,
    marginBottom: -SPACING.md
  },
  closeButtonText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default StatusModal;
