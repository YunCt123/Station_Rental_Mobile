import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../../utils/theme';
import { SearchHeader, RecentSearches, FilterTabs, VehicleCard } from '../../components';

interface FilterOption {
  id: string;
  title: string;
  selected: boolean;
}

interface ElectricVehicle {
  id: string;
  name: string;
  model: string;
  type: 'electric-car' | 'electric-bike' | 'electric-scooter' | 'electric-motorbike';
  battery: number;
  distance: string;
  pricePerHour: number;
  image: string;
  features: string[];
  stationName: string;
  stationAddress: string;
  isAvailable: boolean;
  rating: number;
}

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<ElectricVehicle[]>([]);

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

  const featuredVehicles: ElectricVehicle[] = [
    {
      id: '1',
      name: 'Tesla Model 3',
      model: '2024 Standard Range',
      type: 'electric-car',
      battery: 85,
      distance: '0.3 km',
      pricePerHour: 120000,
      image: 'https://via.placeholder.com/150',
      features: ['Tự lái', 'Sạc nhanh', 'Màn hình cảm ứng'],
      stationName: 'Trạm FPT University',
      stationAddress: 'Khu Công nghệ cao Hòa Lạc',
      isAvailable: true,
      rating: 4.8,
    },
    {
      id: '2',
      name: 'VinFast VF8',
      model: '2024 Eco',
      type: 'electric-car',
      battery: 92,
      distance: '0.5 km',
      pricePerHour: 100000,
      image: 'https://via.placeholder.com/150',
      features: ['Thông minh', 'An toàn cao', 'Tiết kiệm'],
      stationName: 'Trạm Keangnam',
      stationAddress: 'Phạm Hùng, Nam Từ Liêm',
      isAvailable: true,
      rating: 4.6,
    },
    {
      id: '3',
      name: 'Honda PCX Electric',
      model: '2024',
      type: 'electric-scooter',
      battery: 78,
      distance: '0.8 km',
      pricePerHour: 45000,
      image: 'https://via.placeholder.com/150',
      features: ['Nhỏ gọn', 'Tiết kiệm', 'Dễ điều khiển'],
      stationName: 'Trạm Honda Dream',
      stationAddress: 'Nguyễn Trãi, Thanh Xuân',
      isAvailable: true,
      rating: 4.4,
    },
    {
      id: '4',
      name: 'BMW iX3',
      model: '2024',
      type: 'electric-car',
      battery: 95,
      distance: '1.2 km',
      pricePerHour: 150000,
      image: 'https://via.placeholder.com/150',
      features: ['Sang trọng', 'Hiệu suất cao', 'Công nghệ'],
      stationName: 'Trạm Lotte Center',
      stationAddress: '54 Liễu Giai, Ba Đình',
      isAvailable: false,
      rating: 4.9,
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = featuredVehicles.filter(vehicle =>
      vehicle.name.toLowerCase().includes(query.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(query.toLowerCase()) ||
      vehicle.stationName.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
  };

  const handleFilterPress = (filterId: string) => {
    setActiveFilter(filterId);
    
    if (filterId === 'all') {
      setSearchResults(featuredVehicles);
    } else {
      const filtered = featuredVehicles.filter(vehicle => vehicle.type === filterId);
      setSearchResults(filtered);
    }
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    handleSearch(searchTerm);
    setIsSearchFocused(false);
  };

  return (
    <SafeAreaView style={styles.container}>
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
            
            {(searchQuery ? searchResults : featuredVehicles).map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPress={(vehicleId) => console.log('Vehicle pressed:', vehicleId)}
              />
            ))}
          </View>
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