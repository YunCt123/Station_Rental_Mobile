import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { IssueModel } from "../../types/issue";
import { issueService } from "../../services/issueService";
import IssueCard from "../../components/issue/IssueCard";
import IssueDetailModal from "../../components/issue/IssueDetailModal";

type IssueStatus = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED";

const MyIssuesScreen = () => {
  const navigation = useNavigation();
  const [issues, setIssues] = useState<IssueModel[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<IssueModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>("ALL");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const statusFilters: { value: IssueStatus; label: string; icon: string }[] = [
    { value: "ALL", label: "Tất cả", icon: "list-outline" },
    { value: "OPEN", label: "Chờ xử lý", icon: "alert-circle-outline" },
    { value: "IN_PROGRESS", label: "Đang xử lý", icon: "time-outline" },
    {
      value: "RESOLVED",
      label: "Đã giải quyết",
      icon: "checkmark-circle-outline",
    },
  ];

  useFocusEffect(
    useCallback(() => {
      loadIssues();
    }, [])
  );

  useEffect(() => {
    filterIssues();
  }, [selectedStatus, issues]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await issueService.getUserIssues();
      setIssues(data);
    } catch (error: any) {
      console.error("Error loading issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIssues();
    setRefreshing(false);
  };

  const filterIssues = () => {
    if (selectedStatus === "ALL") {
      setFilteredIssues(issues);
    } else {
      setFilteredIssues(
        issues.filter((issue) => issue.status === selectedStatus)
      );
    }
  };

  const handleIssuePress = (issue: IssueModel) => {
    setSelectedIssueId(issue._id);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedIssueId(null);
  };

  const getStatusCount = (status: IssueStatus): number => {
    if (status === "ALL") return issues.length;
    return issues.filter((issue) => issue.status === status).length;
  };

  const renderStatusFilters = () => (
    <View style={styles.filtersContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={statusFilters}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => {
          const count = getStatusCount(item.value);
          const isSelected = selectedStatus === item.value;

          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedStatus(item.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={isSelected ? COLORS.white : COLORS.text}
              />
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextSelected,
                ]}
              >
                {item.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    isSelected && styles.filterBadgeSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      isSelected && styles.filterBadgeTextSelected,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.filtersContent}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color={COLORS.border} />
      <Text style={styles.emptyTitle}>Không có vấn đề nào</Text>
      <Text style={styles.emptyText}>
        {selectedStatus === "ALL"
          ? "Bạn chưa báo cáo vấn đề nào"
          : `Không có vấn đề ${statusFilters
              .find((f) => f.value === selectedStatus)
              ?.label.toLowerCase()}`}
      </Text>
    </View>
  );

  const renderIssueItem = ({ item }: { item: IssueModel }) => (
    <IssueCard issue={item} onPress={handleIssuePress} />
  );

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
          <Text style={styles.title}>Vấn đề về phương tiện</Text>
          <View style={styles.backButton} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredIssues}
              renderItem={renderIssueItem}
              keyExtractor={(item) => item._id}
              ListHeaderComponent={
                <>
                  {renderStatusFilters()}
                </>
              }
              ListEmptyComponent={renderEmptyState()}
              contentContainerStyle={[
                styles.listContent,
                filteredIssues.length === 0 && styles.listContentEmpty,
              ]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary}
                />
              }
            />
          )}
        </View>

        {/* Issue Detail Modal */}
        <IssueDetailModal
          visible={detailModalVisible}
          onClose={handleCloseDetailModal}
          issueId={selectedIssueId}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: FONTS.title,
    color: COLORS.white,
    fontWeight: "700",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.header,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  filtersContainer: {
    paddingVertical: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.pill,
    marginBottom: SPACING.sm,
    marginRight: SPACING.sm,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  filterChipTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },
  filterBadge: {
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADII.pill,
    marginLeft: SPACING.xs,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeSelected: {
    backgroundColor: COLORS.white + "30",
  },
  filterBadgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
  },
  filterBadgeTextSelected: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.header,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default MyIssuesScreen;
