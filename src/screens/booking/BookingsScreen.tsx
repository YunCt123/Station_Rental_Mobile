import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface Booking {
  id: string;
  vehicleName: string;
  vehicleModel: string;
  vehicleImage: string;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  startTime: string;
  endTime?: string;
  duration: string;
  totalCost: number;
  stationName: string;
  bookingDate: string;
  vehicleType: string;
}

const BookingsScreen = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  const mockBookings: Booking[] = [
    {
      id: '1',
      vehicleName: 'Tesla Model 3',
      vehicleModel: '2024 Standard Range',
      vehicleImage: 'https://via.placeholder.com/150',
      status: 'active',
      startTime: '14:30',
      duration: '2h 15m',
      totalCost: 240000,
      stationName: 'Trạm FPT University',
      bookingDate: 'Hôm nay',
      vehicleType: 'Xe hơi điện',
    },
    {
      id: '2',
      vehicleName: 'VinFast VF8',
      vehicleModel: '2024 Eco',
      vehicleImage: 'https://via.placeholder.com/150',
      status: 'upcoming',
      startTime: '09:00',
      duration: '4h',
      totalCost: 400000,
      stationName: 'Trạm Keangnam',
      bookingDate: 'Ngày mai',
      vehicleType: 'Xe hơi điện',
    },
    {
      id: '3',
      vehicleName: 'Honda PCX Electric',
      vehicleModel: '2024',
      vehicleImage: 'https://via.placeholder.com/150',
      status: 'completed',
      startTime: '08:00',
      endTime: '10:30',
      duration: '2h 30m',
      totalCost: 112500,
      stationName: 'Trạm Cầu Giấy',
      bookingDate: 'Hôm qua',
      vehicleType: 'Xe máy điện',
    },
    {
      id: '4',
      vehicleName: 'BMW iX3',
      vehicleModel: '2024',
      vehicleImage: 'https://via.placeholder.com/150',
      status: 'completed',
      startTime: '15:00',
      endTime: '18:00',
      duration: '3h',
      totalCost: 450000,
      stationName: 'Trạm Lotte Center',
      bookingDate: '3 ngày trước',
      vehicleType: 'Xe hơi điện',
    },
  ];

  const activeBookings = mockBookings.filter(booking => 
    booking.status === 'active' || booking.status === 'upcoming'
  );
  
  const historyBookings = mockBookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'upcoming':
        return COLORS.primary;
      case 'completed':
        return COLORS.textSecondary;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang thuê';
      case 'upcoming':
        return 'Sắp tới';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity style={styles.bookingCard}>
      <Image source={{ uri: item.vehicleImage }} style={styles.vehicleImage} />
      <View style={styles.bookingInfo}>
        <View style={styles.bookingHeader}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{item.vehicleName}</Text>
            <Text style={styles.vehicleModel}>{item.vehicleModel}</Text>
            <Text style={styles.vehicleType}>{item.vehicleType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.stationName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.bookingDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {item.startTime} {item.endTime && `- ${item.endTime}`} • {item.duration}
            </Text>
          </View>
        </View>
        
        <View style={styles.bookingFooter}>
          <Text style={styles.totalCost}>
            {item.totalCost.toLocaleString()}đ
          </Text>
          <View style={styles.actionButtons}>
            {item.status === 'active' && (
              <TouchableOpacity style={styles.endTripButton}>
                <Text style={styles.endTripButtonText}>Kết thúc</Text>
              </TouchableOpacity>
            )}
            {item.status === 'upcoming' && (
              <>
                <TouchableOpacity style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.startTripButton}>
                  <Text style={styles.startTripButtonText}>Bắt đầu</Text>
                </TouchableOpacity>
              </>
            )}
            {(item.status === 'completed' || item.status === 'cancelled') && (
              <TouchableOpacity style={styles.rebookButton}>
                <Text style={styles.rebookButtonText}>Thuê lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = ({ type }: { type: 'active' | 'history' }) => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={type === 'active' ? 'car-outline' : 'receipt-outline'} 
        size={64} 
        color={COLORS.textSecondary} 
      />
      <Text style={styles.emptyTitle}>
        {type === 'active' ? 'Không có đặt chỗ nào' : 'Chưa có lịch sử'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {type === 'active' 
          ? 'Hãy tìm và thuê xe điện để bắt đầu hành trình của bạn!'
          : 'Lịch sử các chuyến đi của bạn sẽ hiển thị ở đây.'
        }
      </Text>
      <TouchableOpacity style={styles.exploreButton}>
        <Text style={styles.exploreButtonText}>Khám phá xe điện</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đặt chỗ của tôi</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Hiện tại ({activeBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Lịch sử ({historyBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' ? (
          activeBookings.length > 0 ? (
            <FlatList
              data={activeBookings}
              renderItem={renderBookingCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <EmptyState type="active" />
          )
        ) : (
          historyBookings.length > 0 ? (
            <FlatList
              data={historyBookings}
              renderItem={renderBookingCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <EmptyState type="history" />
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.header,
    fontWeight: '700',
    color: COLORS.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screenPadding,
    borderRadius: RADII.button,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADII.button,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: SPACING.screenPadding,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  vehicleImage: {
    width: 80,
    height: 80,
    borderRadius: RADII.md,
    backgroundColor: COLORS.border,
    marginRight: SPACING.lg,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
  },
  vehicleModel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  vehicleType: {
    fontSize: FONTS.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.pill,
  },
  statusText: {
    fontSize: FONTS.caption,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalCost: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  endTripButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.button,
  },
  endTripButtonText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.button,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelButtonText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.error,
  },
  startTripButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.button,
  },
  startTripButtonText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  rebookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.button,
  },
  rebookButtonText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.screenPadding,
  },
  emptyTitle: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
  },
  exploreButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default BookingsScreen;