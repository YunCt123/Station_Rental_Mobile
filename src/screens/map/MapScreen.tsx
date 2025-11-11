import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { Station } from "../../types/station";
import { stationService } from "../../services/stationService";
import StationDetailsCard from "../../components/map/StationDetailsCard";
import NearbyStations from "../../components/map/NearbyStations";
import StatusModal from "../../components/common/StatusModal";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
  const mapRef = useRef<MapView>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      // Try to get user location
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });

        // Fetch nearby stations based on user location
        await fetchNearbyStations(longitude, latitude);
      } else {
        // If no permission, fetch all stations or use default location (Hanoi)
await fetchAllStations();
      }
    } catch (error) {
// Fallback: fetch all stations
      await fetchAllStations();
    }
  };

  const fetchNearbyStations = async (
    lng: number,
    lat: number,
    radiusKm: number = 50
  ) => {
    try {
      setLoading(true);
const stations = await stationService.getNearbyStations({
        lng,
        lat,
        radiusKm,
      });

setNearbyStations(stations);
    } catch (error: any) {
setErrorMessage("Không thể tải danh sách trạm gần bạn");
      setErrorModalVisible(true);
      // Fallback to all stations
      await fetchAllStations();
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStations = async () => {
    try {
      setLoading(true);
const stations = await stationService.listStations(
        { status: "ACTIVE" },
        { limit: 50 }
      );

setNearbyStations(stations);
    } catch (error: any) {
setErrorMessage(
        error.response?.data?.message || "Không thể tải danh sách trạm"
      );
      setErrorModalVisible(true);
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

      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.02, // Zoom in closer
          longitudeDelta: 0.02,
        },
        1000
      ); // 1 second animation
    }
  };

  const handleStationCardPress = (station: Station) => {
    setSelectedStation(station);
    animateToStation(station);
  };

  const handleViewDetails = (station: Station) => {
    setSelectedStation(station);
    setDetailsModalVisible(true);
  };

  const handleMarkerPress = (station: Station) => {
    setSelectedStation(station);
    animateToStation(station);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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

        {/* Real Map - Enlarged */}
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
                    <View
                      style={[
                        styles.markerContent,
                        station.metrics.vehicles_available > 0
                          ? styles.markerAvailable
                          : styles.markerUnavailable,
                      ]}
                    >
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
              <Ionicons
                name="refresh-outline"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={() => {
                // Zoom to user location
                if (userLocation) {
                  fetchNearbyStations(
                    userLocation.longitude,
                    userLocation.latitude
                  );
                }
              }}
            >
              <Ionicons
                name="locate-outline"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearby Stations */}
        <NearbyStations
          stations={nearbyStations}
          loading={loading}
          userLocation={userLocation}
          selectedStationId={selectedStation?._id || null}
          onStationPress={handleStationCardPress}
          onViewDetails={handleViewDetails}
          onRefresh={handleRefresh}
        />

        {/* Station Details Modal - Overlay */}
        {selectedStation && (
          <Modal
            visible={detailsModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setDetailsModalVisible(false)}
            statusBarTranslucent
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                style={styles.modalBackdrop}
                activeOpacity={1}
                onPress={() => setDetailsModalVisible(false)}
              />
              <View style={styles.modalContainer}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết trạm</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setDetailsModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                {/* Scrollable Content */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  <StationDetailsCard station={selectedStation} />
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </LinearGradient>

      {/* Error Modal */}
      <StatusModal
        visible={errorModalVisible}
        type="error"
        title="Lỗi"
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "600",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  mapContainer: {
    height: height * 0.45,
    margin: SPACING.screenPadding,
    borderRadius: RADII.card,
    backgroundColor: COLORS.white,
    ...SHADOWS.lg,
    position: "relative",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADII.card,
  },
  mapPlaceholderText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  mapControls: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    gap: SPACING.sm,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  map: {
    width: "100%",
    height: "100%",
    borderRadius: RADII.card,
    overflow: "hidden",
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerContent: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
    marginLeft: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.card * 2,
    borderTopRightRadius: RADII.card * 2,
    maxHeight: height * 0.85,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: FONTS.title,
    fontWeight: "600",
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalScrollContent: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.xl * 2,
  },
});

export default MapScreen;
