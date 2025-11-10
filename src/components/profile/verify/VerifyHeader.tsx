import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../../utils/theme';

interface VerifyHeaderProps {
  onBack: () => void;
  disabled?: boolean;
}

const VerifyHeader: React.FC<VerifyHeaderProps> = ({ onBack, disabled = false }) => {
  return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={disabled}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác minh tài khoản</Text>
        <View style={{ width: 40 }} />
      </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    flex: 1,
  },
});

export default VerifyHeader;
