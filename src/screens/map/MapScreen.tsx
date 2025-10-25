import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

const { width } = Dimensions.get('window');

interface Station {
  id: string;
  name: string;
  address: string;
  distance: number;
  availableVehicles: number;
  totalVehicles: number;
  status: 'active' | 'maintenance' | 'offline';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const MapScreen = () => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);

  useEffect(() => {
    // Mock data for nearby stations
    const mockStations: Station[] = [
      {
        id: '1',
        name: 'Trạm VinFast Times City',
        address: '458 Minh Khai, Hai Bà Trưng, Hà Nội',
        distance: 0.5,
        availableVehicles: 8,
        totalVehicles: 12,
        status: 'active',
        coordinates: { latitude: 21.0285, longitude: 105.8542 },
      },
      {
        id: '2',
        name: 'Trạm VinFast Royal City',
        address: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
        distance: 1.2,
        availableVehicles: 5,
        totalVehicles: 10,
        status: 'active',
        coordinates: { latitude: 21.0014, longitude: 105.8167 },
      },
      {
        id: '3',
        name: 'Trạm VinFast Lotte Center',
        address: '54 Liễu Giai, Ba Đình, Hà Nội',
        distance: 2.1,
        availableVehicles: 0,
        totalVehicles: 8,
        status: 'maintenance',
        coordinates: { latitude: 21.0333, longitude: 105.8167 },
      },
      {
        id: '4',
        name: 'Trạm VinFast Aeon Mall',
        address: '27 Cổ Linh, Long Biên, Hà Nội',
        distance: 3.5,
        availableVehicles: 12,
        totalVehicles: 15,
        status: 'active',
        coordinates: { latitude: 21.0167, longitude: 105.8833 },
      },
    ];

    setNearbyStations(mockStations);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'maintenance': return COLORS.warning;
      case 'offline': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'maintenance': return 'Bảo trì';
      case 'offline': return 'Tạm ngưng';
      default: return 'Không xác định';
    }
  };

  const renderStationCard = (station: Station) => (
    <TouchableOpacity
      key={station.id}
      style={[
        styles.stationCard,
        selectedStation?.id === station.id && styles.selectedStationCard
      ]}
      onPress={() => setSelectedStation(station)}
    >
      <View style={styles.stationHeader}>
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{station.name}</Text>
          <Text style={styles.stationAddress}>{station.address}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(station.status) + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(station.status) }
          ]}>
            {getStatusText(station.status)}
          </Text>
        </View>
      </View>

      <View style={styles.stationDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{station.distance} km</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {station.availableVehicles}/{station.totalVehicles} xe có sẵn
          </Text>
        </View>
      </View>

      <View style={styles.availabilityBar}>
        <View style={styles.availabilityBackground}>
          <View 
            style={[
              styles.availabilityFill,
              { 
                width: `${(station.availableVehicles / station.totalVehicles) * 100}%`,
                backgroundColor: station.availableVehicles > 0 ? COLORS.success : COLORS.error
              }
            ]} 
          />
        </View>
        <Text style={styles.availabilityText}>
          {station.availableVehicles > 0 ? 'Có xe sẵn sàng' : 'Hết xe'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Bản đồ trạm</Text>
            <Text style={styles.headerSubtitle}>Tìm trạm thuê xe gần bạn</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.mapPlaceholderText}>Bản đồ sẽ hiển thị ở đây</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Hiện tại đang hiển thị {nearbyStations.length} trạm gần bạn
            </Text>
          </View>
          
          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControlButton}>
              <Ionicons name="locate-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlButton}>
              <Ionicons name="layers-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearby Stations */}
        <View style={styles.stationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trạm gần bạn</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stationsList}
          >
            {nearbyStations.map(renderStationCard)}
          </ScrollView>
        </View>

        {/* Selected Station Details */}
        {selectedStation && (
          <View style={styles.selectedStationDetails}>
            <View style={styles.selectedStationHeader}>
              <Text style={styles.selectedStationTitle}>{selectedStation.name}</Text>
              <TouchableOpacity onPress={() => setSelectedStation(null)}>
                <Ionicons name="close-circle" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.selectedStationInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>{selectedStation.address}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  {selectedStation.availableVehicles} xe có sẵn trong tổng số {selectedStation.totalVehicles} xe
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.navigateButton}>
              <Ionicons name="navigate-outline" size={20} color={COLORS.white} />
              <Text style={styles.navigateButtonText}>Chỉ đường</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    paddingBottom: 90, // Thêm padding bottom để tránh dính với bottom tabs
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: '600',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 300,
    margin: SPACING.screenPadding,
    borderRadius: RADII.card,
    backgroundColor: COLORS.white,
    ...SHADOWS.lg,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADII.card,
  },
  mapPlaceholderText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  mapPlaceholderSubtext: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  mapControls: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    gap: SPACING.sm,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  stationsSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  stationsList: {
    paddingHorizontal: SPACING.screenPadding,
  },
  stationCard: {
    width: width * 0.8,
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    ...SHADOWS.md,
  },
  selectedStationCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stationInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  stationName: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  stationAddress: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.button,
  },
  statusText: {
    fontSize: FONTS.caption,
    fontWeight: '600',
  },
  stationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  availabilityBar: {
    marginTop: SPACING.sm,
  },
  availabilityBackground: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  availabilityFill: {
    height: '100%',
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: FONTS.caption,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  selectedStationDetails: {
    backgroundColor: COLORS.white,
    margin: SPACING.screenPadding,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  selectedStationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedStationTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  selectedStationInfo: {
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    gap: SPACING.sm,
  },
  navigateButtonText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default MapScreen;
