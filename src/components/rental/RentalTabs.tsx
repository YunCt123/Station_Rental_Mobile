import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SPACING, FONTS } from "../../utils/theme";

interface RentalTabsProps {
  activeTab: "active" | "history";
  onTabChange: (tab: "active" | "history") => void;
  activeCount?: number;
}

const RentalTabs: React.FC<RentalTabsProps> = ({
  activeTab,
  onTabChange,
  activeCount = 0,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "active" && styles.activeTab]}
        onPress={() => onTabChange("active")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "active" && styles.activeTabText,
          ]}
        >
          Đang thuê
        </Text>
        {activeCount > 0 && activeTab === "active" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "history" && styles.activeTab]}
        onPress={() => onTabChange("history")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "history" && styles.activeTabText,
          ]}
        >
          Đã hoàn thành
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default RentalTabs;
