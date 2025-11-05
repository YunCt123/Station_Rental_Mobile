import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import ProfileHeader from '../../components/profile/ProfileHeader';
import StatsGrid from '../../components/profile/StatsGrid';
import ProfileMenu from '../../components/profile/ProfileMenu';
import { authApi } from '../../api/authApi';
import { User } from '../../types/auth';

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
  const [loggingOut, setLoggingOut] = useState(false);
  const [, setLoading] = useState(true);
  const [, setUser] = useState<User | null>(null);
  
  const [userInfo, setUserInfo] = useState({
    name: 'Loading...',
    email: 'Loading...',
    phoneNumber: '',
    dateOfBirth: '',
    isVerified: false,
  });

  const [userStats] = useState<UserStats>({
    totalRides: 42,
    totalDistance: '156.8 km',
  });

  // Load user data khi component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Thử lấy user từ storage trước
      const storedUser = await authApi.getStoredUser();
      if (storedUser) {
        updateUserInfo(storedUser);
        setUser(storedUser);
      }
      
      // Sau đó fetch user mới nhất từ API
      const currentUser = await authApi.getCurrentUser();
      updateUserInfo(currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error('Load user error:', error);
      // Nếu lỗi, dùng stored user
      const storedUser = await authApi.getStoredUser();
      if (storedUser) {
        updateUserInfo(storedUser);
        setUser(storedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserInfo = (userData: User) => {
    setUserInfo({
      name: userData.name || userData.fullName || 'Người dùng',
      email: userData.email,
      phoneNumber: userData.phoneNumber || '',
      dateOfBirth: userData.dateOfBirth || '',
      isVerified: userData.isVerified || false,
    });
  };

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
      id: 'settings',
      title: 'Chỉnh sửa thông tin',
      icon: 'person-outline',
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
        { 
          text: 'Đăng xuất', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoggingOut(true);
              await authApi.logout();
              // Navigate to auth screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'AuthLanding' as never }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
       
          {/* Profile Header */}
          <ProfileHeader 
            userInfo={userInfo}
          />
         <ScrollView 
          showsVerticalScrollIndicator={false}
        >
          {/* User Stats */}
          <StatsGrid stats={userStats} />

          {/* Menu Items */}
          <ProfileMenu menuItems={menuItems} />
      
          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.logoutButton, loggingOut && styles.logoutButtonDisabled]} 
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            )}
            <Text style={styles.logoutText}>
              {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradientBackground: {
    flex: 1,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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
  logoutButtonDisabled: {
    opacity: 0.6,
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
