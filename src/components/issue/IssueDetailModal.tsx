import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IssueModel } from '../../types/issue';
import { theme } from '../../utils/theme';
import { issueService } from '../../services/issueService';

interface IssueDetailModalProps {
  visible: boolean;
  onClose: () => void;
  issueId: string | null;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  visible,
  onClose,
  issueId,
}) => {
  const [issue, setIssue] = useState<IssueModel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && issueId) {
      loadIssueDetail();
    }
  }, [visible, issueId]);

  const loadIssueDetail = async () => {
    if (!issueId) return;

    try {
      setLoading(true);
      const data = await issueService.getCustomerIssueDetail(issueId);
      setIssue(data);
    } catch (error: any) {
      console.error('Error loading issue detail:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể tải thông tin vấn đề'
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '#FF6B6B';
      case 'IN_PROGRESS':
        return '#FFA726';
      case 'RESOLVED':
        return '#66BB6A';
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL':
        return '#D32F2F';
      case 'HIGH':
        return '#F57C00';
      case 'MEDIUM':
        return '#FBC02D';
      case 'LOW':
        return '#7CB342';
      default:
        return '#9E9E9E';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'alert-circle';
      case 'IN_PROGRESS':
        return 'time';
      case 'RESOLVED':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const getSatisfactionIcon = (satisfaction?: string) => {
    switch (satisfaction) {
      case 'SATISFIED':
        return 'happy';
      case 'NEUTRAL':
        return 'neutral';
      case 'UNSATISFIED':
        return 'sad';
      default:
        return 'help';
    }
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!issue) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chi tiết vấn đề</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status Banner */}
            <View
              style={[
                styles.statusBanner,
                { backgroundColor: getStatusColor(issue.status) + '20' },
              ]}
            >
              <Ionicons
                name={getStatusIcon(issue.status) as any}
                size={32}
                color={getStatusColor(issue.status)}
              />
              <View style={styles.statusInfo}>
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(issue.status) },
                  ]}
                >
                  {issue.status === 'OPEN' && 'Đang chờ xử lý'}
                  {issue.status === 'IN_PROGRESS' && 'Đang xử lý'}
                  {issue.status === 'RESOLVED' && 'Đã giải quyết'}
                </Text>
                {issue.priority && (
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(issue.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{issue.priority}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Issue Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin vấn đề</Text>

              <View style={styles.detailCard}>
                <Text style={styles.issueTitle}>{issue.title}</Text>

                {issue.description && (
                  <Text style={styles.issueDescription}>{issue.description}</Text>
                )}

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.detailLabel}>Thời gian báo cáo:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(issue.createdAt)}
                  </Text>
                </View>

                {issue.updatedAt !== issue.createdAt && (
                  <View style={styles.detailRow}>
                    <Ionicons name="refresh-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Cập nhật lần cuối:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(issue.updatedAt)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Resolution Info */}
            {issue.resolution && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Giải pháp xử lý</Text>

                <View style={styles.resolutionCard}>
                  {issue.resolution.solution_description && (
                    <View style={styles.resolutionSection}>
                      <Text style={styles.resolutionLabel}>Mô tả giải pháp:</Text>
                      <Text style={styles.resolutionText}>
                        {issue.resolution.solution_description}
                      </Text>
                    </View>
                  )}

                  {issue.resolution.resolution_actions &&
                    issue.resolution.resolution_actions.length > 0 && (
                      <View style={styles.resolutionSection}>
                        <Text style={styles.resolutionLabel}>
                          Các bước đã thực hiện:
                        </Text>
                        {issue.resolution.resolution_actions.map(
                          (action, index) => (
                            <View key={index} style={styles.actionItem}>
                              <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color={theme.colors.primary}
                              />
                              <Text style={styles.actionText}>{action}</Text>
                            </View>
                          )
                        )}
                      </View>
                    )}

                  {issue.resolution.resolution_notes && (
                    <View style={styles.resolutionSection}>
                      <Text style={styles.resolutionLabel}>Ghi chú:</Text>
                      <Text style={styles.resolutionText}>
                        {issue.resolution.resolution_notes}
                      </Text>
                    </View>
                  )}

                  {issue.resolution.resolved_at && (
                    <View style={styles.resolutionSection}>
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="checkmark-done-circle"
                          size={16}
                          color="#66BB6A"
                        />
                        <Text style={styles.detailLabel}>Giải quyết lúc:</Text>
                        <Text style={styles.detailValue}>
                          {formatDate(issue.resolution.resolved_at)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {issue.resolution.customer_satisfaction &&
                    issue.resolution.customer_satisfaction !== 'NOT_RATED' && (
                      <View style={styles.satisfactionBox}>
                        <Ionicons
                          name={
                            getSatisfactionIcon(
                              issue.resolution.customer_satisfaction
                            ) as any
                          }
                          size={24}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.satisfactionText}>
                          Đánh giá:{' '}
                          {issue.resolution.customer_satisfaction === 'SATISFIED' &&
                            'Hài lòng'}
                          {issue.resolution.customer_satisfaction === 'NEUTRAL' &&
                            'Bình thường'}
                          {issue.resolution.customer_satisfaction ===
                            'UNSATISFIED' && 'Không hài lòng'}
                        </Text>
                      </View>
                    )}
                </View>
              </View>
            )}

            {/* Contact Support */}
            <View style={styles.section}>
              <View style={styles.supportBox}>
                <Ionicons
                  name="headset-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.supportText}>
                  Cần hỗ trợ thêm? Liên hệ hotline: 1900-xxxx
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  loadingContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  resolutionCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#66BB6A',
  },
  resolutionSection: {
    marginBottom: 16,
  },
  resolutionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  resolutionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  satisfactionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  satisfactionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
  },
  supportText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default IssueDetailModal;
