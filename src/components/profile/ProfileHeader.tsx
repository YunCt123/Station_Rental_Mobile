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
      </View>
      {/* <View style={styles.avatarContainer}>
        {userInfo.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color={COLORS.white} />
          </View>
        )}
      </View> */}
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.borderLight,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
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
  memberSince: {
    fontSize: FONTS.caption,
    color: COLORS.white,
  },
});

export default ProfileHeader;