import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  vehicleName: string;
  location: string;
  pickupTime: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  onClose,
  bookingId,
  vehicleName,
  location,
  pickupTime,
}) => {
  // Generate QR data
  const qrData = JSON.stringify({
    bookingId,
    vehicleName,
    location,
    pickupTime,
    timestamp: new Date().toISOString(),
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Mã QR Check-in</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Instructions */}
              <View style={styles.instructionBanner}>
                <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                <Text style={styles.instructionText}>
                  Vui lòng đưa mã QR này cho nhân viên tại quầy để nhận xe
                </Text>
              </View>

              {/* QR Code */}
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={qrData}
                    size={220}
                    color={COLORS.text}
                    backgroundColor={COLORS.white}
                  />
                </View>
              </View>

              {/* Booking Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Thông tin đặt xe</Text>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Mã đặt xe</Text>
                    <Text style={styles.infoValue}>{bookingId}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="car-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Xe</Text>
                    <Text style={styles.infoValue}>{vehicleName}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Địa điểm</Text>
                    <Text style={styles.infoValue}>{location}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Thời gian nhận xe</Text>
                    <Text style={styles.infoValue}>{pickupTime}</Text>
                  </View>
                </View>
              </View>

              {/* Warning */}
              <View style={styles.warningBanner}>
                <Ionicons name="warning-outline" size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  Mã QR này chỉ có hiệu lực trong 15 phút trước thời gian nhận xe
                </Text>
              </View>

              {/* Bottom Spacing for scroll */}
              <View style={{ height: SPACING.xl }} />
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    maxHeight: '92%',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    ...SHADOWS.lg,
    height: '100%',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADII.md,
    gap: SPACING.sm,
  },
  instructionText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.primary,
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  qrWrapper: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    ...SHADOWS.md,
  },
  infoSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADII.md,
    gap: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: FONTS.caption,
    color: COLORS.warning,
    lineHeight: 18,
  },
  actionButtonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default QRCodeModal;
