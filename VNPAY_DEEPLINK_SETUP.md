# VNPay Sandbox Deeplink Integration Guide

## Tổng quan

Hướng dẫn này giúp bạn tích hợp VNPay sandbox với deeplink để test thanh toán mà không cần thanh toán thực tế.

## 1. Setup Deeplink Schema

### app.json / app.config.js

```json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "com.yourcompany.stationrental",
      "associatedDomains": ["applinks:myapp.page.link"]
    },
    "android": {
      "package": "com.yourcompany.stationrental",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "myapp",
              "host": "payment"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

## 2. VNPay Return URL Format

### Sandbox Environment

Khi dùng sandbox, return URL phải là deeplink:

```
myapp://payment/result?bookingId=<BOOKING_ID>
```

### Production Environment

Khi production, dùng HTTPS URL:

```
https://yourdomain.com/api/v1/payments/vnpay/callback
```

## 3. Backend Configuration

### Environment Variables (.env)

```bash
# VNPay Sandbox
VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=YOUR_SANDBOX_TMN_CODE
VNPAY_HASH_SECRET=YOUR_SANDBOX_HASH_SECRET

# Return URL cho mobile app (deeplink)
VNPAY_RETURN_URL=myapp://payment/result

# Return URL cho web/production (HTTPS)
# VNPAY_RETURN_URL=https://yourdomain.com/api/v1/payments/vnpay/callback
```

### Update Payment Service

File: `src/codetext/paymentservice.js`

```javascript
async buildCheckoutUrl({ amount, orderInfo, txnRef, ipAddr = null, bookingId = null }) {
  const {
    VNPAY_PAY_URL,
    VNPAY_TMN_CODE,
    VNPAY_HASH_SECRET,
    VNPAY_RETURN_URL,
  } = this.getVnpayConfig();

  // 🆕 Tạo return URL với bookingId để app có thể track
  const returnUrl = bookingId
    ? `${VNPAY_RETURN_URL}?bookingId=${bookingId}`
    : VNPAY_RETURN_URL;

  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Amount: amount,
    vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
    vnp_CurrCode: "VND",
    vnp_IpAddr: ipAddr || "192.168.1.1",
    vnp_Locale: "vn",
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_ReturnUrl: returnUrl, // ✅ Sử dụng deeplink cho sandbox
    vnp_TxnRef: txnRef,
  };

  // ... rest of the code
}
```

## 4. Frontend Implementation

### VNPAYWebView.tsx Changes

```typescript
import { Linking } from "react-native";

const VNPAYWebView = () => {
  // ... existing code ...

  // 🆕 Setup deeplink listener
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log("📱 Deeplink received:", url);

      if (url.includes("myapp://payment")) {
        handlePaymentReturn(url);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("myapp://payment")) {
        handlePaymentReturn(url);
      }
    });

    return () => subscription.remove();
  }, []);

  // 🆕 Parse payment result from return URL
  const handlePaymentReturn = (url: string) => {
    const params = new URLSearchParams(url.split("?")[1] || "");
    const responseCode = params.get("vnp_ResponseCode");
    const transactionStatus = params.get("vnp_TransactionStatus");

    if (responseCode === "00" && transactionStatus === "00") {
      // Success
      showSuccessModal();
    } else {
      // Failed
      showErrorModal();
    }
  };

  // 🆕 Detect sandbox URL and open in browser
  const handleNavigationStateChange = (navState: any) => {
    const url = navState.url;

    // For sandbox, open payment page in external browser
    if (url.includes("sandbox.vnpayment.vn") && url.includes("vpcpay.html")) {
      Linking.openURL(url);
      return;
    }

    // ... existing navigation logic ...
  };
};
```

## 5. Test Flow trong Sandbox

### Bước 1: User chọn xe và thanh toán

```
User -> App -> Create Booking -> Get Payment URL
```

### Bước 2: Mở WebView

```
App -> VNPAYWebView -> Load sandbox URL
```

### Bước 3: Chuyển sang Browser

```
WebView detect sandbox URL -> Open in external browser
```

### Bước 4: Nhập OTP fake

```
Browser -> VNPay Sandbox Page -> User select bank -> Enter OTP
```

Thông tin test:

- Chọn bất kỳ ngân hàng nào
- Nhập mã OTP fake (bất kỳ số nào)

### Bước 5: VNPay redirect về app

```
VNPay -> Deeplink: myapp://payment/result?vnp_ResponseCode=00&vnp_TransactionStatus=00&...
```

### Bước 6: App xử lý kết quả

```
App -> Parse deeplink -> Show success/error modal -> Navigate to bookings
```

## 6. VNPay Response Codes

| Code | Meaning                                    | Action                        |
| ---- | ------------------------------------------ | ----------------------------- |
| 00   | Success                                    | Show success, confirm booking |
| 07   | Trừ tiền thành công, giao dịch bị nghi ngờ | Contact support               |
| 09   | Thẻ chưa đăng ký InternetBanking           | Ask user to register          |
| 10   | Xác thực thông tin thẻ không đúng (>3 lần) | Block and notify              |
| 11   | Đã hết hạn chờ thanh toán                  | Show timeout error            |
| 12   | Thẻ bị khóa                                | Ask user to contact bank      |
| 13   | OTP không đúng                             | Show error, allow retry       |
| 24   | User hủy giao dịch                         | Show cancel message           |
| 51   | Tài khoản không đủ số dư                   | Show insufficient funds       |
| 65   | Tài khoản vượt quá hạn mức                 | Show limit exceeded           |
| 75   | Ngân hàng bảo trì                          | Show maintenance message      |
| 79   | KH nhập sai mật khẩu quá số lần quy định   | Show locked message           |

## 7. Security Notes

### Hash Verification

Backend phải verify `vnp_SecureHash` để đảm bảo request từ VNPay:

```javascript
const handleVnpayCallback = async (params) => {
  const secureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  // Sort and create query string
  const sortedParams = sortObject(params);
  const signData = querystring.stringify(sortedParams);

  // Calculate hash
  const hmac = crypto.createHmac("sha512", VNPAY_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // Verify
  if (secureHash !== signed) {
    throw new Error("Invalid signature");
  }

  // Process payment...
};
```

## 8. Troubleshooting

### Issue: Deeplink không hoạt động

**Solution:**

1. Rebuild app sau khi thay đổi `app.json`
2. Test deeplink: `npx uri-scheme open myapp://payment/result --android`
3. Check logcat: `adb logcat | grep -i intent`

### Issue: WebView không redirect

**Solution:**

1. Enable JavaScript trong WebView
2. Add `domStorageEnabled={true}`
3. Add `sharedCookiesEnabled={true}`

### Issue: Sandbox không mở được

**Solution:**

1. Check URL có đúng: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
2. Check TMN_CODE và HASH_SECRET
3. Check return URL format

### Issue: Hash verification failed

**Solution:**

1. Check VNPAY_HASH_SECRET
2. Ensure params are sorted correctly
3. Remove `vnp_SecureHash` before calculating

## 9. Complete Example

### Create Payment Request

```typescript
const handleVNPAYPayment = async () => {
  try {
    const response = await paymentService.createVNPAYDeposit(
      bookingId,
      depositAmount
    );

    // Navigate to WebView
    navigation.navigate("VNPAYWebView", {
      paymentUrl: response.checkoutUrl,
      bookingId: bookingId,
      amount: depositAmount,
      vehicleName: vehicle.name,
    });
  } catch (error) {
    showErrorModal();
  }
};
```

### Handle Payment Result

```typescript
// In VNPAYWebView
const handlePaymentReturn = (url: string) => {
  const params = new URLSearchParams(url.split("?")[1] || "");

  const paymentInfo = {
    responseCode: params.get("vnp_ResponseCode"),
    transactionStatus: params.get("vnp_TransactionStatus"),
    amount: params.get("vnp_Amount"),
    bookingId: params.get("bookingId"),
    transactionNo: params.get("vnp_TransactionNo"),
    secureHash: params.get("vnp_SecureHash"),
  };

  // Verify and process
  if (paymentInfo.responseCode === "00") {
    confirmBooking(paymentInfo);
  } else {
    handlePaymentError(paymentInfo.responseCode);
  }
};
```

## 10. Testing Checklist

- [ ] Deeplink registered in app.json
- [ ] Return URL configured in .env
- [ ] WebView opens sandbox URL
- [ ] External browser launches
- [ ] Can select bank and enter OTP
- [ ] App receives deeplink callback
- [ ] Payment result parsed correctly
- [ ] Success modal shows
- [ ] Booking confirmed
- [ ] Navigate to bookings list

## 11. Migration to Production

Khi chuyển sang production:

1. Update `.env`:

```bash
VNPAY_PAY_URL=https://pay.vnpay.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=<PRODUCTION_TMN_CODE>
VNPAY_HASH_SECRET=<PRODUCTION_HASH_SECRET>
VNPAY_RETURN_URL=https://yourdomain.com/api/v1/payments/vnpay/callback
```

2. Implement web callback endpoint:

```javascript
app.get("/api/v1/payments/vnpay/callback", async (req, res) => {
  const result = await paymentService.handleVnpayCallback(req.query);

  // Redirect to app
  if (result.success) {
    res.redirect(`myapp://payment/success?bookingId=${result.bookingId}`);
  } else {
    res.redirect(`myapp://payment/error?code=${result.code}`);
  }
});
```

3. Update return URL to use HTTPS instead of deeplink

## Resources

- [VNPay Sandbox Documentation](https://sandbox.vnpayment.vn/apis/)
- [React Native Linking](https://reactnative.dev/docs/linking)
- [Expo Linking](https://docs.expo.dev/guides/linking/)
