import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../utils/theme';

interface RecentSearchesProps {
  searches: string[];
  onSearchPress: (search: string) => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ 
  searches, 
  onSearchPress 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tìm kiếm gần đây</Text>
      {searches.map((search, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.searchItem}
          onPress={() => onSearchPress(search)}
        >
          <Ionicons name="time-outline" size={16} color={COLORS.borderDark} />
          <Text style={styles.searchText}>{search}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.borderDark,
    marginBottom: SPACING.md,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchText: {
    fontSize: FONTS.body,
    color: COLORS.borderDark,
  },
});

export default RecentSearches;