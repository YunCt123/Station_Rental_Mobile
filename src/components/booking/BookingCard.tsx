import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { Booking } from "../../types/booking";
import { Vehicle } from "../../types/vehicle";
import { vehicleService } from "../../services/vehicleService";

interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  // Fetch vehicle data nếu vehicle_id là string
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // Kiểm tra nếu vehicle_id là string (chưa được populate)
        if (typeof booking.vehicle_id === "string") {
          setLoadingVehicle(true);
          const vehicleData = await vehicleService.getVehicleById(
            booking.vehicle_id
          );
          setVehicle(vehicleData);
        } else if (
          booking.vehicle_id &&
          typeof booking.vehicle_id === "object"
        ) {
          // Nếu đã được populate thì dùng luôn
          setVehicle(booking.vehicle_id as any as Vehicle);
        }
      } catch (error) {
        console.error("[BookingCard] Error fetching vehicle:", error);
      } finally {
        setLoadingVehicle(false);
      }
    };

    fetchVehicle();
  }, [booking.vehicle_id]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "HELD":
        return {
          color: COLORS.warning,
          bgColor: COLORS.warning + "15",
          icon: "time",
          text: "Đang giữ chỗ",
        };
      case "CONFIRMED":
        return {
          color: COLORS.success,
          bgColor: COLORS.success + "15",
          icon: "checkmark-circle",
          text: "Đã xác nhận",
        };
      case "CANCELLED":
        return {
          color: COLORS.error,
          bgColor: COLORS.error + "15",
          icon: "close-circle",
          text: "Đã hủy",
        };
      case "EXPIRED":
        return {
          color: COLORS.textSecondary,
          bgColor: COLORS.textSecondary + "15",
          icon: "ban",
          text: "Hết hạn",
        };
      default:
        return {
          color: COLORS.textSecondary,
          bgColor: COLORS.textSecondary + "15",
          icon: "information-circle",
          text: status,
        };
    }
  };

  const statusInfo = getStatusInfo(booking.status);

  // Lấy thông tin hiển thị
  const vehicleName =
    booking.vehicle_snapshot?.name || vehicle?.name || "Xe điện";
  const vehicleModel = booking.vehicle_snapshot
    ? `${booking.vehicle_snapshot.brand} ${booking.vehicle_snapshot.model}`.trim()
    : vehicle
    ? `${vehicle.brand} ${vehicle.model || ""}`.trim()
    : "";

  // Ưu tiên lấy ảnh từ vehicle, fallback về snapshot hoặc placeholder
  const vehicleImage =
    vehicle?.image ||
    (booking.vehicle_snapshot as any)?.image ||
    (booking.vehicle_snapshot as any)?.imageUrl ||
    "https://via.placeholder.com/400x200?text=No+Image";

  const startDate = new Date(
    booking.start_at || booking.startAt || ""
  ).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const endDate = new Date(
    booking.end_at || booking.endAt || ""
  ).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalHours =
    booking.pricing_snapshot?.details?.hours ||
    (booking.pricing_snapshot?.details?.days
      ? booking.pricing_snapshot.details.days * 24
      : 0) ||
    0;

  const totalPrice = booking.pricing_snapshot?.total_price || 0;
  const location = booking.station_snapshot?.name || "Không xác định";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(booking)}
      activeOpacity={0.8}
    >
      {/* Image Container with Status Badge */}
      <View style={styles.imageContainer}>
        {loadingVehicle ? (
          <View style={[styles.image, styles.loadingContainer]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          <Image source={{ uri: vehicleImage }} style={styles.image} />
        )}
        <View
          style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}
        >
          <Ionicons
            name={statusInfo.icon as any}
            size={14}
            color={statusInfo.color}
          />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.vehicleName}>{vehicleName}</Text>
            <Text style={styles.vehicleModel}>{vehicleModel}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>
              {totalPrice.toLocaleString("vi-VN")} VND
            </Text>
            <Text style={styles.priceLabel}>Tổng cộng</Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ngày thuê</Text>
              <Text style={styles.detailValue}>{startDate}</Text>
              <Text style={styles.detailValue}>{endDate}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Thời gian</Text>
              <Text style={styles.detailValue}>{totalHours} giờ</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Trạm</Text>
              <Text style={styles.detailValue}>{location}</Text>
            </View>
          </View>
        </View>

        {/* Footer with Action */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.footerText}>Xem chi tiết</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.md,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.button,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  vehicleName: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  detailsGrid: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  footerRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookingCard;
