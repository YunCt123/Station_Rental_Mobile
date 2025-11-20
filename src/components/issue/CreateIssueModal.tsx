import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import { issueService } from '../../services/issueService';

interface CreateIssueModalProps {
  visible: boolean;
  onClose: () => void;
  rentalId: string;
  onSuccess?: () => void;
}

const ISSUE_TEMPLATES = [
  { id: '1', title: 'Xe bị hỏng', icon: 'construct-outline' as const },
  { id: '2', title: 'Pin yếu', icon: 'battery-dead-outline' as const },
  { id: '3', title: 'Tai nạn', icon: 'warning-outline' as const },
  { id: '4', title: 'Vấn đề về phanh', icon: 'hand-left-outline' as const },
  { id: '5', title: 'Đèn không hoạt động', icon: 'bulb-outline' as const },
  { id: '6', title: 'Khác', icon: 'ellipsis-horizontal-outline' as const },
];

const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  visible,
  onClose,
  rentalId,
  onSuccess,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = ISSUE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setTitle(template.title);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề vấn đề');
      return;
    }

    try {
      setIsSubmitting(true);
      await issueService.createRentalIssue(rentalId, {
        title: title.trim(),
        description: description.trim() || undefined,
        photos: [],
      });

      Alert.alert('Thành công', 'Báo cáo vấn đề thành công!', [
        {
          text: 'OK',
          onPress: () => {
            handleClose();
            onSuccess?.();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error creating issue:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể tạo báo cáo. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Báo cáo vấn đề</Text>
            <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
              <Ionicons name="close" size={28} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Template Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chọn loại vấn đề</Text>
              <View style={styles.templateGrid}>
                {ISSUE_TEMPLATES.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateCard,
                      selectedTemplate === template.id &&
                        styles.templateCardSelected,
                    ]}
                    onPress={() => handleTemplateSelect(template.id)}
                    disabled={isSubmitting}
                  >
                    <Ionicons
                      name={template.icon}
                      size={32}
                      color={
                        selectedTemplate === template.id
                          ? theme.colors.primary
                          : '#666'
                      }
                    />
                    <Text
                      style={[
                        styles.templateText,
                        selectedTemplate === template.id &&
                          styles.templateTextSelected,
                      ]}
                    >
                      {template.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title Input */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Tiêu đề <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Mô tả ngắn gọn vấn đề"
                maxLength={100}
                editable={!isSubmitting}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            {/* Description Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Mô tả chi tiết (tùy chọn)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={500}
                editable={!isSubmitting}
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>

            {/* Info Note */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
              <Text style={styles.infoText}>
                Đội ngũ hỗ trợ sẽ liên hệ với bạn trong thời gian sớm nhất để giải
                quyết vấn đề.
              </Text>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!title.trim() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
              </>
            )}
          </TouchableOpacity>
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
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  templateCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    margin: 6,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
  },
  templateText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  templateTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  required: {
    color: '#FF6B6B',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 12,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CreateIssueModal;
