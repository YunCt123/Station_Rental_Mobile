import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../utils/theme';
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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}!</Text>
            <Text style={styles.subtitle}>Thuê xe điện thông minh</Text>
          </View>
        </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONTS.title,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;