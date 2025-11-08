import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, FONTS, SHADOWS } from "../../utils/theme";
import { FeaturedVehicles, AvailableVehicles } from "../../components";
import { RootStackParamList } from "../../types/navigation";
import { UIVehicle } from "../../services/vehicleService";
import { vehicleService, mapVehiclesToUI } from "../../services/vehicleService";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [greeting, setGreeting] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState<UIVehicle[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<UIVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Chào buổi sáng");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");
  }, []);

  // Reload vehicles every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [])
  );

  const loadVehicles = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Fetch all available vehicles
      const available = await vehicleService.getAvailableVehicles();
      const availableData = mapVehiclesToUI(available);
      setAvailableVehicles(availableData);

      // Fetch featured vehicles (top rated)
      const featured = await vehicleService.getFeaturedVehicles(4);
      const featuredData = mapVehiclesToUI(featured);
      setFeaturedVehicles(featuredData);
    } catch (err) {
      console.error("Error loading vehicles:", err);
      setError("Không thể tải danh sách xe");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVehicles(false); // Don't show loading spinner when refreshing
    setRefreshing(false);
  }, []);

  const handleVehiclePress = (vehicleId: string) => {
    navigation.navigate("VehicleDetails", { vehicleId });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        {/* Header - Sticky */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}!</Text>
            <Text style={styles.subtitle}>Thuê xe điện thông minh</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.primary}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải xe...</Text>
            </View>
          ) : (
            <>
              {/* Featured Vehicles */}
              <FeaturedVehicles
                vehicles={featuredVehicles}
                onVehiclePress={handleVehiclePress}
              />

              {/* Available Vehicles */}
              <AvailableVehicles
                vehicles={availableVehicles}
                onVehiclePress={handleVehiclePress}
              />
            </>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  greeting: {
    fontSize: FONTS.title,
    fontWeight: "800",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONTS.body,
    color: COLORS.white,
    marginTop: SPACING.xs,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    color: COLORS.primary,
    marginTop: SPACING.md,
    fontSize: FONTS.body,
  },
});

export default HomeScreen;
