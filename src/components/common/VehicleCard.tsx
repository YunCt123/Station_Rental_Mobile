import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { Vehicle } from "../../services";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: (vehicleId: string) => void;
  variant?: "horizontal" | "vertical";
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPress,
  variant = "horizontal",
}) => {
  if (variant === "vertical") {
    return (
      <TouchableOpacity
        style={styles.verticalCard}
        onPress={() => onPress(vehicle._id)}
      >
        <View style={styles.verticalImageContainer}>
          <Image source={{ uri: vehicle.image }} style={styles.verticalImage} />
          <View style={styles.batteryIndicatorVertical}>
            <Ionicons name="battery-charging" size={10} color={COLORS.white} />
            <Text style={styles.batteryText}>{vehicle.batteryLevel}%</Text>
          </View>
        </View>

        <View style={styles.verticalInfo}>
          <View style={styles.vehicleHeader}>
            <Text style={styles.vehicleName} numberOfLines={1}>
              {vehicle.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={COLORS.warning} />
              <Text style={styles.rating}>{vehicle.rating}</Text>
            </View>
          </View>

          <Text style={styles.vehicleModel} numberOfLines={1}>
            {vehicle.year} • {vehicle.type}
          </Text>

          <View style={styles.vehicleDetails}>
            <View style={styles.detailItem}>
              <Ionicons
                name="location-outline"
                size={12}
                color={COLORS.textSecondary}
              />
              <Text style={styles.detailText} numberOfLines={1}>
                {vehicle.range} km
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name="time-outline"
                size={12}
                color={COLORS.textSecondary}
              />
              <Text style={styles.detailText}>
                {vehicle.pricePerHour.toLocaleString("vi-VN")} VND/h
              </Text>
            </View>
          </View>

          <Text style={styles.stationName} numberOfLines={1}>
            {vehicle.station_name}
          </Text>

          <View
            style={[
              styles.availabilityBadge,
              {
                backgroundColor:
                  vehicle.status === "AVAILABLE"
                    ? COLORS.success + "20"
                    : COLORS.error + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.availabilityText,
                {
                  color:
                    vehicle.status === "AVAILABLE"
                      ? COLORS.success
                      : COLORS.error,
                },
              ]}
            >
              {vehicle.status === "AVAILABLE"
                ? "Có sẵn"
                : vehicle.status === "RESERVED"
                ? "Đã đặt"
                : vehicle.status === "RENTED"
                ? "Đang cho thuê"
                : vehicle.status === "MAINTENANCE"
                ? "Bảo trì"
                : "Không xác định"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Horizontal variant (default)
  return (
    <TouchableOpacity
      style={styles.horizontalCard}
      onPress={() => onPress(vehicle._id)}
    >
      <View style={styles.horizontalImageContainer}>
        <Image source={{ uri: vehicle.image }} style={styles.horizontalImage} />
        <View style={styles.batteryIndicatorHorizontal}>
          <Ionicons name="battery-charging" size={10} color={COLORS.white} />
          <Text style={styles.batteryText}>{vehicle.batteryLevel}%</Text>
        </View>
      </View>

      <View style={styles.horizontalInfo}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.rating}>{vehicle.rating}</Text>
          </View>
        </View>

        <Text style={styles.vehicleModel}>
          {vehicle.year} • {vehicle.type}
        </Text>

        <View style={styles.vehicleDetails}>
          <View style={styles.detailItem}>
            <Ionicons
              name="location-outline"
              size={12}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detailText}>{vehicle.range} km range</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={12}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detailText}>
              {vehicle.pricePerHour.toLocaleString("vi-VN")} VND/h
            </Text>
          </View>
        </View>

        <Text style={styles.stationName}>{vehicle.station_name}</Text>

        <View
          style={[
            styles.availabilityBadge,
            {
              backgroundColor:
                vehicle.status === "AVAILABLE"
                  ? COLORS.success + "20"
                  : COLORS.error + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.availabilityText,
              {
                color:
                  vehicle.status === "AVAILABLE"
                    ? COLORS.success
                    : COLORS.error,
              },
            ]}
          >
            {vehicle.status === "AVAILABLE"
              ? "Có sẵn"
              : vehicle.status === "RESERVED"
              ? "Đã đặt"
              : vehicle.status === "RENTED"
              ? "Đang thuê"
              : "Bảo trì"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Horizontal Card Styles
  horizontalCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  horizontalImageContainer: {
    position: "relative",
    marginRight: SPACING.md,
  },
  horizontalImage: {
    width: 100,
    height: 100,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
  },
  batteryIndicatorHorizontal: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.success,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  horizontalInfo: {
    flex: 1,
  },

  // Vertical Card Styles
  verticalCard: {
    width: 220,
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.md,
    marginRight: SPACING.md,
    ...SHADOWS.md,
    marginBottom: SPACING.sm,
  },
  verticalImageContainer: {
    position: "relative",
    marginBottom: SPACING.sm,
    borderRadius: RADII.md,
  },
  verticalImage: {
    width: "100%",
    height: 140,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
  },
  batteryIndicatorVertical: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.success,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  verticalInfo: {
    flex: 1,
  },

  // Common Styles
  batteryText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  vehicleName: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: COLORS.warning + "15",
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADII.xs,
  },
  rating: {
    fontSize: FONTS.caption,
    fontWeight: "600",
    color: COLORS.text,
  },
  vehicleModel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  vehicleDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADII.xs,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  stationName: {
    fontSize: FONTS.caption,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },
  availabilityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: "700",
  },
});

export default VehicleCard;
