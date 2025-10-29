import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import BottomTabNavigator from "./BottomTabNavigator";
import DetailScreen from "../screens/details/DetailScreen";
import BookingPaymentScreen from "../screens/booking/BookingPaymentScreen";
import ActiveBookingDetailScreen from "../screens/booking/ActiveBookingDetailScreen";
import HistoryBookingDetailScreen from "../screens/booking/HistoryBookingDetailScreen";
import RentalHistoryScreen from "../screens/booking/RentalHistoryScreen";
import PayOSWebViewScreen from "../screens/payment/PayOSWebViewScreen";
import VNPAYWebView from "../screens/payment/VNPAYWebView";
import VerifyAccountScreen from "../screens/profile/VerifyAccountScreen";
import { COLORS, FONTS, RADII, SPACING } from "../utils/theme";
import AuthLandingScreen from "../screens/auth/AuthLandingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import MapScreen from "../screens/map/MapScreen";
import { StationDetailScreen } from "../screens/details/StationDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const isAuthenticated = true;

  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName={"AuthLanding"}
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
          name="Login"
          component={LoginScreen}
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
          name="VehicleDetails"
          component={DetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BookingPayment"
          component={BookingPaymentScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PayOSWebView"
          component={PayOSWebViewScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="VNPAYWebView"
          component={VNPAYWebView}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ActiveBookingDetail"
          component={ActiveBookingDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="HistoryBookingDetail"
          component={HistoryBookingDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="VerifyAccount"
          component={VerifyAccountScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RentalHistory"
          component={RentalHistoryScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MapView"
          component={MapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StationDetail"
          component={StationDetailScreen}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
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
        /> */}
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
    justifyContent: "space-between",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  appSlogan: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.textSecondary,
    textAlign: "center",
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
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.primary,
  },
  guestButton: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  guestButtonText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textDecorationLine: "underline",
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.screenPadding,
  },
  screenTitle: {
    fontSize: FONTS.header,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  screenSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default MainNavigator;
