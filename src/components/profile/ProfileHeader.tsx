import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
}

interface ProfileHeaderProps {
  userInfo: UserInfo;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userInfo }) => {
  return (
    <View style={styles.profileHeader}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>Name: {userInfo.name}</Text>
        <Text style={styles.userEmail}>Email: {userInfo.email}</Text>
        <Text style={styles.userPhone}>Phone: {userInfo.phone}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.screenPadding,
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.md,
    ...SHADOWS.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONTS.title,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  userPhone: {
    fontSize: FONTS.body, 
    color: COLORS.white,
  },
  memberSince: {
    fontSize: FONTS.caption,
    color: COLORS.white,
  },
});

export default ProfileHeader;