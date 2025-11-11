import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORS, SPACING, FONTS, RADII } from "../../utils/theme";
import { Vehicle } from "../../types/vehicle";

interface VehicleInfoCardProps {
  vehicle: Vehicle;
  hourlyRate: number;
}

export const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({
  vehicle,
  hourlyRate,
}) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: vehicle.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{vehicle.name}</Text>
        <Text style={styles.model}>
          {vehicle.brand} • {vehicle.year}
        </Text>
        <View style={styles.rateContainer}>
          <Text style={styles.rateText}>
            {hourlyRate.toLocaleString("vi-VN")} VND
          </Text>
          <Text style={styles.rateUnit}>/giờ</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  image: {
    width: 120,
    height: 80,
    borderRadius: RADII.md,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  model: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  rateContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  rateText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.primary,
  },
  rateUnit: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
});
