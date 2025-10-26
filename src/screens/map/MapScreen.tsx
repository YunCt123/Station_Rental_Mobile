import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { Station } from '../../types/station';
import { stationApi } from '../../api/stationApi';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);

  useEffect(() => {
    // Mock data for nearby stations - Match Station type from MongoDB
    const mockStations: Station[] = [
      {
        _id: '1',
        name: 'Trạm VinFast Times City',
        address: '458 Minh Khai, Hai Bà Trưng, Hà Nội',
        city: 'Hà Nội',
        geo: {
          type: 'Point',
          coordinates: [105.8542, 21.0285] // [lng, lat]
        },
        totalSlots: 12,
        amenities: ['fast_charging', 'cafe', 'parking'],
        fastCharging: true,
        rating: {
          avg: 4.5,
          count: 128
        },
        operatingHours: {
          mon_fri: '6:00 - 22:00',
          weekend: '7:00 - 23:00'
        },
        status: 'ACTIVE',
        metrics: {
          vehicles_total: 12,
          vehicles_available: 8,
          vehicles_in_use: 4,
          utilization_rate: 33
        }
      },
      {
        _id: '2',
        name: 'Trạm VinFast Royal City',
        address: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
        city: 'Hà Nội',
        geo: {
          type: 'Point',
          coordinates: [105.8167, 21.0014]
        },
        totalSlots: 10,
        amenities: ['cafe', 'restroom'],
        fastCharging: false,
        rating: {
          avg: 4.2,
          count: 95
        },
        operatingHours: {
          mon_fri: '6:00 - 22:00',
          weekend: '7:00 - 23:00'
        },
        status: 'ACTIVE',
        metrics: {
          vehicles_total: 10,
          vehicles_available: 5,
          vehicles_in_use: 5,
          utilization_rate: 50
        }
      },
      {
        _id: '3',
        name: 'Trạm VinFast Lotte Center',
        address: '54 Liễu Giai, Ba Đình, Hà Nội',
        city: 'Hà Nội',
        geo: {
          type: 'Point',
          coordinates: [105.8167, 21.0333]
        },
        totalSlots: 8,
        amenities: ['parking'],
        fastCharging: false,
        rating: {
          avg: 4.0,
          count: 67
        },
        operatingHours: {
          mon_fri: '6:00 - 22:00'
        },
        status: 'UNDER_MAINTENANCE',
        metrics: {
          vehicles_total: 8,
          vehicles_available: 0,
          vehicles_in_use: 0,
          utilization_rate: 0
        }
      },
      {
        _id: '4',
        name: 'Trạm VinFast Aeon Mall',
        address: '27 Cổ Linh, Long Biên, Hà Nội',
        city: 'Hà Nội',
        geo: {
          type: 'Point',
          coordinates: [105.8833, 21.0167]
        },
        totalSlots: 15,
        amenities: ['fast_charging', 'cafe', 'restroom', 'parking'],
        fastCharging: true,
        rating: {
          avg: 4.8,
          count: 203
        },
        operatingHours: {
          mon_fri: '6:00 - 23:00',
          weekend: '6:00 - 24:00'
        },
        status: 'ACTIVE',
        metrics: {
          vehicles_total: 15,
          vehicles_available: 12,
          vehicles_in_use: 3,
          utilization_rate: 20
        }
      },
    ];

    setNearbyStations(mockStations);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return COLORS.success;
      case 'UNDER_MAINTENANCE': return COLORS.warning;
      case 'INACTIVE': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'UNDER_MAINTENANCE': return 'Bảo trì';
      case 'INACTIVE': return 'Tạm ngưng';
      default: return 'Không xác định';
    }
  };

  const renderStationCard = (station: Station) => (
    <TouchableOpacity
      key={station._id}
      style={[
        styles.stationCard,
        selectedStation?._id === station._id && styles.selectedStationCard
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
          <Text style={styles.detailText}>{station.city}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {station.metrics.vehicles_available}/{station.metrics.vehicles_total} xe
          </Text>
        </View>
      </View>

      <View style={styles.availabilityBar}>
        <View style={styles.availabilityBackground}>
          <View 
            style={[
              styles.availabilityFill,
              { 
                width: `${(station.metrics.vehicles_available / station.metrics.vehicles_total) * 100}%`,
                backgroundColor: station.metrics.vehicles_available > 0 ? COLORS.success : COLORS.error
              }
            ]} 
          />
        </View>
        <Text style={styles.availabilityText}>
          {station.metrics.vehicles_available > 0 ? 'Có xe sẵn sàng' : 'Hết xe'}
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
                  {selectedStation.metrics.vehicles_available} xe có sẵn trong tổng số {selectedStation.metrics.vehicles_total} xe
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
    backgroundColor: COLORS.primary,
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
    paddingVertical: SPACING.md,
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
