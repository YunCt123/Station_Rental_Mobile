# 🔗 Hướng dẫn tích hợp PayOS

## ⚠️ Vấn đề hiện tại
Hiện tại app đang sử dụng **URL mock/demo** nên sẽ gặp lỗi **404 - Page not found**.

Để PayOS hoạt động thật, bạn cần:

## 📋 Các bước tích hợp PayOS thật

### 1️⃣ Đăng ký tài khoản PayOS
- Truy cập: https://payos.vn
- Đăng ký tài khoản doanh nghiệp
- Lấy thông tin:
  - `CLIENT_ID`
  - `API_KEY`
  - `CHECKSUM_KEY`

### 2️⃣ Tạo Backend API
Bạn cần tạo một API backend (Node.js/Express/NestJS) để:

```javascript
// Example: Node.js + Express
const PayOS = require('@payos/node');

const payos = new PayOS(CLIENT_ID, API_KEY, CHECKSUM_KEY);

app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, description, orderCode } = req.body;
    
    const paymentData = {
      orderCode: orderCode,
      amount: amount,
      description: description,
      returnUrl: 'myapp://payment-success',
      cancelUrl: 'myapp://payment-cancel',
    };
    
    const paymentLinkRes = await payos.createPaymentLink(paymentData);
    
    res.json({
      success: true,
      checkoutUrl: paymentLinkRes.checkoutUrl,
      paymentLinkId: paymentLinkRes.paymentLinkId,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 3️⃣ Cập nhật BookingPaymentScreen
Thay thế code mock bằng API call thật:

```typescript
// File: src/screens/booking/BookingPaymentScreen.tsx

const handlePayOSPayment = async () => {
  setIsProcessing(true);
  
  try {
    const paymentData = {
      amount: calculateTotal(),
      description: `Thuê xe ${vehicle.name} - ${rentalHours} giờ`,
      orderCode: `BOOK${Date.now()}`,
    };

    // 🔥 Gọi API backend của bạn (THAY ĐỔI URL)
    const response = await fetch('https://your-backend.com/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
      },
      body: JSON.stringify(paymentData),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Payment creation failed');
    }
    
    setIsProcessing(false);
    
    // Navigate to PayOS WebView with REAL checkout URL
    navigation.navigate('PayOSWebView', {
      paymentUrl: result.checkoutUrl, // 👈 Real PayOS URL
      bookingId: paymentData.orderCode,
      amount: paymentData.amount,
      vehicleName: vehicle.name,
    });
    
  } catch (error) {
    setIsProcessing(false);
    setModalType('error');
    setModalTitle('Thanh toán thất bại');
    setModalMessage('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
    setModalVisible(true);
  }
};
```

### 4️⃣ Cấu hình Deep Links (Optional)
Để xử lý callback từ PayOS về app:

**android/app/src/main/AndroidManifest.xml:**
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="myapp" />
</intent-filter>
```

**ios/YourApp/Info.plist:**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>
```

### 5️⃣ Xử lý Payment Webhook (Backend)
Tạo endpoint để nhận thông báo từ PayOS:

```javascript
app.post('/api/payos-webhook', async (req, res) => {
  try {
    const webhookData = payos.verifyPaymentWebhookData(req.body);
    
    if (webhookData.code === '00') {
      // Payment successful
      // Update booking status in database
      await updateBookingStatus(webhookData.orderCode, 'PAID');
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false });
  }
});
```

## 🧪 Test với PayOS Sandbox
PayOS cung cấp môi trường test:

1. Sử dụng **Sandbox credentials** từ PayOS dashboard
2. Test với các số thẻ test PayOS cung cấp
3. Kiểm tra luồng thanh toán đầy đủ

## 📚 Tài liệu tham khảo
- PayOS Documentation: https://payos.vn/docs
- PayOS Node.js SDK: https://github.com/payOSHQ/payos-lib-node
- Support: support@payos.vn

## ⚡ Giải pháp tạm thời (Demo)
Nếu chưa có backend, bạn có thể:

1. **Tắt WebView, dùng modal giả:**
```typescript
// Simulate success for demo
await new Promise(resolve => setTimeout(resolve, 2000));
setModalType('success');
setModalTitle('Thanh toán thành công!');
setModalMessage('Đã đặt xe thành công (Demo mode)');
setModalVisible(true);
```

2. **Sử dụng URL test tĩnh** (nếu PayOS cung cấp)

---

**Lưu ý:** WebView chỉ hoạt động khi có URL thanh toán thật từ PayOS API!
