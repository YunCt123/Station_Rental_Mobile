import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import ProfileHeader from '../../components/profile/ProfileHeader';
import StatsGrid from '../../components/profile/StatsGrid';
import ProfileMenu from '../../components/profile/ProfileMenu';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  hasNotification?: boolean;
  onPress: () => void;
}

interface UserStats {
  totalRides: number;
  totalDistance: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  
  const [userInfo] = useState({
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    phone: '+84 123 456 789',
    memberSince: 'Thành viên từ 2024',
    avatar: 'https://via.placeholder.com/150',
    isVerified: true,
  });

  const [userStats] = useState<UserStats>({
    totalRides: 42,
    totalDistance: '156.8 km',
  });

  const menuItems: MenuItem[] = [
    {
      id: 'verify-account',
      title: 'Xác minh tài khoản',
      icon: 'shield-checkmark-outline',
      onPress: () => navigation.navigate('VerifyAccount' as never),
    },
    {
      id: 'rental-history',
      title: 'Lịch sử thuê xe',
      icon: 'time-outline',
      onPress: () => navigation.navigate('RentalHistory' as never),
    },
    {
      id: 'payment',
      title: 'Phương thức thanh toán',
      icon: 'card-outline',
      onPress: () => console.log('Payment methods'),
    },
    {
      id: 'settings',
      title: 'Cài đặt',
      icon: 'settings-outline',
      onPress: () => navigation.navigate('EditProfile' as never),
    },
    {
      id: 'help',
      title: 'Trợ giúp & Hỗ trợ',
      icon: 'help-circle-outline',
      onPress: () => console.log('Help & Support'),
    },
    {
      id: 'about',
      title: 'Về chúng tôi',
      icon: 'information-circle-outline',
      onPress: () => console.log('About us'),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };



  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ProfileHeader 
          userInfo={userInfo}
        />

        {/* User Stats */}
        <StatsGrid stats={userStats} />

        {/* Menu Items */}
        <ProfileMenu menuItems={menuItems} />

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    backgroundColor: COLORS.border,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
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
    fontWeight: '700',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.title,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: SPACING.xl,
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
    paddingVertical: SPACING.lg,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  logoutText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '500',
    color: COLORS.error,
  },
  appVersion: {
    fontSize: FONTS.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
    paddingBottom: SPACING.xl,
  },
});

export default ProfileScreen;
