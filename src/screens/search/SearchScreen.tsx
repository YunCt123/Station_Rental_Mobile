import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, FONTS } from "../../utils/theme";
import {
  SearchHeader,
  RecentSearches,
  FilterTabs,
  VehicleCard,
} from "../../components";
import { RootStackParamList } from "../../types/navigation";
import { UIVehicle } from "../../services/vehicleService";
import { vehicleService, mapVehiclesToUI } from "../../services/vehicleService";
import { Ionicons } from "@expo/vector-icons";

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FilterOption {
  id: string;
  title: string;
  selected: boolean;
}

const DEBOUNCE_DELAY = 500; // ms
const MIN_QUERY_LENGTH_FOR_REMOTE = 2; // only call remote search if query length >= 2

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<UIVehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<UIVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRunRef = useRef(true);
  const skipSearchEffectRef = useRef(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
    { id: "all", title: "Tất cả", selected: true },
  ]);

  const recentSearches = [
    "Tesla Model 3",
    "VinFast VF8",
    "Honda PCX Electric",
    "BMW iX3",
  ];

  useEffect(() => {
    loadAllVehicles();
    // cleanup on unmount
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllVehicles = async () => {
    try {
      setLoading(true);
      const vehicles = await vehicleService.getVehicles();
      const vehiclesData = mapVehiclesToUI(vehicles);
      setAllVehicles(vehiclesData);
      setSearchResults(vehiclesData);

      // Load brands and create filter options
      const brands = await vehicleService.getBrands();
      const brandFilters: FilterOption[] = [
        { id: "all", title: "Tất cả", selected: true },
        ...brands.map((brand) => ({
          id: brand,
          title: brand,
          selected: false,
        })),
      ];
      setFilterOptions(brandFilters);
    } catch (err) {
      console.error("Error loading vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  // performSearch is stable with useCallback
  const performSearch = useCallback(
  async (query: string) => {
    const q = query.trim().toLowerCase();
    const lowerFilter = activeFilter.toLowerCase();

    // Nếu input rỗng → chỉ hiển thị theo filter
    if (q === "") {
      const filtered =
        lowerFilter === "all"
          ? allVehicles
          : allVehicles.filter(
              (v) => v.brand.toLowerCase() === lowerFilter
            );
      setSearchResults(filtered);
      return;
    }

    // Local filtering (nếu query ngắn)
    if (q.length < MIN_QUERY_LENGTH_FOR_REMOTE) {
      const filtered = allVehicles.filter((vehicle) => {
        const matchQuery =
          vehicle.name.toLowerCase().includes(q) ||
          vehicle.type.toLowerCase().includes(q) ||
          (vehicle.station_name &&
            vehicle.station_name.toLowerCase().includes(q)) ||
          vehicle.brand.toLowerCase().includes(q);
        const matchFilter =
          lowerFilter === "all" ||
          vehicle.brand.toLowerCase() === lowerFilter;
        return matchQuery && matchFilter;
      });

      setSearchResults(filtered);
      return;
    }

    // Remote search
    try {
      setSearchLoading(true);
      const vehicles = await vehicleService.searchVehicles(q);
      const vehiclesData = mapVehiclesToUI(vehicles);

      // Lọc theo filter sau khi gọi API
      const filtered =
        lowerFilter === "all"
          ? vehiclesData
          : vehiclesData.filter(
              (v) => v.brand.toLowerCase() === lowerFilter
            );

      setSearchResults(filtered);
    } catch (err) {
      console.error("Error searching vehicles (remote):", err);
      // fallback local filter
      const filtered = allVehicles.filter((vehicle) => {
        const matchQuery =
          vehicle.name.toLowerCase().includes(q) ||
          vehicle.type.toLowerCase().includes(q) ||
          (vehicle.station_name &&
            vehicle.station_name.toLowerCase().includes(q)) ||
          vehicle.brand.toLowerCase().includes(q);
        const matchFilter =
          lowerFilter === "all" ||
          vehicle.brand.toLowerCase() === lowerFilter;
        return matchQuery && matchFilter;
      });
      setSearchResults(filtered);
    } finally {
      setSearchLoading(false);
    }
  },
  [allVehicles, activeFilter]
);


  // Debounce searchQuery changes but skip the very first render
  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }

    // Skip nếu đang được xử lý bởi handleFilterPress
    if (skipSearchEffectRef.current) {
      skipSearchEffectRef.current = false;
      return;
    }

    const handler = setTimeout(() => {
      performSearch(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [searchQuery, performSearch]);

  const handleSearch = (searchVehicles: string) => {
    setSearchQuery(searchVehicles);
  };

  const handleFilterPress = async (filterId: string) => {
    const query = searchQuery.trim();
    
    // Set filter trước
    setActiveFilter(filterId);

    // Nếu đang có query search, manually filter ngay lập tức
    if (query !== "") {
      // Set flag để skip useEffect search
      skipSearchEffectRef.current = true;
      
      const q = query.toLowerCase();
      const lowerFilter = filterId.toLowerCase();

      // Local filtering nhanh
      if (q.length < MIN_QUERY_LENGTH_FOR_REMOTE) {
        const filtered = allVehicles.filter((vehicle) => {
          const matchQuery =
            vehicle.name.toLowerCase().includes(q) ||
            vehicle.type.toLowerCase().includes(q) ||
            (vehicle.station_name &&
              vehicle.station_name.toLowerCase().includes(q)) ||
            vehicle.brand.toLowerCase().includes(q);
          const matchFilter =
            lowerFilter === "all" ||
            vehicle.brand.toLowerCase() === lowerFilter;
          return matchQuery && matchFilter;
        });
        setSearchResults(filtered);
      } else {
        // Remote search với filter
        try {
          setSearchLoading(true);
          const vehicles = await vehicleService.searchVehicles(q);
          const vehiclesData = mapVehiclesToUI(vehicles);

          const filtered =
            lowerFilter === "all"
              ? vehiclesData
              : vehiclesData.filter(
                  (v) => v.brand.toLowerCase() === lowerFilter
                );

          setSearchResults(filtered);
        } catch (err) {
          console.error("Error searching vehicles:", err);
          const filtered = allVehicles.filter((vehicle) => {
            const matchQuery =
              vehicle.name.toLowerCase().includes(q) ||
              vehicle.type.toLowerCase().includes(q) ||
              (vehicle.station_name &&
                vehicle.station_name.toLowerCase().includes(q)) ||
              vehicle.brand.toLowerCase().includes(q);
            const matchFilter =
              lowerFilter === "all" ||
              vehicle.brand.toLowerCase() === lowerFilter;
            return matchQuery && matchFilter;
          });
          setSearchResults(filtered);
        } finally {
          setSearchLoading(false);
        }
      }
      return;
    }

    // Nếu không có query, load theo filter như cũ
    if (filterId === "all") {
      setSearchResults(allVehicles);
    } else {
      try {
        const filtered = await vehicleService.getVehiclesByBrand(filterId);
        const vehiclesData = mapVehiclesToUI(filtered);
        setSearchResults(vehiclesData);
      } catch (err) {
        console.error("Error filtering vehicles by brand:", err);
        const filtered = allVehicles.filter(
          (vehicle) => vehicle.brand.toLowerCase() === filterId.toLowerCase()
        );
        setSearchResults(filtered);
      }
    }
  };

  const handleVehiclePress = (vehicleId: string) => {
    navigation.navigate("VehicleDetails", { vehicleId });
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Immediately run search for better UX
    performSearch(searchTerm);
    setIsSearchFocused(false);
  };

  const handleFilterButtonPress = () => {
    setShowFilterModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
            onFilterPress={handleFilterButtonPress}
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

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Loading State */}
          {(loading || searchLoading) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.white} />
              <Text style={styles.loadingText}>
                {loading ? "Đang tải xe..." : "Đang tìm kiếm..."}
              </Text>
            </View>
          )}

          {/* Content - Only show when not loading */}
          {!loading && !searchLoading && (
            <>
              {/* Recent Searches - Only show when search is focused and no query */}
              {isSearchFocused && searchQuery === "" && (
                <RecentSearches
                  searches={recentSearches}
                  onSearchPress={handleRecentSearchPress}
                />
              )}

              {/* Search Results - Show when there's a query or when not focused */}
              {(searchQuery !== "" || !isSearchFocused) && (
                <View style={styles.resultsSection}>
                  <Text style={styles.sectionTitle}>
                    {searchQuery
                      ? `Kết quả tìm kiếm (${searchResults.length})`
                      : "Xe phổ biến"}
                  </Text>

                  {searchResults.length === 0 ? (
                    <View style={{ alignItems: "center", marginVertical: 40 }}>
                      <Ionicons
                        name="search-outline"
                        size={40}
                        color={COLORS.textSecondary}
                      />
                      <Text
                        style={{ color: COLORS.textSecondary, marginTop: 10 }}
                      >
                        Không tìm thấy xe phù hợp
                      </Text>
                    </View>
                  ) : (
                    searchResults.map((vehicle) => (
                      <VehicleCard
                        key={vehicle._id}
                        vehicle={vehicle}
                        onPress={handleVehiclePress}
                      />
                    ))
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Lọc theo thương hiệu</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Text style={styles.modalClose}>Đóng</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalFilters}>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterOption,
                      activeFilter === option.title &&
                        styles.activeFilterOption,
                    ]}
                    onPress={() => {
                      handleFilterPress(option.title);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        activeFilter === option.title &&
                          styles.activeFilterOptionText,
                      ]}
                    >
                      {option.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    color: COLORS.white,
    marginTop: SPACING.md,
    fontSize: FONTS.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalClose: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.primary,
  },
  modalFilters: {
    padding: SPACING.md,
  },
  filterOption: {
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  activeFilterOption: {
    backgroundColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  activeFilterOptionText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default SearchScreen;