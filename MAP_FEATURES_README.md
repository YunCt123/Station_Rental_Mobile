# Map Features - Giao diện Bản đồ Trạm Thuê Xe

## 📦 Các file đã tạo

### 1. **Types & Models**
- `src/types/station.ts` - Type definitions cho Station model
  - Station interface
  - NearbyStationsParams
  - StationVehicle

### 2. **API Services**
- `src/api/stationApi.ts` - API calls cho stations
  - `getNearbyStations()` - Tìm trạm gần vị trí hiện tại
  - `getStationById()` - Lấy chi tiết 1 trạm
  - `getStationVehicles()` - Lấy danh sách xe tại trạm
  - `getStationsByCity()` - Lấy trạm theo thành phố
  - `listStations()` - Danh sách tất cả trạm

### 3. **Components**
- `src/components/map/StationMarkerCard.tsx` - Card hiển thị trong marker callout
  - Hiển thị thông tin trạm ngắn gọn
  - Rating stars
  - Số xe available/total
  - Amenities icons
  
### 4. **Screens**
- `src/screens/map/MapScreenWithMap.tsx` - Màn hình bản đồ với real map
  - Google Maps integration
  - User location
  - Station markers với màu theo trạng thái
  - Callout với thông tin trạm
  - My Location button
  - Legend (chú thích màu)
  
- `src/screens/details/StationDetailScreen.tsx` - Chi tiết trạm
  - Thông tin đầy đủ về trạm
  - Stats về xe (available, in use, total, utilization rate)
  - Amenities
  - Operating hours
  - Danh sách xe available
  - Buttons: Chỉ đường & Chọn xe thuê

## 🚀 Cách sử dụng

### 1. Cấu hình API URL

Mở `src/api/stationApi.ts` và thay đổi:
```typescript
const API_BASE_URL = 'http://YOUR_API_URL/api/v1'; 
```
Thành URL backend thực tế của bạn, ví dụ:
```typescript
const API_BASE_URL = 'http://localhost:3000/api/v1';
// hoặc
const API_BASE_URL = 'https://api.yourapp.com/api/v1';
```

### 2. Cấu hình Google Maps (cho Android)

Thêm Google Maps API key vào `android/app/src/main/AndroidManifest.xml`:
```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
</application>
```

### 3. Cấu hình Location Permissions

**iOS** - `ios/YourApp/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby stations</string>
```

**Android** - `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### 4. Thêm vào Navigation

Mở file navigation của bạn và thêm:
```typescript
import MapScreenWithMap from '../screens/map/MapScreenWithMap';
import { StationDetailScreen } from '../screens/details/StationDetailScreen';

// Trong Stack.Navigator
<Stack.Screen 
  name="MapView" 
  component={MapScreenWithMap}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="StationDetail" 
  component={StationDetailScreen}
  options={{ headerShown: false }}
/>
```

### 5. Navigate đến Map Screen

Từ bất kỳ screen nào:
```typescript
navigation.navigate('MapView');
```

## 📱 Features

### MapScreenWithMap
✅ Hiển thị bản đồ Google Maps  
✅ Tự động lấy vị trí người dùng  
✅ Hiển thị markers cho các trạm gần đó  
✅ Màu marker theo trạng thái:
  - 🟢 Xanh lá (primary): Còn nhiều xe (≥3)
  - 🟡 Vàng (warning): Sắp hết xe (<3)
  - 🔴 Đỏ (error): Hết xe (0)
  - ⚫ Xám (textSecondary): Trạm không hoạt động  
✅ Icon sét ⚡ cho trạm có sạc nhanh  
✅ Callout hiển thị thông tin trạm khi tap marker  
✅ Button "My Location" để về vị trí hiện tại  
✅ Legend hiển thị ý nghĩa màu sắc  
✅ Loading state  

### StationDetailScreen
✅ Ảnh trạm (nếu có)  
✅ Tên, địa chỉ, city  
✅ Rating với số lượng reviews  
✅ Status badge (Hoạt động/Bảo trì/Tạm ngưng)  
✅ Stats grid:
  - Xe sẵn sàng
  - Đang thuê
  - Tổng số xe
  - Tỷ lệ sử dụng (%)  
✅ Amenities với icons  
✅ Giờ hoạt động (Thứ 2-6, Cuối tuần, Ngày lễ)  
✅ Danh sách xe available với:
  - Ảnh xe
  - Model, brand
  - Battery level
  - Giá/giờ  
✅ Bottom actions:
  - Chỉ đường
  - Chọn xe thuê  

## 🎨 Marker Colors Logic

```typescript
const getMarkerColor = (station: Station) => {
  if (station.status !== "ACTIVE") return COLORS.textSecondary; // Không hoạt động = Xám
  if (station.metrics.vehicles_available === 0) return COLORS.error; // Hết xe = Đỏ
  if (station.metrics.vehicles_available < 3) return COLORS.warning; // Sắp hết = Vàng
  return COLORS.primary; // Còn nhiều = Xanh
};
```

## 🔧 Backend Endpoints Cần Có

Đảm bảo backend của bạn có các endpoints sau:

1. **GET `/api/v1/stations/nearby?lng=106.6297&lat=10.8231&radiusKm=10`**
   - Trả về danh sách trạm gần vị trí

2. **GET `/api/v1/stations/:id?includeVehicles=true`**
   - Trả về chi tiết trạm

3. **GET `/api/v1/stations/:id/vehicles?status=AVAILABLE`**
   - Trả về danh sách xe tại trạm

Xem file `station.controller.js` và `station.route.js` đã attach để biết cấu trúc response.

## 📦 Dependencies Đã Cài

```bash
npm install react-native-maps
npm install @react-native-community/geolocation  
npm install expo-location
npm install axios
```

## 🐛 Troubleshooting

### Map không hiển thị (Android)
- Kiểm tra Google Maps API key
- Enable "Maps SDK for Android" trên Google Cloud Console
- Rebuild app: `cd android && ./gradlew clean && cd .. && npx react-native run-android`

### "Location permission denied"
- Kiểm tra đã thêm permissions vào AndroidManifest.xml và Info.plist
- Uninstall và reinstall app

### API calls fail
- Kiểm tra API_BASE_URL đúng
- Kiểm tra backend đang chạy
- Check network logs: `adb logcat | grep -i "axios"`

## 🎯 Next Steps

1. ✅ Đã tạo: Map screen với markers
2. ✅ Đã tạo: Station detail screen
3. 🔄 Cần làm tiếp:
   - Thêm filter stations (theo amenities, fast charging, etc.)
   - Thêm directions (Google Maps/Apple Maps integration)
   - Thêm search box trên map
   - Thêm clustering cho nhiều markers
   - Cache stations data
   - Offline support

## 📝 Notes

- MapScreen hiện tại gọi API real, cần backend chạy
- Nếu chưa có backend, có thể dùng mock data tạm (comment API calls, dùng mock array)
- Default location: TP.HCM (10.8231, 106.6297)
- Radius mặc định: 10km

Chúc bạn code vui! 🚀
