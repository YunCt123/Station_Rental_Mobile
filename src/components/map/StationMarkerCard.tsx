import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { Station } from "../../types/station";

interface StationMarkerCardProps {
  station: Station;
  onPress: () => void;
}

const StationMarkerCard: React.FC<StationMarkerCardProps> = ({
  station,
  onPress,
}) => {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "fast_charging":
        return "flash";
      case "cafe":
        return "cafe";
      case "restroom":
        return "water";
      case "parking":
        return "car";
      default:
        return "checkmark-circle";
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.stationName} numberOfLines={1}>
            {station.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.ratingText}>
              {station.rating.avg.toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>({station.rating.count})</Text>
          </View>
        </View>
        {station.status === "ACTIVE" && (
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Hoạt động</Text>
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="location-outline"
          size={14}
          color={COLORS.textSecondary}
        />
        <Text style={styles.address} numberOfLines={1}>
          {station.address}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="bicycle" size={16} color={COLORS.primary} />
          <Text style={styles.statText}>
            {station.metrics.vehicles_available}/{station.metrics.vehicles_total}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.amenitiesContainer}>
          {station.amenities.slice(0, 3).map((amenity, index) => (
            <Ionicons
              key={index}
              name={getAmenityIcon(amenity) as any}
              size={16}
              color={COLORS.textSecondary}
              style={styles.amenityIcon}
            />
          ))}
          {station.amenities.length > 3 && (
            <Text style={styles.moreAmenities}>+{station.amenities.length - 3}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    minWidth: 280,
    maxWidth: 320,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
  },
  stationName: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs / 2,
  },
  ratingText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADII.pill,
    gap: SPACING.xs / 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: FONTS.caption,
    color: COLORS.success,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  address: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  statText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
  },
  amenitiesContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  amenityIcon: {
    marginRight: SPACING.xs / 2,
  },
  moreAmenities: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});

export default StationMarkerCard;
