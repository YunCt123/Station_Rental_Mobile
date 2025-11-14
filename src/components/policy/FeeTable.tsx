import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, FONTS } from "../../utils/theme";

interface FeeItem {
  label: string;
  description: string;
  price: string;
}

interface FeeTableProps {
  fees: FeeItem[];
}

const FeeTable: React.FC<FeeTableProps> = ({ fees }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerText, styles.labelColumn]}>Loại Phí</Text>
        <Text style={[styles.headerText, styles.descColumn]}>Mô Tả</Text>
        <Text style={[styles.headerText, styles.priceColumn]}>Giá</Text>
      </View>
      {fees.map((fee, index) => (
        <View
          key={index}
          style={[
            styles.row,
            index === fees.length - 1 && styles.lastRow,
          ]}
        >
          <Text style={[styles.cellText, styles.labelColumn, styles.labelText]}>
            {fee.label}
          </Text>
          <Text style={[styles.cellText, styles.descColumn]}>{fee.description}</Text>
          <Text style={[styles.cellText, styles.priceColumn, styles.priceText]}>
            {fee.price}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    backgroundColor: COLORS.primary + "10",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  headerText: {
    fontSize: FONTS.caption,
    fontWeight: "700",
    color: COLORS.text,
  },
  row: {
    flexDirection: "row",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cellText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  labelColumn: {
    width: "30%",
  },
  descColumn: {
    width: "40%",
  },
  priceColumn: {
    width: "30%",
    textAlign: "right",
  },
  labelText: {
    fontWeight: "600",
    color: COLORS.text,
  },
  priceText: {
    fontWeight: "600",
    color: COLORS.primary,
  },
});

export default FeeTable;
