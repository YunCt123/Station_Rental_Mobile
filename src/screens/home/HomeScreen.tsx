import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../utils/theme';
import { FeaturedVehicles, AvailableVehicles } from '../../components';
import { RootStackParamList } from '../../types/navigation';
import { UIVehicle } from '../../services/vehicleService';
import { vehicleService, mapVehiclesToUI } from '../../services/vehicleService';

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
  const [availableVehicles, setAvailableVehicles] = useState<UIVehicle[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<UIVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all available vehicles
      const available = await vehicleService.getAvailableVehicles();
      const availableData = mapVehiclesToUI(available);
      setAvailableVehicles(availableData);

      // Fetch featured vehicles (top rated)
      const featured = await vehicleService.getFeaturedVehicles(3);
      const featuredData = mapVehiclesToUI(featured);
      setFeaturedVehicles(featuredData);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.white} />
              <Text style={styles.loadingText}>Đang tải xe...</Text>
            </View>
          ) : (
            <>
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
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    color: COLORS.white,
    marginTop: SPACING.md,
    fontSize: FONTS.body,
  },
});

export default HomeScreen;