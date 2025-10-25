import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounce effect for search with 1 seconds delay
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for 2 seconds
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 1000);

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Function to perform actual search
  const performSearch = (query: string) => {
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

  // Handle search input change (immediate update for UI)
  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Perform search immediately for recent searches
    performSearch(searchTerm);
    setIsSearchFocused(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        {/* Sticky Search Header */}
        <View style={styles.stickyHeader}>
          <SearchHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onFilterPress={() => console.log('Filter pressed')}
          />

          {/* Sticky Filter Tabs */}
          {!isSearchFocused && (
            <FilterTabs
              filters={filterOptions}
              activeFilter={activeFilter}
              onFilterPress={handleFilterPress}
            />
          )}
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Searches - Only show when search is focused and no query */}
          {isSearchFocused && searchQuery === '' && (
            <RecentSearches
              searches={recentSearches}
              onSearchPress={handleRecentSearchPress}
            />
          )}

          {/* Search Results - Show when there's a query or when not focused */}
          {(searchQuery !== '' || !isSearchFocused) && (
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
  stickyHeader: {
    backgroundColor: COLORS.gradient_4[0],
    zIndex: 1000,
  },
  resultsSection: {
    paddingHorizontal: SPACING.screenPadding,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
});

export default SearchScreen;