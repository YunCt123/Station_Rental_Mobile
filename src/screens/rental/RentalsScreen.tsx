import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, FONTS, SHADOWS } from "../../utils/theme";
import EmptyState from "../../components/booking/EmptyState";
import StatusModal from "../../components/common/StatusModal";
import { RentalCard } from "../../components/index";
import BookingFilterTabs from "../../components/booking/BookingFilterTabs";
import { Rental } from "../../types/rental";
import { rentalService } from "../../services/rentalService";
import { Ionicons } from "@expo/vector-icons";

const RentalsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /** Fetch user's rentals */
  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);

      console.log("🔍 [RentalsScreen] Starting fetchRentals, activeTab:", activeTab);

      // Fetch all rentals from backend
      const response = await rentalService.getUserRentals({ limit: 100 });
      
      console.log("📦 [RentalsScreen] Response received:", JSON.stringify(response, null, 2));
      console.log("📊 [RentalsScreen] Response type:", typeof response);
      console.log("📊 [RentalsScreen] Response keys:", Object.keys(response || {}));
      
      const allRentals = response.rentals || [];

      console.log("📦 [RentalsScreen] All rentals fetched:", allRentals.length);
      console.log("📦 [RentalsScreen] All rentals data:", JSON.stringify(allRentals, null, 2));

      // Filter based on tab
      let filtered: Rental[] = [];

      if (activeTab === "active") {
        // Show rentals that are active (ONGOING, RETURN_PENDING)
        filtered = allRentals.filter((r) => {
          const status = r.status?.toUpperCase();
          console.log(`  🔍 Rental ${r._id}: status = ${status}`);
          return status === "ONGOING" || status === "RETURN_PENDING";
        });
        console.log("✅ Active rentals filtered:", filtered.length);
      } else {
        // Show completed or cancelled rentals
        filtered = allRentals.filter((r) => {
          const status = r.status?.toUpperCase();
          console.log(`  🔍 Rental ${r._id}: status = ${status}`);
          return (
            status === "COMPLETED" ||
            status === "REJECTED" ||
            status === "DISPUTED"
          );
        });
        console.log("📜 History rentals filtered:", filtered.length);
      }

      setRentals(filtered);
    } catch (error: any) {
      console.error("❌ [RentalsScreen] Error fetching rentals:", error);
      console.error("❌ [RentalsScreen] Error response:", error.response);
      console.error("❌ [RentalsScreen] Error message:", error.message);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách thuê xe"
      );
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  /** Initial load and tab change */
  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  /** Refresh when screen comes into focus */
  useFocusEffect(
    useCallback(() => {
      fetchRentals();
    }, [fetchRentals])
  );

  /** Handle pull to refresh */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchRentals();
  };

  /** Navigate to rental detail */
  const handleRentalPress = (rental: Rental) => {
    if (rental._id) {
      (navigation as any).navigate("RentalDetail", { rentalId: rental._id });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient colors={COLORS.gradient_4} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử thuê xe</Text>
          <View style={styles.backButton} />
        </View>

        {/* Filter Tabs */}
        <BookingFilterTabs
          tabs={[
            { id: "active", label: "Đang thuê" },
            { id: "history", label: "Lịch sử" },
          ]}
          activeTab={activeTab}
          onTabPress={(tabId) => setActiveTab(tabId as "active" | "history")}
        />

        {/* Content */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : rentals.length === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          <FlatList
            data={rentals}
            keyExtractor={(item) => item._id || Math.random().toString()}
            renderItem={({ item }) => (
              <RentalCard rental={item} onPress={handleRentalPress} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
              />
            }
          />
        )}

        {/* Error Modal */}
        <StatusModal
          visible={errorModalVisible}
          type="error"
          title="Lỗi"
          message={errorMessage}
          onClose={() => setErrorModalVisible(false)}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: FONTS.header,
    color: COLORS.white,
    fontWeight: "700",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeTab: {
    backgroundColor: COLORS.white,
  },
  tabText: {
    fontSize: FONTS.body,
    color: COLORS.white,
    fontWeight: "600",
  },
  activeTabText: {
    color: COLORS.primary,
  },
  badge: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  listContent: {
    padding: SPACING.lg,
  },
});

export default RentalsScreen;
