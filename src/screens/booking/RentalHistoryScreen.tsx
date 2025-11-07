import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, RADII } from '../../utils/theme';
import BookingCard from '../../components/booking/BookingCard';
import EmptyState from '../../components/booking/EmptyState';
import { Booking } from '../../types/booking';
import { bookingService } from '../../services/bookingService';

const RentalHistoryScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /** Lấy danh sách booking lịch sử (CANCELLED, EXPIRED) */
  const fetchHistoryBookings = useCallback(async () => {
    try {
      setLoading(true);

      console.log('[RentalHistoryScreen] Fetching history bookings');

      // Lấy bookings với status CANCELLED và EXPIRED
      const params = {
        status: 'CANCELLED,EXPIRED,CONFIRMED',
        limit: 50,
      };

      console.log('[RentalHistoryScreen] Calling bookingService.getUserBookings with params:', params);
      const result = await bookingService.getUserBookings(params);

      console.log(`[RentalHistoryScreen] Final result: ${result?.length || 0} history bookings`);
      if (result && result.length > 0) {
        console.log('[RentalHistoryScreen] First booking:', result[0]);
      }

      // Nếu backend trả về rỗng với filter, thử lấy tất cả và filter client-side
      if ((!result || result.length === 0) && params.status) {
        console.warn('[RentalHistoryScreen] No bookings returned for filtered request. Falling back to fetch all and filter client-side.');
        const all = await bookingService.getUserBookings();
        const statusList = (params.status as string).split(',').map(s => s.trim().toUpperCase());
        const filtered = (all || []).filter(b => statusList.includes((b.status || '').toString().toUpperCase()));
        console.log(`[RentalHistoryScreen] Fallback filtered result: ${filtered.length}`);
        setBookings(filtered);
      } else {
        setBookings(result || []);
      }
    } catch (error: any) {
      console.error("❌ Error fetching history bookings:", error);
      console.error("❌ Error response:", error.response?.data);
      
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải danh sách lịch sử thuê xe"
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload khi screen được focus
  useFocusEffect(
    useCallback(() => {
      fetchHistoryBookings();
    }, [fetchHistoryBookings])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistoryBookings();
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    console.log('[RentalHistoryScreen] Booking pressed:', {
      id: booking._id,
      status: booking.status,
    });

    console.log('[RentalHistoryScreen] Navigating to HistoryBookingDetail with bookingId:', booking._id);

    try {
      (navigation as any).navigate('HistoryBookingDetail', { bookingId: booking._id });
    } catch (error) {
      console.error('[RentalHistoryScreen] Navigation error:', error);
      Alert.alert('Lỗi', 'Không thể mở chi tiết booking');
    }
  };

  return (
    
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        
        {/* Header */}
        <LinearGradient
      colors={COLORS.gradient_4}
      style={styles.container}
    >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử thuê xe</Text>
          <View style={styles.placeholder} />
        </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="car-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Tổng chuyến</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
          <Text style={styles.statValue}>
            {bookings.filter(b => b.status === 'CONFIRMED').length}
          </Text>
          <Text style={styles.statLabel}>Đã xác nhận</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="close-circle-outline" size={24} color={COLORS.error} />
          <Text style={styles.statValue}>
            {bookings.filter(b => b.status === 'CANCELLED').length}
          </Text>
          <Text style={styles.statLabel}>Đã hủy</Text>
        </View>
      </View>

      {/* Bookings List */}
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
          <EmptyState type="history" />
        )}
      </View>
      </LinearGradient>
      </SafeAreaView>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADII.card,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.md,
  },
});

export default RentalHistoryScreen;
