import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../utils/theme';
import StatusModal from '../../components/common/StatusModal';
import { verificationService } from '../../services/verificationService';
import DocumentCard from '../../components/profile/verify/DocumentCard';
import GuidelinesCard from '../../components/profile/verify/GuidelinesCard';
import SubmitButton from '../../components/profile/verify/SubmitButton';
import LoadingState from '../../components/profile/verify/LoadingState';
import VerifyHeader from '../../components/profile/verify/VerifyHeader';
import VerificationStatusBanner from '../../components/profile/verify/VerificationStatusBanner';
import StatusInfoCard from '../../components/profile/verify/StatusInfoCard';

interface DocumentType {
  id: 'id_card' | 'driver_license' | 'selfie';
  title: string;
  description: string;
  icon: string;
  required: boolean;
}

interface UploadedDocument {
  type: 'id_card' | 'driver_license' | 'selfie';
  frontImage: string | null;
  backImage: string | null;
}

const VerifyAccountScreen = () => {
  const navigation = useNavigation();
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([
    { type: 'id_card', frontImage: null, backImage: null },
    { type: 'driver_license', frontImage: null, backImage: null },
    { type: 'selfie', frontImage: null, backImage: null },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>();
  const [rejectionReason, setRejectionReason] = useState<string>();
  const [hasUploadedDocuments, setHasUploadedDocuments] = useState(false);

  // Load existing documents on mount
  useEffect(() => {
    loadExistingDocuments();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {}

      const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus.status !== 'granted') {}
    } catch (error) {}
  };

  const loadExistingDocuments = async () => {
    try {
      setLoadingDocs(true);
      const verificationData = await verificationService.getVerificationStatus();
      
      if (verificationData.verificationStatus) {
        setVerificationStatus(verificationData.verificationStatus);
      }
      
      if (verificationData.rejectionReason) {
        setRejectionReason(verificationData.rejectionReason);
      }

      const hasDocuments = !!(
        verificationData.idCardFront || 
        verificationData.idCardBack || 
        verificationData.driverLicense ||
        verificationData.selfiePhoto
      );
      setHasUploadedDocuments(hasDocuments);

      setUploadedDocs([
        {
          type: 'id_card',
          frontImage: verificationData.idCardFront || null,
          backImage: verificationData.idCardBack || null,
        },
        {
          type: 'driver_license',
          frontImage: verificationData.driverLicense || null,
          backImage: null,
        },
        {
          type: 'selfie',
          frontImage: verificationData.selfiePhoto || null,
          backImage: null,
        },
      ]);
    } catch (error) {} finally {
      setLoadingDocs(false);
    }
  };

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
    {
      id: 'selfie',
      title: 'Ảnh chân dung',
      description: 'Ảnh cận mặt rõ nét để xác thực danh tính',
      icon: 'camera-outline',
      required: true,
    },
  ];

  const handlePickImage = (docType: 'id_card' | 'driver_license' | 'selfie', side: 'front' | 'back') => {
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

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleImageSelected = async (
    docType: 'id_card' | 'driver_license' | 'selfie',
    side: 'front' | 'back',
    source: 'camera' | 'gallery'
  ) => {
    try {
      setUploading(true);

      let result;
      
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const selectedImage = result.assets[0];
      
      if (!selectedImage?.uri) {
        throw new Error('Không thể lấy ảnh đã chọn');
      }

      // Convert ảnh sang base64 data URL
      const base64 = await convertImageToBase64(selectedImage.uri);

      // Lưu base64 vào state
      setUploadedDocs(prev => prev.map(doc => {
        if (doc.type === docType) {
          return {
            ...doc,
            [side === 'front' ? 'frontImage' : 'backImage']: base64
          };
        }
        return doc;
      }));

      Alert.alert('Thành công', `Đã chọn ảnh ${side === 'front' ? 'mặt trước' : 'mặt sau'}`);
      
    } catch (error: any) {Alert.alert('Lỗi', error.message || 'Không thể chọn hình ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (docType: 'id_card' | 'driver_license' | 'selfie', side: 'front' | 'back') => {
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

  const validateImages = () => {
    const idCard = uploadedDocs.find(d => d.type === 'id_card');
    const driverLicense = uploadedDocs.find(d => d.type === 'driver_license');
    const selfie = uploadedDocs.find(d => d.type === 'selfie');

    if (!idCard?.frontImage || !idCard?.backImage) {
      return { valid: false, message: 'Vui lòng tải lên đầy đủ ảnh CMND/CCCD (mặt trước và mặt sau)' };
    }

    if (!driverLicense?.frontImage) {
      return { valid: false, message: 'Vui lòng tải lên ảnh Giấy phép lái xe' };
    }

    if (!selfie?.frontImage) {
      return { valid: false, message: 'Vui lòng tải lên ảnh chân dung (selfie)' };
    }

    // Kiểm tra định dạng ảnh
    const allImages = [
      idCard.frontImage,
      idCard.backImage,
      driverLicense.frontImage,
      selfie.frontImage
    ];

    const hasInvalidFormat = allImages.some(
      url => !url || (!url.startsWith('data:image/') && !url.startsWith('http'))
    );

    if (hasInvalidFormat) {
      return { valid: false, message: 'Định dạng ảnh không hợp lệ. Vui lòng chọn lại.' };
    }

    return { 
      valid: true, 
      data: { idCard, driverLicense, selfie } 
    };
  };

  const submitVerificationImages = async (idCard: UploadedDocument, driverLicense: UploadedDocument, selfie: UploadedDocument) => {
    try {
      setUploading(true);

      const verificationData = {
        idCardFront: idCard.frontImage!,
        idCardBack: idCard.backImage!,
        driverLicense: driverLicense.frontImage!,
        selfiePhoto: selfie.frontImage!,
      };

      await verificationService.uploadVerificationImages(verificationData);

      // Update local state
      setHasUploadedDocuments(true);
      setVerificationStatus('PENDING');

      // Reload to get latest data from server
      await loadExistingDocuments();

      // Show success message
      setModalType('success');
      setModalTitle('Gửi thành công!');
      setModalMessage('Đã gửi tài liệu xác minh. Vui lòng chờ admin phê duyệt trong vòng 24-48 giờ.');
      setModalVisible(true);
    } catch (error: any) {setModalType('error');
      setModalTitle('Lỗi');
      setModalMessage(error.response?.data?.message || 'Không thể gửi tài liệu. Vui lòng thử lại.');
      setModalVisible(true);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const validation = validateImages();
    
    if (!validation.valid) {
      setModalType('error');
      setModalTitle('Thiếu thông tin');
      setModalMessage(validation.message!);
      setModalVisible(true);
      return;
    }

    const { idCard, driverLicense, selfie } = validation.data!;

    Alert.alert(
      'Xác nhận gửi',
      verificationStatus === 'REJECTED' 
        ? 'Bạn có chắc chắn muốn gửi lại tài liệu xác minh? Tài liệu cũ sẽ bị xóa và thay thế bằng tài liệu mới.'
        : 'Bạn có chắc chắn muốn gửi tài liệu xác minh? Admin sẽ xem xét trong vòng 24-48 giờ.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: () => submitVerificationImages(idCard, driverLicense, selfie)
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

  const getDocumentData = (type: 'id_card' | 'driver_license' | 'selfie') => {
    return uploadedDocs.find(d => d.type === type);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient colors={COLORS.gradient_4} style={styles.container}>
        <VerifyHeader onBack={() => navigation.goBack()} disabled={uploading} />

        {loadingDocs ? (
          <LoadingState />
        ) : (
          <>
            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <VerificationStatusBanner 
                status={verificationStatus} 
                rejectionReason={rejectionReason}
                hasUploadedDocuments={hasUploadedDocuments}
              />
              
              <GuidelinesCard />

              {documentTypes.map((docType) => {
                const docData = getDocumentData(docType.id);
                // CCCD có 2 mặt, Selfie chỉ có 1 ảnh
                const showBackSide = docType.id === 'id_card';
                
                return (
                  <DocumentCard
                    key={docType.id}
                    title={docType.title}
                    description={docType.description}
                    icon={docType.icon}
                    required={docType.required}
                    frontImage={docData?.frontImage || null}
                    backImage={showBackSide ? (docData?.backImage || null) : null}
                    uploading={uploading}
                    showBackSide={showBackSide}
                    onPickFront={() => handlePickImage(docType.id, 'front')}
                    onPickBack={() => handlePickImage(docType.id, 'back')}
                    onRemoveFront={() => handleRemoveImage(docType.id, 'front')}
                    onRemoveBack={() => handleRemoveImage(docType.id, 'back')}
                  />
                );
              })}

              <View style={{ height: 100 }} />
            </ScrollView>

            <SubmitButton 
              uploading={uploading} 
              onSubmit={handleSubmit}
              isUpdate={verificationStatus === 'APPROVED'}
              disabled={verificationStatus === 'PENDING'}
              hasUploadedDocuments={hasUploadedDocuments}
            />
          </>
        )}

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
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
});

export default VerifyAccountScreen;
