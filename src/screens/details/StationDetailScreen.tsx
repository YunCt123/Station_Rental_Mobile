import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { Station, StationVehicle } from "../../types/station";
import { stationApi } from "../../api/stationApi";

export const StationDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { stationId } = route.params as { stationId: string };

  const [station, setStation] = useState<Station | null>(null);
  const [vehicles, setVehicles] = useState<StationVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStationDetails();
  }, [stationId]);

  const fetchStationDetails = async () => {
    try {
      setLoading(true);
      const [stationData, vehiclesData] = await Promise.all([
        stationApi.getStationById(stationId, true),
        stationApi.getStationVehicles(stationId, "AVAILABLE"),
      ]);
      
      setStation(stationData);
      setVehicles(vehiclesData.vehicles);
    } catch (error) {
      console.error("Error fetching station details:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin trạm");
    } finally {
      setLoading(false);
    }
  };

  const getAmenityInfo = (amenity: string) => {
    const amenityMap: Record<string, { icon: string; label: string }> = {
      fast_charging: { icon: "flash", label: "Sạc nhanh" },
      cafe: { icon: "cafe", label: "Quán cà phê" },
      restroom: { icon: "water", label: "Nhà vệ sinh" },
      parking: { icon: "car", label: "Bãi đỗ xe" },
    };
    return amenityMap[amenity] || { icon: "checkmark-circle", label: amenity };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!station) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy trạm</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={COLORS.gradient_4} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Chi tiết trạm</Text>
          </View>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="share-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Station Image */}
          {station.image && (
            <Image source={{ uri: station.image }} style={styles.stationImage} />
          )}

          {/* Station Info */}
          <View style={styles.infoCard}>
            <View style={styles.nameRow}>
              <Text style={styles.stationName}>{station.name}</Text>
              {station.status === "ACTIVE" && (
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Hoạt động</Text>
                </View>
              )}
            </View>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={COLORS.warning} />
              <Text style={styles.ratingText}>{station.rating.avg.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({station.rating.count} đánh giá)</Text>
            </View>

            <View style={styles.addressRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={COLORS.textSecondary}
              />
              <Text style={styles.addressText}>{station.address}</Text>
            </View>

            <View style={styles.cityRow}>
              <Ionicons
                name="business-outline"
                size={18}
                color={COLORS.textSecondary}
              />
              <Text style={styles.cityText}>{station.city}</Text>
            </View>
          </View>

          {/* Availability Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Tình trạng xe</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="bicycle" size={24} color={COLORS.primary} />
                <Text style={styles.statValue}>
                  {station.metrics.vehicles_available}
                </Text>
                <Text style={styles.statLabel}>Xe sẵn sàng</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="car-sport" size={24} color={COLORS.warning} />
                <Text style={styles.statValue}>
                  {station.metrics.vehicles_in_use}
                </Text>
                <Text style={styles.statLabel}>Đang thuê</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="apps" size={24} color={COLORS.textSecondary} />
                <Text style={styles.statValue}>
                  {station.metrics.vehicles_total}
                </Text>
                <Text style={styles.statLabel}>Tổng số xe</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={24} color={COLORS.success} />
                <Text style={styles.statValue}>
                  {station.metrics.utilization_rate}%
                </Text>
                <Text style={styles.statLabel}>Sử dụng</Text>
              </View>
            </View>
          </View>

          {/* Amenities */}
          {station.amenities && station.amenities.length > 0 && (
            <View style={styles.amenitiesCard}>
              <Text style={styles.cardTitle}>Tiện ích</Text>
              <View style={styles.amenitiesGrid}>
                {station.amenities.map((amenity, index) => {
                  const info = getAmenityInfo(amenity);
                  return (
                    <View key={index} style={styles.amenityItem}>
                      <Ionicons
                        name={info.icon as any}
                        size={20}
                        color={COLORS.primary}
                      />
                      <Text style={styles.amenityLabel}>{info.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Operating Hours */}
          {station.operatingHours && (
            <View style={styles.hoursCard}>
              <Text style={styles.cardTitle}>Giờ hoạt động</Text>
              {station.operatingHours.mon_fri && (
                <View style={styles.hourRow}>
                  <Text style={styles.hourLabel}>Thứ 2 - Thứ 6:</Text>
                  <Text style={styles.hourValue}>
                    {station.operatingHours.mon_fri}
                  </Text>
                </View>
              )}
              {station.operatingHours.weekend && (
                <View style={styles.hourRow}>
                  <Text style={styles.hourLabel}>Cuối tuần:</Text>
                  <Text style={styles.hourValue}>
                    {station.operatingHours.weekend}
                  </Text>
                </View>
              )}
              {station.operatingHours.holiday && (
                <View style={styles.hourRow}>
                  <Text style={styles.hourLabel}>Ngày lễ:</Text>
                  <Text style={styles.hourValue}>
                    {station.operatingHours.holiday}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Available Vehicles */}
          <View style={styles.vehiclesCard}>
            <Text style={styles.cardTitle}>
              Xe có sẵn ({vehicles.length})
            </Text>
            {vehicles.map((vehicle, index) => (
              <TouchableOpacity key={index} style={styles.vehicleItem}>
                {vehicle.image && (
                  <Image
                    source={{ uri: vehicle.image }}
                    style={styles.vehicleImage}
                  />
                )}
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>
                    {vehicle.brand} {vehicle.model}
                  </Text>
                  <Text style={styles.vehicleType}>{vehicle.type}</Text>
                  <View style={styles.vehicleDetails}>
                    <Ionicons name="battery-half" size={14} color={COLORS.success} />
                    <Text style={styles.vehicleDetailText}>
                      {vehicle.batteryLevel}%
                    </Text>
                  </View>
                </View>
                <View style={styles.vehiclePrice}>
                  <Text style={styles.priceAmount}>
                    {vehicle.pricePerHour.toLocaleString()}đ
                  </Text>
                  <Text style={styles.priceUnit}>/giờ</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomAction}>
          <TouchableOpacity style={styles.directionButton}>
            <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
            <Text style={styles.directionButtonText}>Chỉ đường</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rentButton}>
            <Text style={styles.rentButtonText}>Chọn xe thuê</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  stationImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.md,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  stationName: {
    flex: 1,
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADII.pill,
    gap: SPACING.xs / 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  activeText: {
    fontSize: FONTS.caption,
    color: COLORS.success,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  ratingText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  ratingCount: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  addressText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  cityText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.md,
  },
  cardTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
  },
  statValue: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  amenitiesCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.md,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADII.button,
  },
  amenityLabel: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  hoursCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.md,
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  hourLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  hourValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  vehiclesCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    marginBottom: 100,
    borderRadius: RADII.card,
    ...SHADOWS.md,
  },
  vehicleItem: {
    flexDirection: "row",
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
  },
  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: RADII.sm,
    marginRight: SPACING.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  vehicleType: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  vehicleDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs / 2,
  },
  vehicleDetailText: {
    fontSize: FONTS.caption,
    color: COLORS.success,
  },
  vehiclePrice: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  priceAmount: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  bottomAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: SPACING.screenPadding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  directionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADII.button,
    gap: SPACING.xs,
  },
  directionButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.primary,
  },
  rentButton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.button,
  },
  rentButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.white,
  },
});
