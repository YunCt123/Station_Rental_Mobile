# 🚀 Quick Guide: Sandbox to Production

## Summary

Tóm tắt các thay đổi cần thiết khi chuyển từ sandbox sang production.

---

## 🔧 Thay đổi Backend

### 1. Cập nhật `.env`

```bash
# Change from:
VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=SANDBOX_CODE
VNPAY_HASH_SECRET=SANDBOX_SECRET
VNPAY_RETURN_URL=myapp://payment/result

# To:
VNPAY_PAY_URL=https://pay.vnpay.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=PRODUCTION_CODE
VNPAY_HASH_SECRET=PRODUCTION_SECRET
VNPAY_RETURN_URL=https://yourdomain.com/api/v1/payments/vnpay/callback
```

### 2. Backend callback endpoint (đã có sẵn)

✅ `src/routes/payment.route.js` - route đã có  
✅ `src/controllers/payment.controller.js` - controller đã có  
✅ `src/services/paymentservice.js` - logic đã có

**Không cần thay đổi code backend!**

---

## 📱 Thay đổi Frontend

### File: `src/screens/payment/VNPAYWebView.tsx`

#### XÓA những dòng này:

```typescript
// ❌ XÓA - SANDBOX MODE
const isSandboxUrl = (url: string) => {
  return url.includes("sandbox.vnpayment.vn");
};

// ❌ XÓA - Block này trong handleNavigationStateChange
if (isSandboxUrl(url) && url.includes("vpcpay.html")) {
  console.log("🔗 [VNPAYWebView] Opening sandbox URL in external browser");
  Linking.openURL(url).catch((err) =>
    console.error("Failed to open URL:", err)
  );
  return;
}
```

#### GIỮ LẠI những phần này:

```typescript
// ✅ GIỮ - Deeplink listener (cần cho production)
useEffect(() => {
  const handleDeepLink = (event: { url: string }) => {
    if (event.url.includes("myapp://payment")) {
      handlePaymentReturn(event.url);
    }
  };
  // ...
}, []);

// ✅ GIỮ - Payment result handler
const handlePaymentReturn = (url: string) => {
  const params = new URLSearchParams(url.split("?")[1] || "");
  const responseCode = params.get("vnp_ResponseCode");
  // ...
};

// ✅ GIỮ - Navigation handler (sau khi xóa sandbox block)
const handleNavigationStateChange = (navState: any) => {
  const url = navState.url;

  if (url.includes("vnp_ResponseCode")) {
    handlePaymentReturn(url);
  }
};
```

---

## 📋 App Config

### File: `app.json`

✅ **KHÔNG CẦN THAY ĐỔI** - Deeplink vẫn cần cho production

```json
{
  "expo": {
    "scheme": "myapp",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "myapp", "host": "payment" }]
        }
      ]
    }
  }
}
```

---

## 🔄 Production Flow

```
1. User thanh toán → Create booking
2. Backend tạo VNPay URL (production)
3. App mở WebView
4. WebView load https://pay.vnpay.vn (PRODUCTION - không mở browser)
5. User chọn bank + xác thực THẬT (OTP thật, không fake)
6. VNPay xử lý thanh toán THẬT
7. VNPay callback → https://yourdomain.com/api/v1/payments/vnpay/callback
8. Backend verify + update booking
9. Backend redirect → myapp://payment/result?vnp_ResponseCode=00
10. App nhận deeplink → Show success
```

---

## ✅ Checklist Migration

### Trước khi deploy:

- [ ] **Backend:**

  - [ ] Update `.env` với production credentials
  - [ ] Verify callback endpoint public
  - [ ] Test với ngrok: `ngrok http 3000`

- [ ] **Frontend:**

  - [ ] Xóa `isSandboxUrl()` function
  - [ ] Xóa block `Linking.openURL()` trong navigation handler
  - [ ] Keep deeplink listener
  - [ ] Keep payment result handler

- [ ] **Testing:**
  - [ ] Test với số tiền nhỏ (10,000 VND)
  - [ ] Test thanh toán thành công
  - [ ] Test hủy thanh toán
  - [ ] Test deeplink redirect

### Sau khi deploy:

- [ ] Monitor 10 giao dịch đầu tiên
- [ ] Check logs mỗi ngày
- [ ] Verify tất cả callback nhận được

---

## 🎯 Key Differences

| Feature         | Sandbox              | Production          |
| --------------- | -------------------- | ------------------- |
| **URL**         | sandbox.vnpayment.vn | pay.vnpay.vn        |
| **Credentials** | Test TMN/Secret      | Real TMN/Secret     |
| **OTP**         | Fake (any number)    | Real OTP from bank  |
| **Money**       | No real money        | Real money transfer |
| **Browser**     | Open external        | Stay in WebView     |
| **Return URL**  | Deeplink only        | HTTPS → Deeplink    |

---

## 🚨 Common Issues

### "Không thể tải trang"

→ Check payment URL, network connection

### "Deeplink không hoạt động"

→ Rebuild app: `expo prebuild --clean`

### "Booking không confirm"

→ Check backend callback endpoint, verify logs

### "WebView blank page"

→ Check WebView permissions, enable JavaScript

---

## 📞 Support

**VNPay:**

- Phone: 1900 5555 77
- Email: hotro@vnpay.vn

**Docs:**

- Full guide: `MIGRATION_TO_PRODUCTION.md`
- Setup guide: `VNPAY_DEEPLINK_SETUP.md`
- Env template: `.env.example`

---

**Status:** ✅ Ready - Code đã được comment rõ ràng, dễ dàng migrate!
