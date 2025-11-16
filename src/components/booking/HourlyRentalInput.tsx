import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { TimePicker } from "./TimePicker";

interface HourlyRentalInputProps {
  rentalHours: string;
  onChangeHours: (hours: string) => void;
  onQuickSelect: (hours: number) => void;
  stationLocation: string;
  pickupDate: Date;
  onPickupDateChange: (date: Date) => void;
  pickupTime: { hour: number; minute: number };
  onPickupTimeChange: (hour: number, minute: number) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export const HourlyRentalInput: React.FC<HourlyRentalInputProps> = ({
  rentalHours,
  onChangeHours,
  onQuickSelect,
  stationLocation,
  pickupDate,
  onPickupDateChange,
  pickupTime,
  onPickupTimeChange,
}) => {
  const quickHours = [2, 4, 6, 8];
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Generate dates for next 90 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDateDisplay = (date: Date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return { dayName, day, month, year };
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const DatePickerModal = () => {
    const dates = generateDates();

    return (
      <Modal
        visible={showPickupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPickupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày nhận xe</Text>
              <TouchableOpacity
                onPress={() => setShowPickupModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Date List */}
            <ScrollView
              style={styles.dateList}
              showsVerticalScrollIndicator={false}
            >
              {dates.map((date, index) => {
                const { dayName, day, month, year } = formatDateDisplay(date);
                const isSelected = isSameDate(date, pickupDate);
                const isToday = isSameDate(date, new Date());

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateItem,
                      isSelected && styles.dateItemSelected,
                    ]}
                    onPress={() => {
                      onPickupDateChange(date);
                      setShowPickupModal(false);
                    }}
                  >
                    <View style={styles.dateItemLeft}>
                      <Text
                        style={[
                          styles.dayName,
                          isSelected && styles.dayNameSelected,
                        ]}
                      >
                        {dayName}
                      </Text>
                      <Text
                        style={[
                          styles.dateDay,
                          isSelected && styles.dateDaySelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                    <View style={styles.dateItemRight}>
                      <Text
                        style={[
                          styles.dateMonthYear,
                          isSelected && styles.dateMonthYearSelected,
                        ]}
                      >
                        Tháng {month}, {year}
                      </Text>
                      {isToday && (
                        <View style={styles.todayBadge}>
                          <Text style={styles.todayText}>Hôm nay</Text>
                        </View>
                      )}
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Get current time to set minimum time for today
  const getMinTime = () => {
    const now = new Date();
    const isToday = pickupDate.toDateString() === now.toDateString();

    if (isToday) {
      // Round up to next 15-minute interval
      const currentMinutes = now.getMinutes();
      const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;

      if (roundedMinutes >= 60) {
        return { hour: now.getHours() + 1, minute: 0 };
      }
      return { hour: now.getHours(), minute: roundedMinutes };
    }

    return undefined;
  };

  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ngày nhận xe</Text>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowPickupModal(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dateTimeButtonText}>
            {pickupDate.toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Giờ nhận xe</Text>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowTimeModal(true)}
        >
          <Ionicons name="time-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dateTimeButtonText}>
            {formatTime(pickupTime.hour, pickupTime.minute)}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Số giờ thuê</Text>
        <TextInput
          style={styles.input}
          value={rentalHours}
          onChangeText={onChangeHours}
          keyboardType="numeric"
          placeholder="Nhập số giờ"
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>

      <View style={styles.quickSelectContainer}>
        {quickHours.map((hours) => (
          <TouchableOpacity
            key={hours}
            style={[
              styles.quickSelectButton,
              rentalHours === hours.toString() &&
                styles.quickSelectButtonActive,
            ]}
            onPress={() => onQuickSelect(hours)}
          >
            <Text
              style={[
                styles.quickSelectText,
                rentalHours === hours.toString() &&
                  styles.quickSelectTextActive,
              ]}
            >
              {hours}h
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Địa điểm nhận xe</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <Text style={styles.locationText}>{stationLocation}</Text>
        </View>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal />

      {/* Time Picker Modal */}
      <TimePicker
        visible={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        onSelect={onPickupTimeChange}
        selectedHour={pickupTime.hour}
        selectedMinute={pickupTime.minute}
        title="Chọn giờ nhận xe"
        minTime={getMinTime()}
      />
    </>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADII.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dateTimeButtonText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  quickSelectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  quickSelectButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  quickSelectButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  quickSelectText: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  quickSelectTextActive: {
    color: COLORS.white,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADII.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  locationText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
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
  dateList: {
    maxHeight: 400,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateItemSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  dateItemLeft: {
    alignItems: "center",
    marginRight: SPACING.md,
    minWidth: 60,
  },
  dayName: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
  },
  dayNameSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  dateDay: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  dateDaySelected: {
    color: COLORS.primary,
  },
  dateItemRight: {
    flex: 1,
  },
  dateMonthYear: {
    fontSize: FONTS.body,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  dateMonthYearSelected: {
    fontWeight: "600",
    color: COLORS.text,
  },
  todayBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  todayText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: "600",
  },
});
