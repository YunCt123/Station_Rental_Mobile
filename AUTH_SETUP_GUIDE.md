# Authentication Setup Guide

## Overview
This guide explains how to configure and test the authentication system in the Station Rental Mobile app.

## ✅ Completed Integration

### 1. Authentication API Service (`src/api/authApi.ts`)
- **JWT Token Management**: Access token + Refresh token stored in AsyncStorage
- **Auto-refresh**: Automatically refreshes expired tokens on 401 responses
- **Interceptors**: Automatically adds Bearer token to all requests
- **Functions**:
  - `register()` - Create new account
  - `login()` - Authenticate user
  - `logout()` - Clear tokens and logout
  - `refreshToken()` - Get new access token
  - `getCurrentUser()` - Fetch user profile
  - `getStoredUser()`, `getAccessToken()`, `isAuthenticated()` - Helper methods

### 2. Login Screen (`src/screens/auth/LoginScreen.tsx`)
- ✅ Email/Phone input field
- ✅ Password input with show/hide toggle
- ✅ Loading state with ActivityIndicator
- ✅ Error handling with Alert messages
- ✅ Disabled inputs during loading
- ✅ Auto-navigation to Home on success

### 3. Register Screen (`src/screens/auth/RegisterScreen.tsx`)
- ✅ Full name, email, phone, password fields
- ✅ Password confirmation validation
- ✅ Terms & conditions checkbox
- ✅ Loading state with ActivityIndicator
- ✅ Validation: all fields required, passwords must match, terms must be agreed
- ✅ Error handling with detailed backend messages
- ✅ Auto-navigation to Home on success

### 4. Profile Screen (`src/screens/profile/ProfileScreen.tsx`)
- ✅ Logout button with confirmation dialog
- ✅ Loading state during logout
- ✅ Token clearing on logout
- ✅ Navigation reset to AuthLanding screen
- ✅ Error handling for logout failures

### 5. Station API Integration (`src/api/stationApi.ts`)
- ✅ Updated to use authenticated `apiClient` from authApi
- ✅ All requests automatically include Bearer token
- ✅ Auto-refresh on token expiry

## 🔧 Configuration Required

### Update Backend URL
**File**: `src/api/authApi.ts`
**Line**: ~7

```typescript
// Change this based on your backend setup:
const API_BASE_URL = 'http://localhost:3000/api/v1'; // Current value

// Options:
// 1. Local backend + iOS Simulator:
const API_BASE_URL = 'http://localhost:3000/api/v1';

// 2. Local backend + Android Emulator:
const API_BASE_URL = 'http://10.0.2.2:3000/api/v1';

// 3. Local backend + Physical device (replace with your computer's IP):
const API_BASE_URL = 'http://192.168.1.100:3000/api/v1';

// 4. Production backend:
const API_BASE_URL = 'https://your-backend.com/api/v1';
```

### Find Your Local IP Address
**Windows (PowerShell)**:
```powershell
ipconfig
# Look for "IPv4 Address" under your Wi-Fi or Ethernet adapter
```

**macOS/Linux**:
```bash
ifconfig | grep "inet "
# or
ip addr show
```

## 🧪 Testing Instructions

### Prerequisites
1. **Backend must be running**:
   ```bash
   cd path/to/EV-Station-based-Rental-System
   npm run dev
   ```

2. **Mobile app must be started**:
   ```bash
   cd d:\FPT\WDP301\station_rental_mobile
   npm start
   # Then press 'i' for iOS or 'a' for Android
   ```

### Test Flow

#### 1. Test Registration
1. Launch app → Should see AuthLanding screen
2. Tap "Đăng ký" (Register)
3. Fill in form:
   - Full name: "Test User"
   - Email: "test@example.com"
   - Phone: "0123456789"
   - Password: "Test123!"
   - Confirm password: "Test123!"
   - Check "Tôi đồng ý..." checkbox
4. Tap "Tạo tài khoản"
5. **Expected**: Loading indicator → Success → Navigate to Home screen
6. **Check**: Open React Native Debugger → AsyncStorage should have tokens:
   - `@station_rental:access_token`
   - `@station_rental:refresh_token`
   - `@station_rental:user`

#### 2. Test Logout
1. Navigate to Profile tab
2. Scroll to bottom → Tap "Đăng xuất"
3. Confirm in alert dialog
4. **Expected**: Loading → Navigate to AuthLanding
5. **Check**: AsyncStorage tokens should be cleared

#### 3. Test Login
1. At AuthLanding, tap "Đăng nhập" (Login)
2. Enter credentials:
   - Email/Phone: "test@example.com" or "0123456789"
   - Password: "Test123!"
3. Tap "Đăng nhập"
4. **Expected**: Loading → Success → Navigate to Home
5. **Check**: Tokens saved in AsyncStorage

#### 4. Test Station API (Requires Auth)
1. After logging in, navigate to Map screen
2. **Expected**: Should see stations list (if backend has data)
3. **Check Console**: Should see API request with `Authorization: Bearer <token>` header
4. Tap a station → Should navigate to StationDetailScreen
5. **Expected**: Station details and vehicles displayed

### Debugging Tools

#### View AsyncStorage
**React Native Debugger**:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check stored tokens
AsyncStorage.getAllKeys().then(keys => console.log('Keys:', keys));
AsyncStorage.getItem('@station_rental:access_token').then(token => console.log('Token:', token));
```

#### View API Requests
**In authApi.ts**, the interceptors already log requests:
```typescript
apiClient.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  // ...
});
```

Check your console/terminal for these logs.

#### Test Token Refresh
1. Login to app
2. Wait for access token to expire (default: 15 minutes)
3. Make any API call (e.g., navigate to Map)
4. **Expected**: App automatically refreshes token and retries request
5. **Check Console**: Should see "Token expired, refreshing..." message

## 🐛 Common Issues

### Issue: "Network Error"
**Cause**: Backend not running or wrong URL
**Solution**:
1. Check backend is running: `curl http://localhost:3000/health`
2. Verify API_BASE_URL matches your backend
3. For physical device, use local IP instead of localhost

### Issue: "Request failed with status 401"
**Cause**: Token expired or invalid
**Solution**:
1. Logout and login again
2. Check token is being sent: Console should show "Authorization: Bearer ..."
3. Verify backend validates tokens correctly

### Issue: "Cannot read property 'data' of undefined"
**Cause**: Backend response format doesn't match expected structure
**Solution**:
1. Check backend returns: `{ success: true, data: {...} }`
2. Update authApi/stationApi to match backend response format

### Issue: App crashes on register/login
**Cause**: Missing AsyncStorage package
**Solution**:
```bash
npm install @react-native-async-storage/async-storage
npx expo prebuild --clean
npm start
```

### Issue: "RNMapsAirModule not found"
**Cause**: Native map module not configured
**Solution**: Currently using MapScreen (UI placeholder) instead of MapScreenWithMap. This is expected and doesn't affect auth testing.

## 📝 Backend Endpoints Used

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user

### Stations (Require Auth)
- `GET /api/v1/stations/nearby?lng={lng}&lat={lat}&radiusKm={radius}` - Get nearby stations
- `GET /api/v1/stations/:id?includeVehicles={true|false}` - Get station details
- `GET /api/v1/stations/:id/vehicles?status={status}` - Get station vehicles
- `GET /api/v1/stations/city/:city` - Get stations by city
- `GET /api/v1/stations` - List all stations

## 🔐 Token Storage Structure

### AsyncStorage Keys
```typescript
'@station_rental:access_token'  // JWT access token (short-lived)
'@station_rental:refresh_token' // JWT refresh token (long-lived)
'@station_rental:user'          // User profile object (JSON string)
```

### User Object Structure
```typescript
{
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: 'customer' | 'staff' | 'admin';
  isVerified: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}
```

## ✅ Next Steps

1. **Update API_BASE_URL** in `src/api/authApi.ts` with your backend URL
2. **Start backend server** at the configured URL
3. **Test registration** with a new account
4. **Test login** with created account
5. **Test logout** to verify token clearing
6. **Test station APIs** to verify authenticated requests work
7. **Monitor console logs** to debug any issues

## 📞 Need Help?

If you encounter issues:
1. Check backend logs for errors
2. Check mobile app console for API request/response logs
3. Verify AsyncStorage has tokens after login
4. Test backend endpoints directly with Postman/curl
5. Ensure backend CORS settings allow your mobile app origin

---

**Authentication system is ready to use! Update the API_BASE_URL and start testing.** 🚀
