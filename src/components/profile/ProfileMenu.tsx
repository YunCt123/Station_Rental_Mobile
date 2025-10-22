import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  hasNotification?: boolean;
  onPress: () => void;
}

interface ProfileMenuProps {
  menuItems: MenuItem[];
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ menuItems }) => {
  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.hasNotification && <View style={styles.notificationDot} />}
        <Ionicons name="chevron-forward-outline" size={16} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>Tài khoản</Text>
      <View style={styles.menuContainer}>
        {menuItems.map(renderMenuItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.md,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screenPadding,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
});

export default ProfileMenu;