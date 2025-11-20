import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (hour: number, minute: number) => void;
  selectedHour: number;
  selectedMinute: number;
  title?: string;
  minTime?: { hour: number; minute: number };
  maxTime?: { hour: number; minute: number };
}

const TimePicker: React.FC<TimePickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedHour,
  selectedMinute,
  title = "Chọn giờ",
  minTime,
  maxTime,
}) => {
  const [tempHour, setTempHour] = useState(selectedHour);
  const [tempMinute, setTempMinute] = useState(selectedMinute);

  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minutes (0, 15, 30, 45)
  const minutes = [0, 15, 30, 45];

  const isTimeDisabled = (hour: number, minute: number) => {
    if (minTime) {
      if (hour < minTime.hour) return true;
      if (hour === minTime.hour && minute < minTime.minute) return true;
    }
    if (maxTime) {
      if (hour > maxTime.hour) return true;
      if (hour === maxTime.hour && minute > maxTime.minute) return true;
    }
    return false;
  };

  const handleConfirm = () => {
    if (!isTimeDisabled(tempHour, tempMinute)) {
      onSelect(tempHour, tempMinute);
      onClose();
    }
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.timeDisplayText}>
              {formatTime(tempHour, tempMinute)}
            </Text>
          </View>

          {/* Time Picker */}
          <View style={styles.pickerContainer}>
            {/* Hours Column */}
            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>Giờ</Text>
              <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {hours.map((hour) => {
                  const disabled = minutes.some((min) => !isTimeDisabled(hour, min)) ? false : true;
                  const isSelected = tempHour === hour;
                  
                  return (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeItem,
                        isSelected && styles.timeItemSelected,
                        disabled && styles.timeItemDisabled,
                      ]}
                      onPress={() => !disabled && setTempHour(hour)}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          styles.timeItemText,
                          isSelected && styles.timeItemTextSelected,
                          disabled && styles.timeItemTextDisabled,
                        ]}
                      >
                        {hour.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Separator */}
            <View style={styles.separator}>
              <Text style={styles.separatorText}>:</Text>
            </View>

            {/* Minutes Column */}
            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>Phút</Text>
              <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {minutes.map((minute) => {
                  const disabled = isTimeDisabled(tempHour, minute);
                  const isSelected = tempMinute === minute;
                  
                  return (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timeItem,
                        isSelected && styles.timeItemSelected,
                        disabled && styles.timeItemDisabled,
                      ]}
                      onPress={() => !disabled && setTempMinute(minute)}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          styles.timeItemText,
                          isSelected && styles.timeItemTextSelected,
                          disabled && styles.timeItemTextDisabled,
                        ]}
                      >
                        {minute.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  timeDisplay: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.primary + "10",
  },
  timeDisplayText: {
    fontSize: 48,
    fontWeight: "700",
    color: COLORS.primary,
    fontFamily: "monospace",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  columnLabel: {
    fontSize: FONTS.caption,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  scrollView: {
    maxHeight: 200,
    width: "100%",
  },
  timeItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.sm,
    borderRadius: RADII.md,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  timeItemSelected: {
    backgroundColor: COLORS.primary,
  },
  timeItemDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.4,
  },
  timeItemText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: "monospace",
  },
  timeItemTextSelected: {
    color: COLORS.white,
  },
  timeItemTextDisabled: {
    color: COLORS.textTertiary,
  },
  separator: {
    paddingHorizontal: SPACING.sm,
    paddingTop: 24,
  },
  separatorText: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default TimePicker;