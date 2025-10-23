import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONTS } from '../../utils/theme';
import { SearchHeader, RecentSearches, FilterTabs, VehicleCard } from '../../components';
import { RootStackParamList } from '../../types/navigation';
import { VehicleData } from '../../data/vehicles';
import mockVehicles from '../../data/vehicles';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FilterOption {
  id: string;
  title: string;
  selected: boolean;
}

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<VehicleData[]>([]);
  const [allVehicles, setAllVehicles] = useState<VehicleData[]>([]);

  const filterOptions: FilterOption[] = [
    { id: 'all', title: 'Tất cả', selected: true },
    { id: 'electric-car', title: 'Xe hơi điện', selected: false },
    { id: 'electric-bike', title: 'Xe đạp điện', selected: false },
    { id: 'electric-motorbike', title: 'Xe máy điện', selected: false },
    { id: 'electric-scooter', title: 'Xe scooter điện', selected: false },
  ];

  const recentSearches = [
    'Tesla Model 3',
    'VinFast VF8', 
    'Honda PCX Electric',
    'BMW iX3',
  ];

  useEffect(() => {
    setAllVehicles(mockVehicles);
    setSearchResults(mockVehicles);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults(allVehicles);
      return;
    }

    const filtered = allVehicles.filter(vehicle =>
      vehicle.name.toLowerCase().includes(query.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(query.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(query.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
  };

  const handleFilterPress = (filterId: string) => {
    setActiveFilter(filterId);
    
    if (filterId === 'all') {
      setSearchResults(allVehicles);
    } else {
      const filtered = allVehicles.filter(vehicle => 
        vehicle.type.toLowerCase().includes(filterId.replace('electric-', '').toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  const handleVehiclePress = (vehicleId: string) => {
    navigation.navigate('VehicleDetails', { vehicleId });
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    handleSearch(searchTerm);
    setIsSearchFocused(false);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        onFilterPress={() => console.log('Filter pressed')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recent Searches - Only show when search is focused */}
        {isSearchFocused && searchQuery === '' && (
          <RecentSearches
            searches={recentSearches}
            onSearchPress={handleRecentSearchPress}
          />
        )}

        {/* Filter Tabs */}
        {!isSearchFocused && (
          <FilterTabs
            filters={filterOptions}
            activeFilter={activeFilter}
            onFilterPress={handleFilterPress}
          />
        )}

        {/* Search Results or Featured Vehicles */}
        {!isSearchFocused && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Kết quả tìm kiếm (${searchResults.length})` : 'Xe phổ biến'}
            </Text>
            
            {searchResults.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPress={handleVehiclePress}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  resultsSection: {
    paddingHorizontal: SPACING.screenPadding,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
});

export default SearchScreen;