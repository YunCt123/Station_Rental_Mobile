import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, SHADOWS } from "../../utils/theme";
import { Rental } from "../../types/rental";

interface RentalCardProps {
  rental: Rental;
  onPress: (rental: Rental) => void;
}

const RentalCard: React.FC<RentalCardProps> = ({ rental, onPress }) => {
  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      CONFIRMED: "Đang chờ nhận",
      ONGOING: "Đang thuê",
      RETURN_PENDING: "Chờ trả xe",
      COMPLETED: "Hoàn thành",
      DISPUTED: "Tranh chấp",
      REJECTED: "Đã từ chối",
    };
    return statusMap[status?.toUpperCase()] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      CONFIRMED: COLORS.warning,
      ONGOING: COLORS.success,
      RETURN_PENDING: COLORS.warning,
      COMPLETED: COLORS.primary,
      DISPUTED: COLORS.error,
      REJECTED: COLORS.error,
    };
    return colorMap[status?.toUpperCase()] || COLORS.textSecondary;
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const vehicle = typeof rental.vehicle_id === "object" ? rental.vehicle_id : null;
  const vehicleName = (vehicle as any)?.name || "Xe điện";
  const vehicleModel = (vehicle as any)?.model || "";
  const station = typeof rental.station_id === "object" ? rental.station_id : null;
  const stationName = (station as any)?.name || "Trạm";

  return (
    <TouchableOpacity
      style={styles.rentalCard}
      onPress={() => onPress(rental)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[COLORS.white, COLORS.background]}
        style={styles.cardGradient}
      >
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(rental.status)}15` },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(rental.status) },
            ]}
          >
            {getStatusLabel(rental.status)}
          </Text>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{vehicleName}</Text>
          {vehicleModel && (
            <Text style={styles.vehicleModel}>{vehicleModel}</Text>
          )}
        </View>

        {/* Station & Dates */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="location-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detailText}>{stationName}</Text>
          </View>
        </View>

        {/* Pickup & Return Dates */}
        <View style={styles.datesRow}>
          {rental.pickup?.at && (
            <View style={styles.dateItem}>
              <Ionicons
                name="arrow-up-circle-outline"
                size={16}
                color={COLORS.success}
              />
              <Text style={styles.dateLabel}>Nhận: </Text>
              <Text style={styles.dateValue}>
                {formatDate(rental.pickup.at)}
              </Text>
            </View>
          )}
          {rental.return?.at && (
            <View style={styles.dateItem}>
              <Ionicons
                name="arrow-down-circle-outline"
                size={16}
                color={COLORS.error}
              />
              <Text style={styles.dateLabel}>Trả: </Text>
              <Text style={styles.dateValue}>
                {formatDate(rental.return.at)}
              </Text>
            </View>
          )}
        </View>

        {/* Charges Info */}
        {rental.charges && (
          <View style={styles.chargesRow}>
            <Text style={styles.chargesLabel}>
              {rental.status?.toUpperCase() === "COMPLETED" ? "Đã thanh toán:" : "Tổng chi phí:"}
            </Text>
            <Text style={styles.chargesValue}>
              {Math.max(0, 
                (rental.pricing_snapshot?.base_price || 0) + 
                (rental.charges.cleaning_fee || 0) + 
                (rental.charges.late_fee || 0) + 
                (rental.charges.damage_fee || 0) + 
                (rental.charges.other_fees || 0) + 
                (rental.pricing_snapshot?.taxes || 0) 
              ).toLocaleString("vi-VN")} VND
            </Text>
          </View>
        )}

        {/* Arrow Icon */}
        <View style={styles.arrowIcon}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.textSecondary}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rentalCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  cardGradient: {
    padding: SPACING.md,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: FONTS.caption,
    fontWeight: "600",
  },
  vehicleInfo: {
    marginBottom: SPACING.sm,
  },
  vehicleName: {
    fontSize: FONTS.title,
    color: COLORS.text,
    fontWeight: "700",
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailsRow: {
    marginBottom: SPACING.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  dateValue: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    fontWeight: "600",
  },
  chargesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chargesLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  chargesValue: {
    fontSize: FONTS.subtitle,
    color: COLORS.primary,
    fontWeight: "700",
  },
  arrowIcon: {
    position: "absolute",
    right: SPACING.md,
    top: "50%",
    marginTop: -10,
  },
});

export default RentalCard;
