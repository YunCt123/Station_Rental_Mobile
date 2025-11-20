import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, FONTS, SHADOWS } from "../../utils/theme";
import BookingCard from "../../components/booking/BookingCard";
import EmptyState from "../../components/booking/EmptyState";
import BookingFilterTabs from "../../components/booking/BookingFilterTabs";
import StatusModal from "../../components/common/StatusModal";
import { Booking } from "../../types/booking";
import { bookingService } from "../../services/bookingService";

const BookingsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /** Lấy danh sách booking */
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all bookings from backend
      const allBookings = await bookingService.getUserBookings({ limit: 100 });

      console.log("📦 All bookings fetched:", allBookings?.length);

      // Filter client-side based on tab
      let filtered: Booking[] = [];

      if (activeTab === "active") {
        // Show bookings that are:
        // 1. HELD or CONFIRMED (waiting for pickup)
        // 2. Have rental with status ONGOING or RETURN_PENDING
        filtered = (allBookings || []).filter((b) => {
          const bookingStatus = b.status?.toUpperCase();

          // If booking is cancelled or expired, exclude
          if (bookingStatus === "CANCELLED" || bookingStatus === "EXPIRED") {
            return false;
          }

          // Check rental status if exists
          if (b.rental_id) {
            const rental = typeof b.rental_id === "object" ? b.rental_id : null;
            const rentalStatus = (rental as any)?.status?.toUpperCase();

            // Show if rental is active (ONGOING, RETURN_PENDING)
            return (
              rentalStatus === "ONGOING" || rentalStatus === "RETURN_PENDING"
            );
          }

          // Show HELD/CONFIRMED bookings without rental yet
          return bookingStatus === "HELD" || bookingStatus === "CONFIRMED";
        });

        console.log("✅ Active bookings filtered:", filtered.length);
      } else {
        // Show bookings that are:
        // 1. CANCELLED or EXPIRED
        // 2. Have rental with status COMPLETED
        filtered = (allBookings || []).filter((b) => {
          const bookingStatus = b.status?.toUpperCase();

          console.log(`📋 Checking booking ${b._id}:`, {
            bookingStatus,
            hasRental: !!b.rental_id,
            rentalType: typeof b.rental_id,
            rentalStatus:
              b.rental_id && typeof b.rental_id === "object"
                ? (b.rental_id as any)?.status
                : "N/A",
          });

          // If booking is cancelled or expired
          if (bookingStatus === "CANCELLED" || bookingStatus === "EXPIRED") {
            console.log(`  ✅ Included: Booking is ${bookingStatus}`);
            return true;
          }

          // Check rental status if exists
          if (b.rental_id) {
            // If rental_id is a string, we need to fetch rental separately
            if (typeof b.rental_id === "string") {
              console.log(
                `  ⚠️ rental_id is string (not populated): ${b.rental_id}`
              );
              // Cannot determine rental status, assume it might be completed
              // This is a limitation - backend should populate rental_id
              return true; // Include it anyway for history
            }

            const rental = b.rental_id as any;
            const rentalStatus = rental?.status?.toUpperCase();

            // Show if rental is completed
            const isHistoryRental =
              rentalStatus === "COMPLETED" ||
              rentalStatus === "REJECTED" ||
              rentalStatus === "DISPUTED";

            console.log(
              `  ${
                isHistoryRental ? "✅" : "❌"
              } Rental status: ${rentalStatus}`
            );
            return isHistoryRental;
          }

          console.log(`  ❌ Excluded: No rental and not cancelled/expired`);
          return false;
        });

        console.log("📜 History bookings filtered:", filtered.length);
      }

      setBookings(filtered);
    } catch (error: any) {
      console.error("❌ Error fetching bookings:", error);
      setErrorMessage(
        error.response?.data?.message || "Không thể tải danh sách đặt chỗ"
      );
      setErrorModalVisible(true);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Reload khi screen được focus
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  // Reload khi đổi tab
  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    // Determine which screen to navigate based on booking and rental status
    let screenName = "ActiveBookingDetail";

    // Check if booking is cancelled/expired or rental is completed
    const bookingStatus = booking.status?.toUpperCase();
    const isCancelled =
      bookingStatus === "CANCELLED" || bookingStatus === "EXPIRED";

    let isCompleted = false;
    if (booking.rental_id) {
      const rental =
        typeof booking.rental_id === "object" ? booking.rental_id : null;
      const rentalStatus = (rental as any)?.status?.toUpperCase();
      isCompleted =
        rentalStatus === "COMPLETED" ||
        rentalStatus === "REJECTED" ||
        rentalStatus === "DISPUTED";
    }

    // Use history detail screen for cancelled bookings or completed rentals
    if (isCancelled || isCompleted) {
      screenName = "HistoryBookingDetail";
    }

    try {
      (navigation as any).navigate(screenName, { bookingId: booking._id });
    } catch (error) {
      setErrorMessage("Không thể mở chi tiết booking");
      setErrorModalVisible(true);
    }
  };

  const tabs = [
    { id: "active", label: "Đang xử lý" },
    { id: "history", label: "Lịch sử" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đặt chỗ của tôi</Text>
        </View>

        {/* Tabs */}
        <BookingFilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={(tabId) => setActiveTab(tabId as "active" | "history")}
        />

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 40 }}
            />
          ) : bookings.length > 0 ? (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <BookingCard booking={item} onPress={handleBookingPress} />
              )}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.primary}
                />
              }
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState type={activeTab} />
          )}
        </View>
      </LinearGradient>

      {/* Error Modal */}
      <StatusModal
        visible={errorModalVisible}
        type="error"
        title="Lỗi"
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.xxl,
    ...SHADOWS.md,
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.screenPadding,
  },
});

export default BookingsScreen;
