import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import { Station } from '../../types/station';

const { width } = Dimensions.get('window');

interface NearbyStationsProps {
  stations: Station[];
  loading: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  selectedStationId: string | null;
  onStationPress: (station: Station) => void;
  onViewDetails: (station: Station) => void;
  onRefresh: () => void;
}

const NearbyStations: React.FC<NearbyStationsProps> = ({
  stations,
  loading,
  userLocation,
  selectedStationId,
  onStationPress,
  onViewDetails,
  onRefresh,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return COLORS.success;
      case 'UNDER_MAINTENANCE': return COLORS.warning;
      case 'INACTIVE': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'UNDER_MAINTENANCE': return 'Bảo trì';
      case 'INACTIVE': return 'Tạm ngưng';
      default: return 'Không xác định';
    }
  };

  const renderStationCard = (station: Station) => (
    <View
      key={station._id}
      style={[
        styles.stationCard,
        selectedStationId === station._id && styles.selectedStationCard
      ]}
    >
      <TouchableOpacity
        onPress={() => onStationPress(station)}
        activeOpacity={0.7}
      >
        <View style={styles.stationHeader}>
          <View style={styles.stationInfo}>
            <Text style={styles.stationName} numberOfLines={2}>
              {station.name}
            </Text>
            <Text style={styles.stationAddress} numberOfLines={2}>
              {station.address}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(station.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(station.status) }
            ]}>
              {getStatusText(station.status)}
            </Text>
          </View>
        </View>

        <View style={styles.stationDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {station.city}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="car-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {station.metrics.vehicles_total} xe
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* View Details Button */}
      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => onViewDetails(station)}
        activeOpacity={0.8}
      >
        <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {userLocation ? 'Trạm gần bạn' : 'Tất cả trạm'}
        </Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.seeAllText}>Làm mới</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : stations.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stationsList}
          scrollEnabled={true}
          nestedScrollEnabled={false}
        >
          {stations.map(renderStationCard)}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Không tìm thấy trạm nào</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  stationsList: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  stationCard: {
    width: width * 0.75,
    minHeight: 180,
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    ...SHADOWS.md,
  },
  selectedStationCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    minHeight: 60, // Fixed height for header
  },
  stationInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  stationName: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  stationAddress: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.button,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: FONTS.caption,
    fontWeight: '600',
  },
  stationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  detailText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.button,
    marginTop: 'auto', // Push to bottom
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  viewDetailsText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.screenPadding,
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADII.button,
  },
  retryButtonText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default NearbyStations;
