import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS } from "../../utils/theme";

interface RentalConditionsProps {
  conditions: {
    title: string;
    items: string[];
  }[];
}

const RentalConditions: React.FC<RentalConditionsProps> = ({ conditions }) => {
  return (
    <View style={styles.container}>
      {conditions.map((condition, index) => (
        <View key={index} style={styles.conditionBlock}>
          <Text style={styles.conditionTitle}>{condition.title}</Text>
          {condition.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.item}>
              <View style={styles.bullet}>
                <View style={styles.bulletDot} />
              </View>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.lg,
  },
  conditionBlock: {
    gap: SPACING.sm,
  },
  conditionTitle: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  bullet: {
    width: 20,
    paddingTop: 6,
    alignItems: "center",
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  itemText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});

export default RentalConditions;
