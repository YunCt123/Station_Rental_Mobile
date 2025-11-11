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
      setLoading(true);// Use status filter on the main /bookings endpoint. Backend doesn't provide /bookings/active or /bookings/history.
      const params = {
        status: activeTab === "active" ? "HELD,CONFIRMED" : "CANCELLED,EXPIRED,CONFIRMED,HELD",
        limit: 50,
      };const result = await bookingService.getUserBookings(params);if (result && result.length > 0) {}

      // If backend returned empty for filtered request, try fetching all bookings and filter client-side
      if ((!result || result.length === 0) && params.status) {const all = await bookingService.getUserBookings();
        const statusList = (params.status as string)
          .split(",")
          .map((s) => s.trim().toUpperCase());
        const filtered = (all || []).filter((b) =>
          statusList.includes((b.status || "").toString().toUpperCase())
        );setBookings(filtered);
      } else {
        setBookings(result || []);
      }
    } catch (error: any) {setErrorMessage(
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

  const handleBookingPress = (booking: Booking) => {const screenName =
      booking.status === "CONFIRMED" || booking.status === "HELD"
        ? "ActiveBookingDetail"
        : "HistoryBookingDetail";try {
      (navigation as any).navigate(screenName, { bookingId: booking._id });
    } catch (error) {setErrorMessage("Không thể mở chi tiết booking");
      setErrorModalVisible(true);
    }
  };

  const tabs = [
    { id: "active", label: "Đang hoạt động" },
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
