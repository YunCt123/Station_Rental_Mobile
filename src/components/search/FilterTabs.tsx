import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS, RADII } from '../../utils/theme';

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
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  filterTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: RADII.button,
    backgroundColor: COLORS.background,
    marginLeft: SPACING.screenPadding,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
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