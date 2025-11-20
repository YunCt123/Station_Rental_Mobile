import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, SPACING, FONTS, RADII } from "../../utils/theme";

interface PricingSummaryProps {
  rentalType: "hourly" | "daily";
  rentalHours: string;
  startDate: Date;
  endDate: Date;
  basePrice: number;
  taxes: number;
  insurancePrice: number;
  totalPrice: number;
  deposit: number;
  hourlyRate?: number;
  dailyRate?: number;
  loading?: boolean;
}

const PricingSummary: React.FC<PricingSummaryProps> = ({
  rentalType,
  rentalHours,
  startDate,
  endDate,
  basePrice,
  taxes,
  insurancePrice,
  totalPrice,
  deposit,
  hourlyRate,
  dailyRate,
  loading = false,
}) => {
  const getDuration = () => {
    if (rentalType === "hourly") {
      return `${rentalHours} giờ`;
    }
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} ngày`;
  };

  const getRate = () => {
    if (rentalType === "hourly") {
      return hourlyRate || 0;
    }
    return dailyRate || 0;
  };

  const remainingAmount = totalPrice - deposit;
  const depositPercent = totalPrice > 0 ? Math.round((deposit / totalPrice) * 100) : 0;
  const remainingPercent = 100 - depositPercent;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tổng kết</Text>

      {/* Chi tiết giá thuê */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Chi tiết giá thuê</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Đơn giá</Text>
          <Text style={styles.value}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              `${getRate().toLocaleString("vi-VN")} VND/${
                rentalType === "hourly" ? "giờ" : "ngày"
              }`
            )}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Thời gian thuê</Text>
          <Text style={styles.value}>{getDuration()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Giá cơ bản</Text>
          <Text style={styles.value}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              `${basePrice.toLocaleString("vi-VN")} VND`
            )}
          </Text>
        </View>

        {taxes > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Thuế & phí</Text>
            <Text style={styles.value}>
              {taxes.toLocaleString("vi-VN")} VND
            </Text>
          </View>
        )}

        {insurancePrice > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Bảo hiểm</Text>
            <Text style={styles.value}>
              {insurancePrice.toLocaleString("vi-VN")} VND
            </Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={[styles.label, styles.totalLabel]}>Tổng cộng</Text>
          <Text style={[styles.value, styles.totalValue]}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              `${totalPrice.toLocaleString("vi-VN")} VND`
            )}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Chi tiết thanh toán */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Chi tiết thanh toán</Text>

        <View style={styles.row}>
          <View style={styles.labelWithNote}>
            <Text style={[styles.label, styles.depositLabel]}>
              💰 Tiền cọc ({depositPercent}%)
            </Text>
            <Text style={styles.note}>Thanh toán trước khi bắt đầu thuê</Text>
          </View>
          <Text style={[styles.value, styles.depositValue]}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              `${deposit.toLocaleString("vi-VN")} VND`
            )}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.labelWithNote}>
            <Text style={styles.label}>🔄 Thanh toán sau ({remainingPercent}%)</Text>
            <Text style={styles.note}>Thanh toán khi trả xe</Text>
          </View>
          <Text style={styles.value}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              `${remainingAmount.toLocaleString("vi-VN")} VND`
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.md,
    marginBottom: -SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  section: {
    marginBottom: SPACING.sm,
  },
  subsectionTitle: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "right",
  },
  totalLabel: {
    fontWeight: "700",
    fontSize: FONTS.bodyLarge,
    color: COLORS.text,
  },
  totalValue: {
    fontWeight: "700",
    fontSize: FONTS.bodyLarge,
    color: COLORS.primary,
  },
  depositLabel: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  depositValue: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  labelWithNote: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  note: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
});

export default PricingSummary;