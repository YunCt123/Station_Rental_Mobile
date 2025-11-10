import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII } from '../../utils/theme';
import { RootStackParamList } from '../../types/navigation';

const logo = require('../../../assets/logo2.png');

type AuthLandingNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AuthLandingScreen = () => {
  const navigation = useNavigation<AuthLandingNavigationProp>();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient_2}
        style={styles.gradientBackground}
      >
        {/* Logo and Branding */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image 
              source={logo} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>EVRental</Text>
          <Text style={styles.appSlogan}>
            Thuê xe điện thông minh{'\n'}
            Thân thiện với môi trường
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="flash" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.featureText}>100% Xe điện</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="location" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.featureText}>Dễ dàng tìm xe</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="time" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.featureText}>Thuê theo giờ</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login' as any)}
          >
            <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register' as any)}
          >
            <Text style={styles.secondaryButtonText}>Đăng ký</Text>
          </TouchableOpacity>

          {/* Guest mode disabled - users must login to book vehicles */}
          {/* <TouchableOpacity
            style={styles.guestButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.guestButtonText}>
              Tiếp tục không cần đăng nhập
            </Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity> */}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary, // Xanh lá neon
  },
  gradientBackground: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.huge,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  appSlogan: {
    fontSize: FONTS.title,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.huge,
    paddingHorizontal: SPACING.md,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonsContainer: {
    paddingBottom: SPACING.huge,
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  secondaryButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
  guestButton: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  guestButtonText: {
    fontSize: FONTS.body,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
});

export default AuthLandingScreen;
