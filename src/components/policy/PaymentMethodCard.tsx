import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS } from "../../utils/theme";

interface PaymentMethodCardProps {
  title: string;
  description: string;
  icon: string;
  bgColor: string;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  title,
  description,
  icon,
  bgColor,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={icon as any} size={24} color={COLORS.white} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  description: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
});

export default PaymentMethodCard;
