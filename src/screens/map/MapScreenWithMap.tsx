import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { Station } from "../../types/station";
import { stationApi } from "../../api/stationApi";
import { StationMarkerCard } from "../../components";
import StatusModal from "../../components/common/StatusModal";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreenWithMap = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState({
    latitude: 10.8231, // Mặc định TP.HCM
    longitude: 106.6297,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyStations(userLocation.longitude, userLocation.latitude);
    }
  }, [userLocation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMessage(
          "Vui lòng cấp quyền truy cập vị trí để xem các trạm gần bạn"
        );
        setErrorModalVisible(true);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });

      // Animate to user location
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      setErrorMessage("Không thể lấy vị trí của bạn");
      setErrorModalVisible(true);
      setLoading(false);
    }
  };

  const fetchNearbyStations = async (
    lng: number,
    lat: number,
    radiusKm: number = 10
  ) => {
    try {
      setLoading(true);
      const nearbyStations = await stationApi.getNearbyStations({
        lng,
        lat,
        radiusKm,
      });
      setStations(nearbyStations);
    } catch (error) {
      console.error("Error fetching nearby stations:", error);
      setErrorMessage("Không thể tải danh sách trạm");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMyLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  };

  const handleMarkerPress = (station: Station) => {
    setSelectedStation(station);

    // Animate to marker
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: station.geo.coordinates[1],
        longitude: station.geo.coordinates[0],
        latitudeDelta: LATITUDE_DELTA / 2,
        longitudeDelta: LONGITUDE_DELTA / 2,
      });
    }
  };

  const handleStationPress = (stationId: string) => {
    // Navigate to station detail
    (navigation as any).navigate("StationDetail", { stationId });
  };

  const getMarkerColor = (station: Station) => {
    if (station.status !== "ACTIVE") return COLORS.textSecondary;
    if (station.metrics.vehicles_available === 0) return COLORS.error;
    if (station.metrics.vehicles_available < 3) return COLORS.warning;
    return COLORS.primary;
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        loadingEnabled
      >
        {stations.map((station) => (
          <Marker
            key={station._id}
            coordinate={{
              latitude: station.geo.coordinates[1],
              longitude: station.geo.coordinates[0],
            }}
            onPress={() => handleMarkerPress(station)}
          >
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.marker,
                  { backgroundColor: getMarkerColor(station) },
                ]}
              >
                <Ionicons name="bicycle" size={20} color={COLORS.white} />
              </View>
              {station.fastCharging && (
                <View style={styles.fastChargingBadge}>
                  <Ionicons name="flash" size={10} color={COLORS.warning} />
                </View>
              )}
            </View>

            <Callout tooltip onPress={() => handleStationPress(station._id)}>
              <StationMarkerCard
                station={station}
                onPress={() => handleStationPress(station._id)}
              />
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.header} edges={["top"]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Bản đồ trạm</Text>
          <Text style={styles.headerSubtitle}>
            {stations.length} trạm gần bạn
          </Text>
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* My Location Button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleMyLocation}
      >
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.primary }]}
          />
          <Text style={styles.legendText}>Còn xe</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.warning }]}
          />
          <Text style={styles.legendText}>Sắp hết</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
          <Text style={styles.legendText}>Hết xe</Text>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Error Modal */}
      <StatusModal
        visible={errorModalVisible}
        type="error"
        title="Lỗi"
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  markerContainer: {
    position: "relative",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  fastChargingBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  myLocationButton: {
    position: "absolute",
    bottom: 150,
    right: SPACING.md,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  legend: {
    position: "absolute",
    bottom: 80,
    left: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

export default MapScreenWithMap;
