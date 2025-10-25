import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADII } from '../../utils/theme';

interface BookingFilterTab {
  id: string;
  label: string;
}

interface BookingFilterTabsProps {
  tabs: BookingFilterTab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

const BookingFilterTabs: React.FC<BookingFilterTabsProps> = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.tabActive
          ]}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.tabTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADII.button,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default BookingFilterTabs;
