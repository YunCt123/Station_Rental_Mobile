import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { UIVehicle } from "../../services/vehicleService";
import { vehicleService, mapVehicleToUI } from "../../services/vehicleService";
import {
  VehicleInfoCard,
  PricingCard,
  FeaturesCard,
  SpecsCard,
  DescriptionCard,
  StatusBanner,
} from "../../components/index";

type DetailScreenRouteProp = RouteProp<RootStackParamList, "VehicleDetails">;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DetailScreenProps {
  vehicle?: UIVehicle;
}

const DetailScreen: React.FC<DetailScreenProps> = ({
  vehicle: propVehicle,
}) => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const vehicleId = route.params?.vehicleId || "1";
  const [vehicle, setVehicle] = useState<UIVehicle | null>(propVehicle || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propVehicle) {
      setVehicle(propVehicle);
      setLoading(false);
    } else {
      loadVehicleDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const vehicleData = await vehicleService.getVehicleById(vehicleId);
      const mappedVehicle = mapVehicleToUI(vehicleData);
      setVehicle(mappedVehicle);
    } catch (err) {
      console.error("Error loading vehicle details:", err);
      setError("Không thể tải thông tin xe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={COLORS.gradient_4}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết xe</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải thông tin xe...</Text>
            </View>
          ) : !vehicle ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                Không tìm thấy thông tin xe
              </Text>
            </View>
          ) : (
            <>
              {/* Status Banner */}
              <StatusBanner vehicle={vehicle} />

              {/* Vehicle Info Card */}
              <VehicleInfoCard vehicle={vehicle} />

              {/* Pricing Card */}
              <PricingCard vehicle={vehicle} />

              {/* Specifications Card */}
              <SpecsCard vehicle={vehicle} />

              {/* Features Card */}
              <FeaturesCard vehicle={vehicle} />

              {/* Description Card */}
              <DescriptionCard vehicle={vehicle} />

              <View style={{ height: 80 }} />
            </>
          )}
        </ScrollView>
        {/* </LinearGradient> */}
        {/* Bottom Action Button */}
        {vehicle && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.rentButton,
                { opacity: vehicle.status === "AVAILABLE" ? 1 : 0.5 },
              ]}
              disabled={vehicle.status !== "AVAILABLE"}
              onPress={() =>
                navigation.navigate("BookingPayment", { vehicleId: vehicle.id })
              }
            >
              <Text style={styles.rentButtonText}>Đặt xe ngay</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: "absolute",
    zIndex: 10,
    bottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
  },
  bottomContainer: {
    paddingVertical: SPACING.xxl,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  rentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.button,
    paddingVertical: SPACING.md,
    alignItems: "center",
    ...SHADOWS.sm,
    marginTop: -SPACING.md,
  },
  rentButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "700",
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    minHeight: 400,
  },
  loadingText: {
    color: COLORS.primary,
    marginTop: SPACING.md,
    fontSize: FONTS.body,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
});

export default DetailScreen;
