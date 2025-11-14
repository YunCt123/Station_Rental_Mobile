import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS } from "../../utils/theme";

interface RefundPolicyCardProps {
  title: string;
  conditions: string[];
  type: "refund" | "no-refund";
}

const RefundPolicyCard: React.FC<RefundPolicyCardProps> = ({
  title,
  conditions,
  type,
}) => {
  const isRefund = type === "refund";
  const bgColor = isRefund ? COLORS.success + "10" : COLORS.error + "10";
  const iconColor = isRefund ? COLORS.success : COLORS.error;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Ionicons
          name={isRefund ? "checkmark-circle" : "close-circle"}
          size={20}
          color={iconColor}
        />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>
        {conditions.map((condition, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.bullet}>
              <View style={[styles.bulletDot, { backgroundColor: iconColor }]} />
            </View>
            <Text style={styles.itemText}>{condition}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
  },
  content: {
    gap: SPACING.xs,
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
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  itemText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});

export default RefundPolicyCard;
