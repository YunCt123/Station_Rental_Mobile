import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';

interface VehicleCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

interface VehicleCategoriesProps {
  categories: VehicleCategory[];
  onCategoryPress: (categoryId: string) => void;
}

const VehicleCategories: React.FC<VehicleCategoriesProps> = ({ 
  categories, 
  onCategoryPress 
}) => {
  const renderCategory = (category: VehicleCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryCard, { backgroundColor: category.color + '15' }]}
      onPress={() => onCategoryPress(category.id)}
    >
      <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '25' }]}>
        <Ionicons name={category.icon as any} size={24} color={category.color} />
      </View>
      <Text style={styles.categoryName}>{category.name}</Text>
      <Text style={styles.categoryCount}>{category.count} xe</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danh mục xe điện</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(renderCategory)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.md,
  },
  categoryCard: {
    width: 120,
    padding: SPACING.md,
    borderRadius: RADII.card,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: FONTS.body,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  categoryCount: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
});

export default VehicleCategories;