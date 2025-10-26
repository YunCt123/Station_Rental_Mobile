import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS, RADII, SHADOWS, GREEN } from '../../utils/theme';

interface FilterOption {
  id: string;
  title: string;
  selected: boolean;
}

interface FilterTabsProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterPress: (filterId: string) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ 
  filters, 
  activeFilter, 
  onFilterPress 
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterTab,
              activeFilter === option.id && styles.activeFilterTab
            ]}
            onPress={() => onFilterPress(option.id)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === option.id && styles.activeFilterText
            ]}>
              {option.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: RADII.button,
    backgroundColor: COLORS.white,
  },
  activeFilterTab: {
    backgroundColor: GREEN.green700,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  filterText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.white,
  },
});

export default FilterTabs;