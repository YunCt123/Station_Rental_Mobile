import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../utils/theme';
import { VehicleCategories, FeaturedVehicles, AvailableVehicles } from '../../components';

interface ElectricVehicle {
  id: string;
  name: string;
  model: string;
  type: 'electric-car' | 'electric-bike' | 'electric-scooter' | 'electric-motorbike';
  battery: number;
  distance: string;
  pricePerHour: number;
  image: string;
  features: string[];
  stationName: string;
  isAvailable: boolean;
  rating: number;
}

interface VehicleCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

const HomeScreen = () => {
  const [greeting, setGreeting] = useState('');
  const [availableVehicles, setAvailableVehicles] = useState<ElectricVehicle[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<ElectricVehicle[]>([]);

  const vehicleCategories: VehicleCategory[] = [
    { id: '1', name: 'Xe hơi điện', icon: 'car', count: 12, color: COLORS.primary },
    { id: '2', name: 'Xe đạp điện', icon: 'bicycle', count: 8, color: COLORS.success },
    { id: '3', name: 'Xe máy điện', icon: 'speedometer', count: 15, color: COLORS.warning },
    { id: '4', name: 'Xe scooter điện', icon: 'car-sport', count: 6, color: COLORS.secondary },
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    const mockVehicles: ElectricVehicle[] = [
      {
        id: '1',
        name: 'Tesla Model 3',
        model: '2024 Standard Range',
        type: 'electric-car',
        battery: 85,
        distance: '0.3 km',
        pricePerHour: 120000,
        image: 'https://via.placeholder.com/150',
        features: ['Tự động lái', 'Sạc nhanh', 'GPS'],
        stationName: 'Trạm FPT University',
        isAvailable: true,
        rating: 4.8,
      },
      {
        id: '2',
        name: 'VinFast VF8',
        model: '2024 Eco',
        type: 'electric-car',
        battery: 92,
        distance: '0.5 km',
        pricePerHour: 100000,
        image: 'https://via.placeholder.com/150',
        features: ['Thông minh', 'An toàn cao', 'Tiết kiệm'],
        stationName: 'Trạm Keangnam',
        isAvailable: true,
        rating: 4.6,
      },
      {
        id: '3',
        name: 'Honda PCX Electric',
        model: '2024',
        type: 'electric-motorbike',
        battery: 78,
        distance: '0.8 km',
        pricePerHour: 45000,
        image: 'https://via.placeholder.com/150',
        features: ['Nhẹ nhàng', 'Tiết kiệm', 'Dễ lái'],
        stationName: 'Trạm Cầu Giấy',
        isAvailable: true,
        rating: 4.4,
      },
      {
        id: '4',
        name: 'BMW iX3',
        model: '2024',
        type: 'electric-car',
        battery: 95,
        distance: '1.2 km',
        pricePerHour: 150000,
        image: 'https://via.placeholder.com/150',
        features: ['Sang trọng', 'Hiệu suất cao', 'Công nghệ'],
        stationName: 'Trạm Lotte Center',
        isAvailable: false,
        rating: 4.9,
      },
    ];
    
    setAvailableVehicles(mockVehicles);
    setFeaturedVehicles(mockVehicles.slice(0, 3));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}!</Text>
            <Text style={styles.subtitle}>Thuê xe điện thông minh</Text>
          </View>
          <View style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </View>
        </View>

        {/* Featured Vehicles */}
        <FeaturedVehicles 
          vehicles={featuredVehicles} 
          onVehiclePress={(vehicleId) => console.log('Featured vehicle pressed:', vehicleId)} 
        />

        {/* Available Vehicles */}
        <AvailableVehicles 
          vehicles={availableVehicles} 
          onVehiclePress={(vehicleId) => console.log('Available vehicle pressed:', vehicleId)} 
        />
      </ScrollView>
    </SafeAreaView>
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