import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII } from "../../utils/theme";

interface RentalTypeSelectorProps {
  rentalType: "hourly" | "daily";
  onSelect: (type: "hourly" | "daily") => void;
}

const RentalTypeSelector: React.FC<RentalTypeSelectorProps> = ({
  rentalType,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          rentalType === "hourly" && styles.buttonActive,
        ]}
        onPress={() => onSelect("hourly")}
      >
        <Ionicons
          name="time-outline"
          size={20}
          color={rentalType === "hourly" ? COLORS.white : COLORS.primary}
        />
        <Text
          style={[
            styles.text,
            rentalType === "hourly" && styles.textActive,
          ]}
        >
          Thuê theo giờ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          rentalType === "daily" && styles.buttonActive,
        ]}
        onPress={() => onSelect("daily")}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={rentalType === "daily" ? COLORS.white : COLORS.primary}
        />
        <Text
          style={[
            styles.text,
            rentalType === "daily" && styles.textActive,
          ]}
        >
          Thuê theo ngày
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.primary,
  },
  textActive: {
    color: COLORS.white,
  },
});

export default RentalTypeSelector;
