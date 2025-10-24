import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../../utils/theme';
import StatusModal from '../../components/common/StatusModal';

interface RouteParams {
  paymentUrl: string;
  bookingId: string;
  amount: number;
  vehicleName: string;
}

const PayOSWebViewScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { paymentUrl, bookingId, amount, vehicleName } = route.params;
  
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    
    // Check if payment is successful or cancelled based on URL
    const url = navState.url;
    
    if (url.includes('payment-success') || url.includes('success') || url.includes('/success')) {
      setModalType('success');
      setModalTitle('Thanh toán thành công!');
      setModalMessage(`Đã đặt xe ${vehicleName} thành công. Vui lòng đến trạm để nhận xe.`);
      setModalVisible(true);
    } else if (url.includes('payment-cancel') || url.includes('cancel') || url.includes('/cancel')) {
      setModalType('error');
      setModalTitle('Thanh toán thất bại');
      setModalMessage('Bạn đã hủy thanh toán. Vui lòng thử lại.');
      setModalVisible(true);
    } else if (url.includes('payment-error') || url.includes('error') || url.includes('/error')) {
      setModalType('error');
      setModalTitle('Thanh toán thất bại');
      setModalMessage('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
      setModalVisible(true);
    }
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    
    setModalType('error');
    setModalTitle('Không thể tải trang');
    setModalMessage('URL thanh toán không hợp lệ hoặc không khả dụng. Vui lòng liên hệ bộ phận hỗ trợ để được trợ giúp.');
    setModalVisible(true);
  };

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      Alert.alert(
        'Hủy thanh toán',
        'Bạn có chắc chắn muốn hủy thanh toán?',
        [
          { text: 'Không', style: 'cancel' },
          { text: 'Có', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const handleForward = () => {
    if (canGoForward && webViewRef.current) {
      webViewRef.current.goForward();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Đóng thanh toán',
      'Bạn có chắc chắn muốn đóng trang thanh toán?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có', onPress: () => navigation.goBack() }
      ]
    );
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === 'success') {
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }, 300);
    } else {
      // For error, just close modal and stay on payment page
      // User can try to refresh or go back
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thanh toán PayOS</Text>
          <Text style={styles.headerSubtitle}>
            {amount.toLocaleString('vi-VN')}đ
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleClose}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Security Banner */}
      <View style={styles.securityBanner}>
        <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
        <Text style={styles.securityText}>Kết nối bảo mật với PayOS</Text>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleWebViewError}
        onHttpError={handleWebViewError}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, !canGoBack && styles.footerButtonDisabled]}
          onPress={handleBack}
          disabled={!canGoBack}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={canGoBack ? COLORS.text : COLORS.textTertiary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, !canGoForward && styles.footerButtonDisabled]}
          onPress={handleForward}
          disabled={!canGoForward}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={canGoForward ? COLORS.text : COLORS.textTertiary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.footerInfoText}>Mã: {bookingId}</Text>
        </View>
      </View>

      {/* Status Modal */}
      <StatusModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        actionButtonText={modalType === 'success' ? 'Xem đặt chỗ' : 'Đóng'}
        onActionPress={modalType === 'success' ? handleModalClose : () => {
          setModalVisible(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.success + '10',
    gap: SPACING.xs,
  },
  securityText: {
    fontSize: FONTS.caption,
    color: COLORS.success,
    fontWeight: '500',
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  footerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonDisabled: {
    opacity: 0.4,
  },
  footerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.xs,
  },
  footerInfoText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
});

export default PayOSWebViewScreen;
