import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import BottomTabNavigator from './BottomTabNavigator';
import { COLORS, FONTS, RADII, SPACING } from '../utils/theme';

// Import auth screens (placeholders for now)
const AuthLandingScreen = () => {
  
  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authContent}>
        <View style={styles.logoContainer}>
          <Ionicons name="bicycle" size={80} color={COLORS.primary} />
          <Text style={styles.appName}>EcoRide</Text>
          <Text style={styles.appSlogan}>
            Thuê phương tiện điện thông minh
          </Text>
        </View>
        
        <View style={styles.authButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Đăng ký</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.guestButton}>
            <Text style={styles.guestButtonText}>Dùng thử không cần đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const RegisterScreen = () => {
  
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Đăng ký tài khoản</Text>
        <Text style={styles.screenSubtitle}>
          Tạo tài khoản để trải nghiệm đầy đủ các tính năng
        </Text>
      </View>
    </SafeAreaView>
  );
};

const UserInfoScreen = () => {
  
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Thông tin người dùng</Text>
        <Text style={styles.screenSubtitle}>
          Xem và chỉnh sửa thông tin cá nhân của bạn
        </Text>
      </View>
    </SafeAreaView>
  );
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const isAuthenticated = true; // This would come from auth context/state

  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName={isAuthenticated ? 'MainTabs' : 'AuthLanding'}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen
          name="AuthLanding"
          component={AuthLandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        
        {/* Main App */}
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        
        {/* Other Screens */}
        <Stack.Screen
          name="UserInfo"
          component={UserInfoScreen}
          options={{
            headerShown: true,
            title: 'Thông tin cá nhân',
            headerStyle: {
              backgroundColor: COLORS.white,
            },
            headerTintColor: COLORS.primary,
            headerTitleStyle: {
              fontSize: FONTS.title,
              fontWeight: '600',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  authContent: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  appSlogan: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  authButtons: {
    paddingBottom: SPACING.huge,
    gap: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.primary,
  },
  guestButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
  },
  screenTitle: {
    fontSize: FONTS.header,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MainNavigator;
