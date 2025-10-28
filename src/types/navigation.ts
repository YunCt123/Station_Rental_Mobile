// Root Stack Navigator (Auth Flow)
export type RootStackParamList = {
  // Auth Screens
  AuthLanding: undefined;
  Register: undefined;
  Login: undefined;
  
  // Main App (Bottom Tabs)
  MainTabs: undefined;
  
  // Other screens that can be accessed from anywhere
  VehicleDetails: { vehicleId: string };
  BookingPayment: { vehicleId: string };
  PayOSWebView: { paymentUrl: string; bookingId: string; amount: number; vehicleName: string };
  VNPAYWebView: { paymentUrl: string; bookingId: string; amount: number; vehicleName: string };
  StationDetails: { stationId: string };
  StationDetail: { stationId: string };
  BookingDetails: { bookingId: string };
  ActiveBookingDetail: { bookingId: string };
  HistoryBookingDetail: { bookingId: string };
  RentalHistory: undefined;
  UserInfo: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Help: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  VerifyAccount: undefined;
  MapView: undefined;
};

// Bottom Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
  Map: undefined;
};

// Home Stack Navigator
export type HomeStackParamList = {
  HomeMain: undefined;
  NearbyStations: undefined;
  VehicleScanner: undefined;
  MapView: undefined;
};

// Search Stack Navigator  
export type SearchStackParamList = {
  SearchMain: undefined;
  SearchResults: {
    query?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    vehicleType?: string;
  };
  FilterOptions: undefined;
};

// Bookings Stack Navigator
export type BookingsStackParamList = {
  BookingsList: undefined;
  ActiveBooking: undefined;
  BookingHistory: undefined;
};

// Profile Stack Navigator
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  PaymentMethods: undefined;
  RentalHistory: undefined;
  Help: undefined;
  About: undefined;
};

// Navigation Props Types
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type HomeStackNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
export type SearchStackNavigationProp = NativeStackNavigationProp<SearchStackParamList>;
export type BookingsStackNavigationProp = NativeStackNavigationProp<BookingsStackParamList>;
export type ProfileStackNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;