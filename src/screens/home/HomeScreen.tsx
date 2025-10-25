import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../utils/theme';
import { FeaturedVehicles, AvailableVehicles } from '../../components';
import { RootStackParamList } from '../../types/navigation';
import { VehicleData } from '../../data/vehicles';
import mockVehicles from '../../data/vehicles';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface VehicleCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [greeting, setGreeting] = useState('');
  const [availableVehicles, setAvailableVehicles] = useState<VehicleData[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<VehicleData[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    // Use mock data from vehicles.ts
    setAvailableVehicles(mockVehicles);
    setFeaturedVehicles(mockVehicles.slice(0, 3));
  }, []);

  const handleVehiclePress = (vehicleId: string) => {
    navigation.navigate('VehicleDetails', { vehicleId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top',]}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        {/* Header - Sticky */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}!</Text>
            <Text style={styles.subtitle}>Thuê xe điện thông minh</Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
        >
          {/* Featured Vehicles */}
          <FeaturedVehicles 
            vehicles={featuredVehicles} 
            onVehiclePress={handleVehiclePress} 
          />

          {/* Available Vehicles */}
          <AvailableVehicles 
            vehicles={availableVehicles} 
            onVehiclePress={handleVehiclePress} 
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  greeting: {
    fontSize: FONTS.title,
    fontWeight: '800',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginTop: SPACING.xs,
    fontWeight: '700',
  },
});

export default HomeScreen;