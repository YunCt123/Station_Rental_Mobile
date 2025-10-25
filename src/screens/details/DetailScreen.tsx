import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { VehicleData } from "../../data/vehicles";
import mockVehicles from "../../data/vehicles";
import { 
  VehicleInfoCard, 
  PricingCard, 
  FeaturesCard, 
  SpecsCard, 
  DescriptionCard,
  StatusBanner
} from "../../components/index";

type DetailScreenRouteProp = RouteProp<RootStackParamList, "VehicleDetails">;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DetailScreenProps {
  vehicle?: VehicleData;
}

const DetailScreen: React.FC<DetailScreenProps> = ({
  vehicle: propVehicle,
}) => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<DetailScreenNavigationProp>();

  // Find vehicle by ID from mock data
  const vehicleId = route.params?.vehicleId || "1";
  const foundVehicle = mockVehicles.find((v) => v.id === vehicleId);

  // Fallback to first vehicle if not found
  const vehicle = propVehicle || foundVehicle || mockVehicles[0];

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

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          {/* <StatusBanner vehicle={vehicle} /> */}

          {/* Vehicle Info Card */}
          <VehicleInfoCard vehicle={vehicle} />

          {/* Pricing Card */}
          <PricingCard vehicle={vehicle} />

          {/* Description Card */}
          <DescriptionCard vehicle={vehicle} />

          {/* Features Card */}
          <FeaturesCard vehicle={vehicle} />

          {/* Specifications Card */}
          <SpecsCard vehicle={vehicle} />

          <View style={{ height: 100 }} />
        </ScrollView>
      {/* </LinearGradient> */}
        {/* Bottom Action Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.rentButton,
              { opacity: vehicle.status === "Available" ? 1 : 0.5 },
            ]}
            disabled={vehicle.status !== "Available"}
            onPress={() =>
              navigation.navigate("BookingPayment", { vehicleId: vehicle.id })
            }
          >
            <Text style={styles.rentButtonText}>Đặt xe ngay</Text>
          </TouchableOpacity>
        </View>
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
    position: 'absolute',
    zIndex: 10,
    bottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center', 
  },
  bottomContainer: {
    paddingVertical: SPACING.xxl,
    position: 'absolute',
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
    alignItems: 'center',
    ...SHADOWS.sm,
    marginTop: -SPACING.md,
  },
  rentButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default DetailScreen;
