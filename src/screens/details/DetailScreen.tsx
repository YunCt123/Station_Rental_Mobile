import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { VehicleData } from '../../data/vehicles';
import mockVehicles from '../../data/vehicles';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'VehicleDetails'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DetailScreenProps {
  vehicle?: VehicleData;
}

const DetailScreen: React.FC<DetailScreenProps> = ({ vehicle: propVehicle }) => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<DetailScreenNavigationProp>();
  
  // Find vehicle by ID from mock data
  const vehicleId = route.params?.vehicleId || '1';
  const foundVehicle = mockVehicles.find(v => v.id === vehicleId);
  
  // Fallback to first vehicle if not found
  const vehicle = propVehicle || foundVehicle || mockVehicles[0];

  const renderFeature = (feature: string, index: number) => (
    <View key={index} style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  const renderSpec = ([key, value]: [string, string], index: number) => (
    <View key={index} style={styles.specItem}>
      <Text style={styles.specLabel}>{key}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết xe</Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Vehicle Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
          <View style={styles.batteryIndicator}>
            <Text style={styles.batteryText}>{vehicle.batteryLevel}%</Text>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.infoContainer}>
          <View style={styles.vehicleHeader}>
            <View style={styles.vehicleTitle}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehicleType}>{vehicle.year} • {vehicle.type}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={COLORS.warning} />
              <Text style={styles.rating}>{vehicle.rating}</Text>
              <Text style={styles.reviewCount}>({vehicle.reviewCount})</Text>
            </View>
          </View>

          {/* Status and Location */}
          <View style={styles.statusLocationContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: vehicle.status === 'Available' ? COLORS.success + '20' : COLORS.error + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: vehicle.status === 'Available' ? COLORS.success : COLORS.error }
              ]}>
                {vehicle.status === 'Available' ? 'Có sẵn' : 'Bảo trì'}
              </Text>
            </View>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>{vehicle.location}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Giá theo giờ</Text>
              <Text style={styles.priceValue}>{vehicle.hourlyRate.toLocaleString()}đ/h</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Giá theo ngày</Text>
              <Text style={styles.priceValue}>{vehicle.dailyRate.toLocaleString()}đ/ngày</Text>
            </View>
          </View>

          {/* Description */}
          {vehicle.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.description}>{vehicle.description}</Text>
            </View>
          )}

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tính năng</Text>
              <View style={styles.featuresContainer}>
                {vehicle.features.map(renderFeature)}
              </View>
            </View>
          )}

          {/* Specifications */}
          {vehicle.specs && Object.keys(vehicle.specs).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
              <View style={styles.specsContainer}>
                {Object.entries(vehicle.specs).map(renderSpec)}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.rentButton,
            { opacity: vehicle.status === 'Available' ? 1 : 0.5 }
          ]}
          disabled={vehicle.status !== 'Available'}
          onPress={() => navigation.navigate('BookingPayment', { vehicleId: vehicle.id })}
        >
          <Text style={styles.rentButtonText}>Đặt xe ngay</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: COLORS.white,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  batteryIndicator: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  vehicleTitle: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  vehicleType: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  statusLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.button,
  },
  statusText: {
    fontSize: FONTS.body,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  priceValue: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  featuresContainer: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  specsContainer: {
    gap: SPACING.md,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  specLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  specValue: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  bottomContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  rentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.button,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  rentButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default DetailScreen;