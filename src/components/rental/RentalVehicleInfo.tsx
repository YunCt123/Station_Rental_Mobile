import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS, SPACING, FONTS, SHADOWS } from "../../utils/theme";

interface RentalVehicleInfoProps {
  vehicleName: string;
  vehicleModel?: string;
  vehicleImage?: string;
}

const RentalVehicleInfo: React.FC<RentalVehicleInfoProps> = ({
  vehicleName,
  vehicleModel,
  vehicleImage,
}) => {
  return (
    <View style={styles.card}>
      {vehicleImage && (
        <Image source={{ uri: vehicleImage }} style={styles.vehicleImage} />
      )}
      <Text style={styles.vehicleName}>{vehicleName}</Text>
      {vehicleModel && (
        <Text style={styles.vehicleModel}>{vehicleModel}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 16,
    ...SHADOWS.md,
  },
  vehicleImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  vehicleName: {
    fontSize: FONTS.title,
    color: COLORS.text,
    fontWeight: "700",
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default RentalVehicleInfo;
