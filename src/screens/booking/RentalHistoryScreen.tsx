import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, RADII } from '../../utils/theme';
import BookingCard from '../../components/booking/BookingCard';
import EmptyState from '../../components/booking/EmptyState';

interface Booking {
  id: string;
  vehicleName: string;
  vehicleModel: string;
  vehicleImage: string;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  startDate: string;
  endDate: string;
  totalHours: number;
  totalPrice: number;
  location: string;
}

const RentalHistoryScreen = () => {
  const navigation = useNavigation();

  const mockBookings: Booking[] = [
    {
      id: '1',
      vehicleName: 'BMW iX3',
      vehicleModel: '2023 Impressive',
      vehicleImage: 'https://images.unsplash.com/photo-1617654112274-64cb6d55efbe?w=400',
      status: 'completed',
      startDate: '20/10/2025 10:00',
      endDate: '20/10/2025 16:00',
      totalHours: 6,
      totalPrice: 600000,
      location: 'Trạm Bitexco',
    },
    {
      id: '2',
      vehicleName: 'Audi e-tron',
      vehicleModel: '2024 Sportback',
      vehicleImage: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400',
      status: 'completed',
      startDate: '18/10/2025 13:00',
      endDate: '18/10/2025 18:00',
      totalHours: 5,
      totalPrice: 550000,
      location: 'Trạm Vincom Center',
    },
    {
      id: '3',
      vehicleName: 'Tesla Model 3',
      vehicleModel: '2024 Standard Range',
      vehicleImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
      status: 'completed',
      startDate: '15/10/2025 09:00',
      endDate: '15/10/2025 15:00',
      totalHours: 6,
      totalPrice: 720000,
      location: 'Trạm FPT University',
    },
    {
      id: '4',
      vehicleName: 'VinFast VF8',
      vehicleModel: '2024 Eco',
      vehicleImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      status: 'cancelled',
      startDate: '12/10/2025 14:00',
      endDate: '12/10/2025 18:00',
      totalHours: 4,
      totalPrice: 360000,
      location: 'Trạm Landmark 81',
    },
  ];

  const handleBookingPress = (booking: Booking) => {
    (navigation as any).navigate('HistoryBookingDetail', { bookingId: booking.id });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử thuê xe</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="car-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{mockBookings.length}</Text>
          <Text style={styles.statLabel}>Tổng chuyến</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
          <Text style={styles.statValue}>
            {mockBookings.filter(b => b.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="close-circle-outline" size={24} color={COLORS.error} />
          <Text style={styles.statValue}>
            {mockBookings.filter(b => b.status === 'cancelled').length}
          </Text>
          <Text style={styles.statLabel}>Đã hủy</Text>
        </View>
      </View>

      {/* Bookings List */}
      <View style={styles.content}>
        {mockBookings.length > 0 ? (
          <FlatList
            data={mockBookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookingCard booking={item} onPress={handleBookingPress} />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState type="history" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
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
