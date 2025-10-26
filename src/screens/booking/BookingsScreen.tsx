import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import BookingCard from '../../components/booking/BookingCard';
import EmptyState from '../../components/booking/EmptyState';
import BookingFilterTabs from '../../components/booking/BookingFilterTabs';

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

const BookingsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  const mockBookings: Booking[] = [
    {
      id: '1',
      vehicleName: 'Tesla Model 3',
      vehicleModel: '2024 Standard Range',
      vehicleImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
      status: 'active',
      startDate: '23/10/2025 14:30',
      endDate: '23/10/2025 18:00',
      totalHours: 4,
      totalPrice: 480000,
      location: 'Trạm FPT University',
    },
    {
      id: '2',
      vehicleName: 'VinFast VF8',
      vehicleModel: '2024 Eco',
      vehicleImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      status: 'upcoming',
      startDate: '25/10/2025 09:00',
      endDate: '25/10/2025 17:00',
      totalHours: 8,
      totalPrice: 720000,
      location: 'Trạm Landmark 81',
    },
    {
      id: '3',
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
      id: '4',
      vehicleName: 'Audi e-tron',
      vehicleModel: '2024 Sportback',
      vehicleImage: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400',
      status: 'cancelled',
      startDate: '18/10/2025 13:00',
      endDate: '18/10/2025 18:00',
      totalHours: 5,
      totalPrice: 550000,
      location: 'Trạm Vincom Center',
    },
  ];

  const tabs = [
    { id: 'active', label: 'Đang hoạt động' },
    { id: 'history', label: 'Lịch sử' },
  ];

  const activeBookings = mockBookings.filter(b => 
    b.status === 'active' || b.status === 'upcoming'
  );
  
  const historyBookings = mockBookings.filter(b => 
    b.status === 'completed' || b.status === 'cancelled'
  );

  const handleBookingPress = (booking: Booking) => {
    // Navigate to appropriate detail screen based on booking status
    if (booking.status === 'active' || booking.status === 'upcoming') {
      (navigation as any).navigate('ActiveBookingDetail', { bookingId: booking.id });
    } else {
      (navigation as any).navigate('HistoryBookingDetail', { bookingId: booking.id });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          onTabPress={(tabId) => setActiveTab(tabId as 'active' | 'history')}
        />

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'active' && (
            activeBookings.length > 0 ? (
              <FlatList
                data={activeBookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <BookingCard booking={item} onPress={handleBookingPress} />
                )}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <EmptyState type="active" />
            )
          )}

          {activeTab === 'history' && (
            historyBookings.length > 0 ? (
              <FlatList
                data={historyBookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <BookingCard booking={item} onPress={handleBookingPress} />
                )}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <EmptyState type="history" />
            )
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
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.screenPadding,
  },
});

export default BookingsScreen;
