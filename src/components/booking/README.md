# BookingCard Components

Đã tạo ra 3 phiên bản BookingCard với các thiết kế khác nhau để bạn có thể lựa chọn:

## 1. BookingCard (Thiết kế chính - Modern Card)

**Đặc điểm:**
- Layout dọc với hình ảnh lớn ở trên
- Status badge nổi bật trên hình ảnh
- Details grid với icon container đẹp mắt
- Footer với action button
- Shadow và border radius lớn

**Phù hợp cho:** Giao diện chính, cần hiển thị nhiều thông tin

## 2. BookingCardAlternative (Thiết kế thay thế - Overlay Style)

**Đặc điểm:**
- Header với status badge
- Hình ảnh với price tag overlay
- Details với icon lớn hơn
- Footer với background khác màu
- Arrow button nổi bật

**Phù hợp cho:** Giao diện premium, cần highlight giá cả

## 3. BookingCardMinimal (Thiết kế tối giản - Horizontal Layout)

**Đặc điểm:**
- Layout ngang với hình ảnh nhỏ
- Status dot thay vì badge
- Details compact
- Arrow đơn giản
- Tối giản và gọn gàng

**Phù hợp cho:** Danh sách dài, cần tiết kiệm không gian

## Cách sử dụng

### Sử dụng BookingCard chính (hiện tại):
```tsx
import BookingCard from './BookingCard';
// Đã được sử dụng trong BookingsScreen
```

### Thay đổi sang BookingCardAlternative:
```tsx
// Trong BookingsScreen.tsx
import BookingCardAlternative from '../components/booking/BookingCardAlternative';

// Thay thế BookingCard bằng BookingCardAlternative
<BookingCardAlternative 
  booking={booking} 
  onPress={handleBookingPress} 
/>
```

### Thay đổi sang BookingCardMinimal:
```tsx
// Trong BookingsScreen.tsx
import BookingCardMinimal from '../components/booking/BookingCardMinimal';

// Thay thế BookingCard bằng BookingCardMinimal
<BookingCardMinimal 
  booking={booking} 
  onPress={handleBookingPress} 
/>
```

## Tính năng chung

Tất cả 3 phiên bản đều có:
- ✅ Status indicator với màu sắc và icon phù hợp
- ✅ Thông tin xe đầy đủ
- ✅ Chi tiết booking (ngày, giờ, trạm)
- ✅ Giá cả nổi bật
- ✅ TouchableOpacity với activeOpacity
- ✅ Shadow và styling nhất quán
- ✅ Responsive layout

## So sánh

| Tính năng | BookingCard | BookingCardAlternative | BookingCardMinimal |
|-----------|-------------|------------------------|-------------------|
| Layout | Dọc | Dọc với overlay | Ngang |
| Hình ảnh | Lớn (160px) | Trung bình (140px) | Nhỏ (80px) |
| Status | Badge trên ảnh | Badge ở header | Dot trên ảnh |
| Price | Ở header | Overlay trên ảnh | Ở footer |
| Space | Nhiều | Trung bình | Ít |
| Style | Modern | Premium | Minimal |

Chọn phiên bản phù hợp với thiết kế tổng thể của app!
