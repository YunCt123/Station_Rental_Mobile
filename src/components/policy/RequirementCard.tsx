import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS } from "../../utils/theme";

interface RequirementCardProps {
  title: string;
  items: string[];
  type: "required" | "forbidden";
}

const RequirementCard: React.FC<RequirementCardProps> = ({
  title,
  items,
  type,
}) => {
  const isRequired = type === "required";
  const bgColor = isRequired ? COLORS.success + "10" : COLORS.error + "10";
  const iconColor = isRequired ? COLORS.success : COLORS.error;
  const iconName = isRequired ? "checkmark-circle" : "close-circle";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Ionicons name={iconName as any} size={20} color={iconColor} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.bullet}>
              <View style={[styles.bulletDot, { backgroundColor: iconColor }]} />
            </View>
            <Text style={styles.itemText}>{item}</Text>
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

export default RequirementCard;
