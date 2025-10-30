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
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { Station } from '../../types/station';
import { stationService } from '../../services/stationService';
import StationDetailsCard from '../../components/map/StationDetailsCard';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      // Try to get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        
        // Fetch nearby stations based on user location
        await fetchNearbyStations(longitude, latitude);
      } else {
        // If no permission, fetch all stations or use default location (Hanoi)
        console.log('[MapScreen] Location permission not granted, using default location');
        await fetchAllStations();
      }
    } catch (error) {
      console.error('[MapScreen] Error initializing:', error);
      // Fallback: fetch all stations
      await fetchAllStations();
    }
  };

  const fetchNearbyStations = async (lng: number, lat: number, radiusKm: number = 50) => {
    try {
      setLoading(true);
      console.log('[MapScreen] Fetching nearby stations:', { lng, lat, radiusKm });
      
      const stations = await stationService.getNearbyStations({
        lng,
        lat,
        radiusKm,
      });
      
      console.log('[MapScreen] Fetched stations:', stations.length);
      setNearbyStations(stations);
    } catch (error: any) {
      console.error('[MapScreen] Error fetching nearby stations:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách trạm gần bạn');
      // Fallback to all stations
      await fetchAllStations();
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStations = async () => {
    try {
      setLoading(true);
      console.log('[MapScreen] Fetching all stations');
      
      const stations = await stationService.listStations({ status: 'ACTIVE' }, { limit: 50 });
      
      console.log('[MapScreen] Fetched all stations:', stations.length);
      setNearbyStations(stations);
    } catch (error: any) {
      console.error('[MapScreen] Error fetching all stations:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải danh sách trạm');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (userLocation) {
      await fetchNearbyStations(userLocation.longitude, userLocation.latitude);
    } else {
      await fetchAllStations();
    }
  };

  const animateToStation = (station: Station) => {
    if (mapRef.current) {
      const latitude = station.geo.coordinates[1];
      const longitude = station.geo.coordinates[0];
      
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.02, // Zoom in closer
        longitudeDelta: 0.02,
      }, 1000); // 1 second animation
    }
  };

  const handleStationCardPress = (station: Station) => {
    setSelectedStation(station);
    animateToStation(station);
  };

  const handleMarkerPress = (station: Station) => {
    setSelectedStation(station);
    animateToStation(station);
  };

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
      onPress={() => handleStationCardPress(station)}
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
            Tổng: {station.metrics.vehicles_total} xe
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        {/* Header - Fixed */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Bản đồ trạm</Text>
            <Text style={styles.headerSubtitle}>Tìm trạm thuê xe gần bạn</Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

        {/* Real Map */}
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.mapPlaceholderText}>Đang tải bản đồ...</Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: userLocation?.latitude || 21.0285,
                longitude: userLocation?.longitude || 105.8542,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {nearbyStations.map((station) => (
                <Marker
                  key={station._id}
                  coordinate={{
                    latitude: station.geo.coordinates[1],
                    longitude: station.geo.coordinates[0],
                  }}
                  title={station.name}
                  description={`${station.metrics.vehicles_available}/${station.metrics.vehicles_total} xe sẵn`}
                  onPress={() => handleMarkerPress(station)}
                >
                  <View style={styles.customMarker}>
                    <View style={[
                      styles.markerContent,
                      station.metrics.vehicles_available > 0 
                        ? styles.markerAvailable 
                        : styles.markerUnavailable
                    ]}>
                      <Ionicons 
                        name="location" 
                        size={24} 
                        color={COLORS.white} 
                      />
                      <Text style={styles.markerText}>
                        {station.metrics.vehicles_available}
                      </Text>
                    </View>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
          
          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={() => {
                // Zoom to user location
                if (userLocation) {
                  fetchNearbyStations(userLocation.longitude, userLocation.latitude);
                }
              }}
            >
              <Ionicons name="locate-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearby Stations */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {userLocation ? 'Trạm gần bạn' : 'Tất cả trạm'}
            </Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Text style={styles.seeAllText}>Làm mới</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : nearbyStations.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stationsList}
            >
              {nearbyStations.map(renderStationCard)}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Không tìm thấy trạm nào</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

          {/* Selected Station Details - Below Cards */}
          {selectedStation && (
            <View style={styles.detailsSection}>
              <StationDetailsCard
                station={selectedStation}
                onClose={() => setSelectedStation(null)}
              />
            </View>
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
  scrollContent: {
    paddingBottom: 100, // Space for bottom tabs
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
  map: {
    width: '100%',
    height: '100%',
    borderRadius: RADII.card,
    overflow: 'hidden',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    ...SHADOWS.md,
  },
  markerAvailable: {
    backgroundColor: COLORS.success,
  },
  markerUnavailable: {
    backgroundColor: COLORS.error,
  },
  markerText: {
    color: COLORS.white,
    fontSize: FONTS.caption,
    fontWeight: '700',
    marginLeft: SPACING.xs,
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
    marginBottom: SPACING.md, 
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metricText: {
    fontSize: FONTS.caption,
    fontWeight: '600',
  },
  detailsSection: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.screenPadding,
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADII.button,
  },
  retryButtonText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default MapScreen;
