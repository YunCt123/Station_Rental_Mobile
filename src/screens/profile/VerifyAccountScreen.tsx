import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import StatusModal from '../../components/common/StatusModal';

interface DocumentType {
  id: 'id_card' | 'driver_license';
  title: string;
  description: string;
  icon: string;
  required: boolean;
}

interface UploadedDocument {
  type: 'id_card' | 'driver_license';
  frontImage: string | null;
  backImage: string | null;
}

const VerifyAccountScreen = () => {
  const navigation = useNavigation();
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([
    { type: 'id_card', frontImage: null, backImage: null },
    { type: 'driver_license', frontImage: null, backImage: null },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const documentTypes: DocumentType[] = [
    {
      id: 'id_card',
      title: 'CMND/CCCD',
      description: 'Chứng minh nhân dân hoặc Căn cước công dân',
      icon: 'card-outline',
      required: true,
    },
    {
      id: 'driver_license',
      title: 'Giấy phép lái xe',
      description: 'Bằng lái xe hạng A1, A2 hoặc B1, B2',
      icon: 'car-outline',
      required: true,
    },
  ];

  const handlePickImage = (docType: 'id_card' | 'driver_license', side: 'front' | 'back') => {
    Alert.alert(
      'Chọn ảnh',
      'Chọn nguồn ảnh',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chụp ảnh',
          onPress: () => handleImageSelected(docType, side, 'camera')
        },
        {
          text: 'Thư viện',
          onPress: () => handleImageSelected(docType, side, 'gallery')
        },
      ]
    );
  };

  const handleImageSelected = (
    docType: 'id_card' | 'driver_license',
    side: 'front' | 'back',
    source: 'camera' | 'gallery'
  ) => {
    // Simulated image selection
    const mockImageUrl = `https://via.placeholder.com/400x250/2979FF/FFFFFF?text=${docType}_${side}`;
    
    setUploadedDocs(prev => prev.map(doc => {
      if (doc.type === docType) {
        return {
          ...doc,
          [side === 'front' ? 'frontImage' : 'backImage']: mockImageUrl
        };
      }
      return doc;
    }));

    Alert.alert('Thành công', `Đã tải lên ảnh ${side === 'front' ? 'mặt trước' : 'mặt sau'}`);
  };

  const handleRemoveImage = (docType: 'id_card' | 'driver_license', side: 'front' | 'back') => {
    setUploadedDocs(prev => prev.map(doc => {
      if (doc.type === docType) {
        return {
          ...doc,
          [side === 'front' ? 'frontImage' : 'backImage']: null
        };
      }
      return doc;
    }));
  };

  const handleSubmit = () => {
    const idCard = uploadedDocs.find(d => d.type === 'id_card');
    const driverLicense = uploadedDocs.find(d => d.type === 'driver_license');

    if (!idCard?.frontImage || !idCard?.backImage) {
      setModalType('error');
      setModalTitle('Thiếu thông tin');
      setModalMessage('Vui lòng tải lên đầy đủ ảnh CMND/CCCD (mặt trước và mặt sau)');
      setModalVisible(true);
      return;
    }

    if (!driverLicense?.frontImage || !driverLicense?.backImage) {
      setModalType('error');
      setModalTitle('Thiếu thông tin');
      setModalMessage('Vui lòng tải lên đầy đủ ảnh Giấy phép lái xe (mặt trước và mặt sau)');
      setModalVisible(true);
      return;
    }

    Alert.alert(
      'Xác nhận gửi',
      'Bạn có chắc chắn muốn gửi tài liệu xác minh? Admin sẽ xem xét trong vòng 24-48 giờ.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: () => {
            setModalType('success');
            setModalTitle('Xác minh thành công!');
            setModalMessage('Đã gửi tài liệu xác minh. Vui lòng chờ admin phê duyệt trong vòng 24-48 giờ.');
            setModalVisible(true);
          }
        }
      ]
    );
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === 'success') {
      setTimeout(() => {
        navigation.goBack();
      }, 300);
    }
  };

  const getDocumentData = (type: 'id_card' | 'driver_license') => {
    return uploadedDocs.find(d => d.type === type);
  };

  const renderDocumentCard = (docType: DocumentType) => {
    const docData = getDocumentData(docType.id);

    return (
      <View key={docType.id} style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <Ionicons name={docType.icon as any} size={24} color={COLORS.primary} />
          </View>
          <View style={styles.documentTitleContainer}>
            <Text style={styles.documentTitle}>{docType.title}</Text>
            <Text style={styles.documentDescription}>{docType.description}</Text>
          </View>
          {docType.required && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Bắt buộc</Text>
            </View>
          )}
        </View>

        <View style={styles.uploadSection}>
          {/* Front Side */}
          <View style={styles.uploadItem}>
            <Text style={styles.uploadLabel}>Mặt trước</Text>
            {docData?.frontImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: docData.frontImage }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(docType.id, 'front')}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handlePickImage(docType.id, 'front')}
              >
                <Ionicons name="cloud-upload-outline" size={32} color={COLORS.textSecondary} />
                <Text style={styles.uploadButtonText}>Tải lên ảnh</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Back Side */}
          <View style={styles.uploadItem}>
            <Text style={styles.uploadLabel}>Mặt sau</Text>
            {docData?.backImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: docData.backImage }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(docType.id, 'back')}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handlePickImage(docType.id, 'back')}
              >
                <Ionicons name="cloud-upload-outline" size={32} color={COLORS.textSecondary} />
                <Text style={styles.uploadButtonText}>Tải lên ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
      colors={COLORS.gradient_4}
      style={styles.container}
    >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác minh tài khoản</Text>
          <View style={{ width: 40 }} />
        </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Tại sao cần xác minh?</Text>
            <Text style={styles.infoBannerText}>
              Xác minh tài khoản giúp bảo vệ an toàn cho bạn và cộng đồng. 
              Chỉ tài khoản đã xác minh mới có thể thuê xe.
            </Text>
          </View>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Hướng dẫn chụp ảnh</Text>
          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.guidelineText}>Chụp rõ ràng, không bị mờ hoặc che khuất</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.guidelineText}>Đảm bảo đủ ánh sáng, không bị tối</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.guidelineText}>Chụp toàn bộ giấy tờ, không bị cắt</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.guidelineText}>Giấy tờ phải còn hiệu lực</Text>
          </View>
        </View>

        {/* Document Upload Cards */}
        {documentTypes.map(renderDocumentCard)}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Gửi xác minh</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Status Modal */}
      <StatusModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        actionButtonText="OK"
        onActionPress={handleModalClose}
      />
       </LinearGradient>
      </SafeAreaView>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primary}15`,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoBannerContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  infoBannerTitle: {
    fontSize: FONTS.body,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  infoBannerText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    lineHeight: 20,
  },
  guidelinesCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  guidelinesTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  guidelineText: {
    flex: 1,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  documentCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.card,
    ...SHADOWS.sm,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentTitleContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  documentTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  documentDescription: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  requiredBadge: {
    backgroundColor: `${COLORS.error}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
  },
  requiredText: {
    fontSize: FONTS.caption,
    fontWeight: '600',
    color: COLORS.error,
  },
  uploadSection: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  uploadItem: {
    flex: 1,
  },
  uploadLabel: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  uploadButton: {
    height: 150,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: RADII.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  uploadButtonText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: RADII.md,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    paddingVertical: SPACING.xxl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.md,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.sm,
    marginTop: -SPACING.sm,
  },
  submitButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default VerifyAccountScreen;
