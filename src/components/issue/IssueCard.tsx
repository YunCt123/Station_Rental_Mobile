import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IssueModel } from '../../types/issue';
import { COLORS } from '../../utils/theme';

interface IssueCardProps {
  issue: IssueModel;
  onPress: (issue: IssueModel) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onPress }) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'alert-circle-outline';
      case 'IN_PROGRESS':
        return 'time-outline';
      case 'RESOLVED':
        return 'checkmark-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Chờ xử lý';
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'RESOLVED':
        return 'Đã giải quyết';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(issue)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name={getStatusIcon(issue.status) as any}
            size={24}
            color={getStatusColor(issue.status)}
          />
          <Text style={styles.title} numberOfLines={2}>
            {issue.title}
          </Text>
        </View>
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

      {issue.description && (
        <Text style={styles.description} numberOfLines={2}>
          {issue.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(issue.status) + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(issue.status) }]}
            >
              {getStatusLabel(issue.status)}
            </Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateText}>{formatDate(issue.createdAt)}</Text>
        </View>
      </View>

      {issue.photos && issue.photos.length > 0 && (
        <View style={styles.photoIndicator}>
          <Ionicons name="image-outline" size={16} color="#666" />
          <Text style={styles.photoText}>{issue.photos.length} ảnh đính kèm</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  photoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  photoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default IssueCard;
