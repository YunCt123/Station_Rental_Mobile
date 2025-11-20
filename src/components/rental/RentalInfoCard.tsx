import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, SHADOWS } from "../../utils/theme";

interface RentalInfoCardProps {
  rentalId?: string;
  stationName: string;
  stationAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
}

const RentalInfoCard: React.FC<RentalInfoCardProps> = ({
  rentalId,
  stationName,
  stationAddress,
  pickupDate,
  pickupTime,
  returnDate,
  returnTime,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Thông tin thuê xe</Text>

      {rentalId && (
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="barcode-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabelText}>Mã thuê xe</Text>
          </View>
          <Text style={styles.infoValue}>
            {rentalId.slice(-8).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoLabel}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoLabelText}>Trạm</Text>
        </View>
        <Text style={styles.infoValue}>{stationName}</Text>
      </View>
      {stationAddress && (
        <Text style={styles.addressText}>{stationAddress}</Text>
      )}

      {pickupDate && pickupTime && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons
                name="arrow-up-circle-outline"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.infoLabelText}>Nhận xe</Text>
            </View>
            <Text style={styles.infoValue}>
              {pickupDate} {pickupTime}
            </Text>
          </View>
        </>
      )}

      {returnDate && returnTime && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons
                name="arrow-down-circle-outline"
                size={20}
                color={COLORS.error}
              />
              <Text style={styles.infoLabelText}>Trả xe</Text>
            </View>
            <Text style={styles.infoValue}>
              {returnDate} {returnTime}
            </Text>
          </View>
        </>
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
  sectionTitle: {
    fontSize: FONTS.subtitle,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabelText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  infoValue: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  addressText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginLeft: 32,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
});

export default RentalInfoCard;
