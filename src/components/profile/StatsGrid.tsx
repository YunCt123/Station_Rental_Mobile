import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface UserStats {
  totalBookings: number;
  totalSpent: number;
}

interface StatsGridProps {
  stats: UserStats;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Ionicons name={icon as any} size={30} color={COLORS.primary} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M VND`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K VND`;
    }
    return `${amount.toLocaleString('vi-VN')} VND`;
  };

  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Thống kê của bạn</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Tổng booking"
          value={stats.totalBookings.toString()}
          icon="document-text-outline"
        />
        <StatCard
          title="Tổng đã tiêu"
          value={formatCurrency(stats.totalSpent)}
          icon="wallet-outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsSection: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.sm, // Reduced gap for tighter layout
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%', // Fixed width for 2 columns
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.md, // Reduced padding for smaller cards
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statIconContainer: {
    width: 36, 
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm, // Reduced margin
  },
  statValue: {
    fontSize: FONTS.bodyLarge, // Smaller font size
    fontWeight: '600', // Reduced font weight
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  statTitle: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default StatsGrid;