import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII } from '../../utils/theme';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  avatar: string;
  isVerified: boolean;
}

interface ProfileHeaderProps {
  userInfo: UserInfo;
  onEditPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userInfo, onEditPress }) => {
  return (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
        {userInfo.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color={COLORS.white} />
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{userInfo.name}</Text>
        <Text style={styles.userEmail}>{userInfo.email}</Text>
        <Text style={styles.memberSince}>{userInfo.memberSince}</Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.screenPadding,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
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
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  memberSince: {
    fontSize: FONTS.caption,
    color: COLORS.textTertiary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileHeader;