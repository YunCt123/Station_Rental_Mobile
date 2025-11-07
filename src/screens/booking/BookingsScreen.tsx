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
import { Booking } from "../../types/booking";
import { bookingService } from "../../services/bookingService";

const BookingsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /** Lấy danh sách booking */
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      console.log('[BookingsScreen] Active tab:', activeTab);

      // Use status filter on the main /bookings endpoint. Backend doesn't provide /bookings/active or /bookings/history.
      const params = {
        status:
          activeTab === 'active' ? 'HELD,CONFIRMED' : 'CANCELLED,EXPIRED',
        limit: 50,
      };

      console.log('[BookingsScreen] Calling bookingService.getUserBookings with params:', params);
      const result = await bookingService.getUserBookings(params);

      console.log(`[BookingsScreen] Final result: ${result?.length || 0} ${activeTab} bookings`);
      if (result && result.length > 0) {
        console.log('[BookingsScreen] First booking:', result[0]);
      }

      // If backend returned empty for filtered request, try fetching all bookings and filter client-side
      if ((!result || result.length === 0) && params.status) {
        console.warn('[BookingsScreen] No bookings returned for filtered request. Falling back to fetch all and filter client-side.');
        const all = await bookingService.getUserBookings();
        const statusList = (params.status as string).split(',').map(s => s.trim().toUpperCase());
        const filtered = (all || []).filter(b => statusList.includes((b.status || '').toString().toUpperCase()));
        console.log(`[BookingsScreen] Fallback filtered result: ${filtered.length}`);
        setBookings(filtered);
      } else {
        setBookings(result || []);
      }
    } catch (error: any) {
      console.error("❌ Error fetching bookings:", error);
      console.error("❌ Error response:", error.response?.data);
      
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải danh sách đặt chỗ"
      );
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
    console.log('[BookingsScreen] Booking pressed:', {
      id: booking._id,
      status: booking.status,
    });

    const screenName =
      booking.status === "CONFIRMED" || booking.status === "HELD"
        ? "ActiveBookingDetail"
        : "HistoryBookingDetail";

    console.log('[BookingsScreen] Navigating to:', screenName, 'with bookingId:', booking._id);

    try {
      (navigation as any).navigate(screenName, { bookingId: booking._id });
    } catch (error) {
      console.error('[BookingsScreen] Navigation error:', error);
      Alert.alert('Lỗi', 'Không thể mở chi tiết booking');
    }
  };

  const tabs = [
    { id: "active", label: "Đang hoạt động" },
    { id: "history", label: "Lịch sử" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient colors={COLORS.gradient_4} style={styles.gradientBackground}>
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
                <BookingCard
                  booking={item}
                  onPress={handleBookingPress}
                />
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
