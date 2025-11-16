import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { TimePicker } from "./TimePicker";

interface DailyRentalInputProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  stationLocation: string;
  startTime: { hour: number; minute: number };
  endTime: { hour: number; minute: number };
  onStartTimeChange: (hour: number, minute: number) => void;
  onEndTimeChange: (hour: number, minute: number) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export const DailyRentalInput: React.FC<DailyRentalInputProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  stationLocation,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);

  // Generate dates for next 90 days
  const generateDates = (fromDate: Date, minDate?: Date) => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startFrom = minDate && minDate > today ? minDate : today;

    for (let i = 0; i < 90; i++) {
      const date = new Date(startFrom);
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

  const DatePickerModal = ({
    visible,
    onClose,
    onSelect,
    selectedDate,
    minDate,
    title,
  }: {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    selectedDate: Date;
    minDate?: Date;
    title: string;
  }) => {
    const dates = generateDates(new Date(), minDate);

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

            {/* Date List */}
            <ScrollView
              style={styles.dateList}
              showsVerticalScrollIndicator={false}
            >
              {dates.map((date, index) => {
                const { dayName, day, month, year } = formatDateDisplay(date);
                const isSelected = isSameDate(date, selectedDate);
                const isToday = isSameDate(date, new Date());

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateItem,
                      isSelected && styles.dateItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(date);
                      onClose();
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

  const getDayCount = () => {
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime.hour, startTime.minute, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endTime.hour, endTime.minute, 0, 0);

    const hours = Math.ceil(
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60)
    );
    const days = Math.ceil(hours / 24);
    return days > 0 ? days : 0;
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Get minimum time for start time picker
  const getMinStartTime = () => {
    const now = new Date();
    const isToday = startDate.toDateString() === now.toDateString();

    if (isToday) {
      const currentMinutes = now.getMinutes();
      const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;

      if (roundedMinutes >= 60) {
        return { hour: now.getHours() + 1, minute: 0 };
      }
      return { hour: now.getHours(), minute: roundedMinutes };
    }

    return undefined;
  };

  // Get minimum time for end time picker
  const getMinEndTime = () => {
    const isSameDay = startDate.toDateString() === endDate.toDateString();

    if (isSameDay) {
      // End time must be after start time on the same day
      return { hour: startTime.hour, minute: startTime.minute + 15 };
    }

    return undefined;
  };

  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ngày bắt đầu</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartModal(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dateButtonText}>
            {startDate.toLocaleDateString("vi-VN", {
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
        <Text style={styles.inputLabel}>Giờ bắt đầu</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartTimeModal(true)}
        >
          <Ionicons name="time-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dateButtonText}>
            {formatTime(startTime.hour, startTime.minute)}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ngày kết thúc</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndModal(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dateButtonText}>
            {endDate.toLocaleDateString("vi-VN", {
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
        <Text style={styles.inputLabel}>Giờ kết thúc</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndTimeModal(true)}
        >
          <Ionicons name="time-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dateButtonText}>
            {formatTime(endTime.hour, endTime.minute)}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Duration Info */}
      <View style={styles.durationInfo}>
        <Ionicons name="time-outline" size={16} color={COLORS.primary} />
        <Text style={styles.durationText}>
          Tổng thời gian thuê: {getDayCount()} ngày
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Địa điểm nhận xe</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <Text style={styles.locationText}>{stationLocation}</Text>
        </View>
      </View>

      {/* Modals */}
      <DatePickerModal
        visible={showStartModal}
        onClose={() => setShowStartModal(false)}
        onSelect={(date) => {
          onStartDateChange(date);
          if (date >= endDate) {
            const newEndDate = new Date(date);
            newEndDate.setDate(newEndDate.getDate() + 1);
            onEndDateChange(newEndDate);
          }
        }}
        selectedDate={startDate}
        title="Chọn ngày bắt đầu"
      />

      <DatePickerModal
        visible={showEndModal}
        onClose={() => setShowEndModal(false)}
        onSelect={onEndDateChange}
        selectedDate={endDate}
        minDate={startDate}
        title="Chọn ngày kết thúc"
      />

      {/* Time Pickers */}
      <TimePicker
        visible={showStartTimeModal}
        onClose={() => setShowStartTimeModal(false)}
        onSelect={onStartTimeChange}
        selectedHour={startTime.hour}
        selectedMinute={startTime.minute}
        title="Chọn giờ bắt đầu"
        minTime={getMinStartTime()}
      />

      <TimePicker
        visible={showEndTimeModal}
        onClose={() => setShowEndTimeModal(false)}
        onSelect={onEndTimeChange}
        selectedHour={endTime.hour}
        selectedMinute={endTime.minute}
        title="Chọn giờ kết thúc"
        minTime={getMinEndTime()}
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
  dateButton: {
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
  dateButtonText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "500",
  },
  durationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  durationText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: "600",
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
