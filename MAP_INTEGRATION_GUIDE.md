# Hướng dẫn hiển thị bản đồ thật

## Vấn đề hiện tại

Hiện tại màn hình `MapScreen.tsx` chỉ hiển thị **placeholder** (icon bản đồ và text) thay vì bản đồ thật với react-native-maps. Đây là thiết kế tạm thời.

## Giải pháp

Bạn có 2 lựa chọn:

### Option 1: Sử dụng MapScreenWithMap (Đã có sẵn)

File `src/screens/map/MapScreenWithMap.tsx` đã được tạo và sử dụng thư viện `react-native-maps` để hiển thị bản đồ thật.

**Cách chuyển đổi:**

1. Mở file `src/navigation/BottomTabNavigator.tsx`
2. Tìm import của MapScreen:
   ```typescript
   import MapScreen from '../screens/map/MapScreen';
   ```
3. Thay đổi thành:
   ```typescript
   import MapScreen from '../screens/map/MapScreenWithMap';
   ```

**Hoặc đổi tên file:**
```bash
# Backup file cũ
mv src/screens/map/MapScreen.tsx src/screens/map/MapScreenPlaceholder.tsx

# Đổi tên MapScreenWithMap thành MapScreen
mv src/screens/map/MapScreenWithMap.tsx src/screens/map/MapScreen.tsx
```

### Option 2: Tích hợp maps vào MapScreen hiện tại

Thêm react-native-maps vào MapScreen.tsx:

#### 1. Import thêm MapView:
```typescript
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
```

#### 2. Thay thế phần Map Placeholder:
Tìm đoạn code:
```typescript
{/* Map Placeholder */}
<View style={styles.mapContainer}>
  <View style={styles.mapPlaceholder}>
    ...
  </View>
</View>
```

Thay bằng:
```typescript
{/* Real Map */}
<View style={styles.mapContainer}>
  {loading ? (
    <View style={styles.mapPlaceholder}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.mapPlaceholderText}>Đang tải bản đồ...</Text>
    </View>
  ) : (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: userLocation?.latitude || 21.0285,
        longitude: userLocation?.longitude || 105.8542,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      {nearbyStations.map((station) => (
        <Marker
          key={station._id}
          coordinate={{
            latitude: station.geo.coordinates[1],
            longitude: station.geo.coordinates[0],
          }}
          title={station.name}
          description={`${station.metrics.vehicles_available}/${station.metrics.vehicles_total} xe sẵn`}
          onPress={() => setSelectedStation(station)}
        />
      ))}
    </MapView>
  )}
  
  {/* Map Controls */}
  <View style={styles.mapControls}>
    <TouchableOpacity 
      style={styles.mapControlButton}
      onPress={handleRefresh}
    >
      <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.mapControlButton}>
      <Ionicons name="layers-outline" size={20} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
</View>
```

#### 3. Thêm style cho map:
```typescript
map: {
  width: '100%',
  height: '100%',
  borderRadius: RADII.card,
},
```

## Kiểm tra thư viện đã cài chưa

Chạy lệnh sau để xem react-native-maps đã được cài:
```bash
npm list react-native-maps
```

Nếu chưa có, cài đặt:
```bash
npx expo install react-native-maps
```

## Lưu ý

- `MapScreenWithMap.tsx` đã tích hợp đầy đủ chức năng bản đồ với markers
- Coordinate format: `[longitude, latitude]` trong database → cần đảo thành `{latitude, longitude}` cho MapView
- File hiện tại (MapScreen.tsx) dùng placeholder để không bị crash khi chưa cài react-native-maps

## Tại sao có 2 file?

- **MapScreen.tsx**: Fallback khi không có maps library (hiển thị danh sách)
- **MapScreenWithMap.tsx**: Full featured với bản đồ thật

Thiết kế này giúp app vẫn hoạt động ngay cả khi:
- Chưa cài thư viện maps
- Device không support Google Maps
- Đang phát triển trên simulator/emulator không có maps
