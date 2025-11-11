# Migration Guide: Sandbox → Production

## Tổng quan

Hướng dẫn chi tiết để migrate từ môi trường sandbox sang production cho VNPay payment integration.

---

## 📋 Checklist Migration

### 1. Backend Changes

#### 🔧 File: `.env` hoặc Environment Variables

**SANDBOX (Current):**

```bash
# VNPay Sandbox
VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=YOUR_SANDBOX_TMN_CODE
VNPAY_HASH_SECRET=YOUR_SANDBOX_HASH_SECRET
VNPAY_RETURN_URL=myapp://payment/result
```

**PRODUCTION (Update to):**

```bash
# VNPay Production
VNPAY_PAY_URL=https://pay.vnpay.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=YOUR_PRODUCTION_TMN_CODE
VNPAY_HASH_SECRET=YOUR_PRODUCTION_HASH_SECRET
VNPAY_RETURN_URL=https://yourdomain.com/api/v1/payments/vnpay/callback
```

**⚠️ Important:**

- Get production credentials from VNPay business portal
- Change return URL from deeplink (`myapp://`) to HTTPS URL
- Update `VNPAY_RETURN_URL_RENTAL` similarly

---

#### 🔧 File: `src/codetext/paymentservice.js`

**No changes needed** - The service already uses environment variables.

✅ Verify:

```javascript
const { VNPAY_PAY_URL, VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_RETURN_URL } =
  this.getVnpayConfig();
```

---

#### 🔧 Add Production Callback Endpoint

Create new endpoint for handling VNPay production callbacks:

**File: `src/routes/payment.route.js`**

```javascript
// Add this route
router.get("/vnpay/callback", paymentController.vnpayCallback);
```

**File: `src/controllers/payment.controller.js`**

```javascript
// This already exists, but ensure it redirects properly
export const vnpayCallback = catchAsync(async (req, res) => {
  const callbackData = { ...(req.query || {}), ...(req.body || {}) };

  const result = await paymentService.handleVnpayCallback(callbackData);

  // ✅ PRODUCTION: Redirect back to app with deeplink
  if (result.success && result.booking) {
    res.redirect(
      `myapp://payment/result?vnp_ResponseCode=00&bookingId=${result.booking._id}`
    );
  } else {
    res.redirect(
      `myapp://payment/result?vnp_ResponseCode=${result.responseCode || "99"}`
    );
  }
});
```

---

### 2. Frontend Changes

#### 🔧 File: `src/screens/payment/VNPAYWebView.tsx`

**REMOVE SANDBOX CODE:**

Find and **DELETE** this block:

```typescript
// ========================================
// 🔧 SANDBOX MODE: Open payment in external browser
// ========================================
// 📝 NOTE: REMOVE this block when moving to PRODUCTION
if (isSandboxUrl(url) && url.includes("vpcpay.html")) {
  console.log("🔗 [VNPAYWebView] Opening sandbox URL in external browser");
  Linking.openURL(url).catch((err) =>
    console.error("Failed to open URL:", err)
  );
  return;
}
// ========================================
```

**REMOVE SANDBOX HELPER:**

Find and **DELETE** this function:

```typescript
// ========================================
// 🔧 SANDBOX MODE: Check if URL is sandbox
// ========================================
// 📝 NOTE: Remove this check when moving to PRODUCTION
const isSandboxUrl = (url: string) => {
  return url.includes("sandbox.vnpayment.vn");
};
```

**KEEP PRODUCTION CODE:**

✅ Keep the deeplink listener - this is still needed:

```typescript
// ========================================
// ✅ PRODUCTION: Setup deeplink listener
// ========================================
useEffect(() => {
  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    if (url.includes("myapp://payment")) {
      handlePaymentReturn(url);
    }
  };

  const subscription = Linking.addEventListener("url", handleDeepLink);

  Linking.getInitialURL().then((url) => {
    if (url && url.includes("myapp://payment")) {
      handlePaymentReturn(url);
    }
  });

  return () => subscription.remove();
}, []);
```

✅ Keep payment result handler:

```typescript
// ========================================
// ✅ PRODUCTION: Handle payment result
// ========================================
const handlePaymentReturn = (url: string) => {
  const params = new URLSearchParams(url.split("?")[1] || "");
  const responseCode = params.get("vnp_ResponseCode");
  const transactionStatus = params.get("vnp_TransactionStatus");

  if (responseCode === "00" && transactionStatus === "00") {
    // Success
  } else {
    // Failed
  }
};
```

✅ Keep navigation handler (simplified):

```typescript
const handleNavigationStateChange = (navState: any) => {
  setCanGoBack(navState.canGoBack);
  setCanGoForward(navState.canGoForward);

  const url = navState.url;

  // Handle payment result
  if (url.includes("vnp_ResponseCode")) {
    handlePaymentReturn(url);
  }
};
```

---

### 3. App Configuration

#### 🔧 File: `app.json`

**KEEP AS IS** - Deeplink configuration is still needed:

```json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "com.yunct.station_rental_mobile"
    },
    "android": {
      "package": "com.yunct.station_rental_mobile",
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

---

## 🔄 Production Flow

### Flow Diagram

```
1. User clicks "Thanh toán"
   ↓
2. App creates booking + payment URL
   ↓
3. App opens VNPAYWebView
   ↓
4. WebView loads: https://pay.vnpay.vn/paymentv2/vpcpay.html?...
   ↓
5. User selects bank + authenticates (OTP, biometric, etc.)
   ↓
6. VNPay processes payment
   ↓
7. VNPay redirects to: https://yourdomain.com/api/v1/payments/vnpay/callback?vnp_ResponseCode=00&...
   ↓
8. Backend verifies signature + updates booking
   ↓
9. Backend redirects to: myapp://payment/result?vnp_ResponseCode=00&bookingId=xxx
   ↓
10. App receives deeplink
   ↓
11. App shows success modal
   ↓
12. App navigates to bookings list
```

---

## 🧪 Testing Production

### Pre-deployment Testing

1. **Test with small amount first:**

   ```
   Amount: 10,000 VND (minimum)
   ```

2. **Test all scenarios:**

   - ✅ Successful payment
   - ✅ Cancelled payment (user backs out)
   - ✅ Failed payment (insufficient funds)
   - ✅ Timeout (user takes too long)
   - ✅ Network error

3. **Verify webhook/callback:**

   ```bash
   # Check backend logs
   tail -f logs/payment.log

   # Should see:
   # ✅ [VNPAY Callback] Received: { vnp_ResponseCode: '00', ... }
   # ✅ [VNPAY Callback] Signature verified
   # ✅ [VNPAY Callback] Booking confirmed
   ```

4. **Test deeplink redirect:**
   ```bash
   # Test deeplink manually
   adb shell am start -W -a android.intent.action.VIEW -d "myapp://payment/result?vnp_ResponseCode=00&bookingId=test123"
   ```

---

## 🚨 Troubleshooting

### Issue: Payment succeeds but booking not confirmed

**Check:**

1. Backend callback endpoint is accessible from internet
2. VNPay has correct return URL configured
3. Signature verification passes
4. Booking status is updated

**Fix:**

```javascript
// Ensure callback endpoint is public
// Add CORS if needed
app.use(
  cors({
    origin: "*", // Or specify VNPay's domain
    methods: ["GET", "POST"],
  })
);
```

---

### Issue: Deeplink not opening app

**Check:**

1. App is in background/foreground
2. Deeplink scheme is registered (`myapp://`)
3. Intent filters are correct (Android)
4. Associated domains are configured (iOS)

**Fix:**

```bash
# Rebuild app after changing app.json
expo prebuild --clean
expo run:android
# or
expo run:ios
```

---

### Issue: WebView shows blank page

**Check:**

1. Payment URL is valid
2. Network connection
3. WebView permissions

**Fix:**

```typescript
// Add error handling in WebView
<WebView
  source={{ uri: paymentUrl }}
  onError={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    Alert.alert("Lỗi", "Không thể tải trang thanh toán");
  }}
/>
```

---

## 📊 Monitoring

### Key Metrics to Track

1. **Payment Success Rate:**

   ```
   Success Rate = (Successful Payments / Total Attempts) × 100%
   Target: > 95%
   ```

2. **Average Payment Time:**

   ```
   Avg Time = Total Time / Number of Payments
   Target: < 2 minutes
   ```

3. **Callback Reliability:**
   ```
   Callback Rate = (Callbacks Received / Payments Completed) × 100%
   Target: 100%
   ```

### Logging

Add comprehensive logging:

```javascript
// Backend
console.log("[Payment] Creating VNPay URL:", {
  bookingId,
  amount,
  returnUrl: VNPAY_RETURN_URL,
  timestamp: new Date().toISOString(),
});

console.log("[Payment] VNPay callback received:", {
  responseCode: params.vnp_ResponseCode,
  bookingId: params.bookingId,
  amount: params.vnp_Amount,
  secureHash: params.vnp_SecureHash?.substring(0, 10) + "...",
  timestamp: new Date().toISOString(),
});
```

```typescript
// Frontend
console.log("[VNPAYWebView] Opening payment URL:", {
  bookingId,
  amount,
  vehicleName,
  url: paymentUrl.substring(0, 50) + "...",
});

console.log("[VNPAYWebView] Payment result:", {
  responseCode,
  transactionStatus,
  bookingId,
  success: responseCode === "00",
});
```

---

## 🔐 Security Checklist

- [ ] Use HTTPS for all callbacks
- [ ] Verify `vnp_SecureHash` on every callback
- [ ] Validate `vnp_TmnCode` matches your code
- [ ] Check `vnp_Amount` matches booking amount
- [ ] Implement idempotency (prevent duplicate processing)
- [ ] Use secure TMN_CODE and HASH_SECRET
- [ ] Store credentials in environment variables (not in code)
- [ ] Enable CORS only for VNPay domain
- [ ] Log all payment attempts and results
- [ ] Implement rate limiting on callback endpoint

---

## 📝 Final Checklist

### Before Going Live:

- [ ] Update `.env` with production credentials
- [ ] Remove sandbox code from `VNPAYWebView.tsx`
- [ ] Test callback endpoint is publicly accessible
- [ ] Configure VNPay portal with production return URL
- [ ] Test with real bank account (small amount)
- [ ] Verify booking confirmation flow
- [ ] Test deeplink redirect
- [ ] Enable production logging
- [ ] Set up monitoring/alerts
- [ ] Document production credentials (securely)
- [ ] Create rollback plan
- [ ] Train support team on production flow

### After Going Live:

- [ ] Monitor first 10 transactions closely
- [ ] Check error logs daily for first week
- [ ] Verify all callbacks are received
- [ ] Gather user feedback
- [ ] Optimize based on metrics

---

## 🆘 Support

### VNPay Support

- Email: hotro@vnpay.vn
- Phone: 1900 5555 77
- Portal: https://merchant.vnpay.vn/

### Documentation

- [VNPay API Docs](https://sandbox.vnpayment.vn/apis/)
- [VNPay Integration Guide](https://sandbox.vnpayment.vn/docs/)

---

## 📚 Additional Resources

- `VNPAY_DEEPLINK_SETUP.md` - Deeplink configuration guide
- `.env.example` - Environment variables template
- `src/screens/payment/VNPAYWebView.tsx` - Payment WebView implementation
- `src/codetext/paymentservice.js` - Backend payment service

---

**Last Updated:** November 11, 2025
**Version:** 1.0
**Status:** Ready for Production Migration
