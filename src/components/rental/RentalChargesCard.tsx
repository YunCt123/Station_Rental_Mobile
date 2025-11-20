import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, FONTS, SHADOWS } from "../../utils/theme";

interface RentalChargesCardProps {
  rentalFee?: number;
  lateFee?: number;
  damageFee?: number;
  cleaningFee?: number;
  otherFees?: number;
  extraFees?: number;
  total: number;
}

const RentalChargesCard: React.FC<RentalChargesCardProps> = ({
  rentalFee,
  lateFee,
  damageFee,
  cleaningFee,
  otherFees,
  extraFees,
  total,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Chi phí</Text>

      {rentalFee !== undefined && (
        <View style={styles.chargeRow}>
          <Text style={styles.chargeLabel}>Phí thuê xe</Text>
          <Text style={styles.chargeValue}>
            {rentalFee.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      )}

      {lateFee !== undefined && lateFee > 0 && (
        <View style={styles.chargeRow}>
          <Text style={[styles.chargeLabel, { color: COLORS.warning }]}>
            Phí trả trễ
          </Text>
          <Text style={[styles.chargeValue, { color: COLORS.warning }]}>
            {lateFee.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      )}

      {damageFee !== undefined && damageFee > 0 && (
        <View style={styles.chargeRow}>
          <Text style={[styles.chargeLabel, { color: COLORS.error }]}>
            Phí hư hỏng
          </Text>
          <Text style={[styles.chargeValue, { color: COLORS.error }]}>
            {damageFee.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      )}

      {cleaningFee !== undefined && cleaningFee > 0 && (
        <View style={styles.chargeRow}>
          <Text style={styles.chargeLabel}>Phí vệ sinh</Text>
          <Text style={styles.chargeValue}>
            {cleaningFee.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      )}

      {otherFees !== undefined && otherFees > 0 && (
        <View style={styles.chargeRow}>
          <Text style={styles.chargeLabel}>Phí khác</Text>
          <Text style={styles.chargeValue}>
            {otherFees.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      )}

      {extraFees !== undefined && extraFees > 0 && (
        <View style={styles.chargeRow}>
          <Text style={styles.chargeLabel}>Phí phát sinh</Text>
          <Text style={styles.chargeValue}>
            {extraFees.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng cộng</Text>
        <Text style={styles.totalValue}>
          {total.toLocaleString("vi-VN")} VND
        </Text>
      </View>
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
  chargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
  },
  chargeLabel: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  chargeValue: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.subtitle,
    color: COLORS.text,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: FONTS.subtitle,
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default RentalChargesCard;
