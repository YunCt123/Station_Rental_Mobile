export interface VehicleData {
  id: string;
  name: string;
  brand: string;
  year: number;
  type: string;
  rating: number;
  reviewCount: number;
  batteryLevel: number;
  range: number;
  seats: number;
  location: string;
  hourlyRate: number;
  dailyRate: number;
  status: 'Available' | 'Maintenance Due';
  condition: 'Excellent' | 'Good';
  image: string;
  images?: string[];
  features?: string[];
  specs?: Record<string, string>;
  description?: string;
}

const mockVehicles: VehicleData[] = [
  {
    id: '1',
    name: 'Tesla Model 3',
    brand: 'Tesla',
    year: 2025,
    type: 'Electric Sedan',
    rating: 4.9,
    reviewCount: 1240,
    batteryLevel: 92,
    range: 480,
    seats: 5,
    location: 'Trạm Vincom Royal City',
    hourlyRate: 180000,
    dailyRate: 1200000,
    status: 'Available',
    condition: 'Excellent',
    image: 'https://giaxeoto.vn/admin/upload/images/resize/640-tesla-model-3-2024-co-gi-moi.jpg',
    images: [
      'https://via.placeholder.com/400x250?text=Tesla+Front',
      'https://via.placeholder.com/400x250?text=Tesla+Interior'
    ],
    features: ['Tự lái', 'Sạc nhanh', 'Màn hình cảm ứng 15 inch'],
    specs: { công_suất: '283 HP', pin: '82 kWh', tăng_tốc: '0-100 km/h 4.4s' },
    description: 'Mẫu xe điện phổ biến với hiệu suất cao và công nghệ tiên tiến.'
  },
  {
    id: '2',
    name: 'VinFast VF8',
    brand: 'VinFast',
    year: 2024,
    type: 'Electric SUV',
    rating: 4.7,
    reviewCount: 890,
    batteryLevel: 80,
    range: 420,
    seats: 5,
    location: 'Trạm Times City',
    hourlyRate: 150000,
    dailyRate: 1000000,
    status: 'Available',
    condition: 'Good',
    image: 'https://hips.hearstapps.com/hmg-prod/images/2023-vinfast-vf8-9283-64638ba8c149b.jpg?crop=0.641xw:0.543xh;0.114xw,0.346xh&resize=2048:*',
    images: [
      'https://via.placeholder.com/400x250?text=VF8+Front',
      'https://via.placeholder.com/400x250?text=VF8+Dashboard'
    ],
    features: ['Thiết kế Việt', 'Hỗ trợ giọng nói', 'Khoang rộng rãi'],
    specs: { công_suất: '348 HP', pin: '87.7 kWh', tăng_tốc: '0-100 km/h 5.5s' },
    description: 'Xe điện Việt Nam với phong cách hiện đại và thân thiện môi trường.'
  },
  {
    id: '3',
    name: 'BMW iX3',
    brand: 'BMW',
    year: 2024,
    type: 'Luxury Electric SUV',
    rating: 4.8,
    reviewCount: 1120,
    batteryLevel: 95,
    range: 460,
    seats: 5,
    location: 'Trạm Lotte Center',
    hourlyRate: 190000,
    dailyRate: 1250000,
    status: 'Maintenance Due',
    condition: 'Good',
    image: 'https://hips.hearstapps.com/hmg-prod/images/2026-bmw-ix3-108-68ae1496623a1.jpg?crop=0.702xw:0.592xh;0.117xw,0.293xh&resize=1200:*',
    images: [
      'https://via.placeholder.com/400x250?text=iX3+Front',
      'https://via.placeholder.com/400x250?text=iX3+Back'
    ],
    features: ['Sang trọng', 'Hệ thống treo linh hoạt', 'Công nghệ an toàn'],
    specs: { công_suất: '282 HP', pin: '80 kWh', tăng_tốc: '0-100 km/h 6.8s' },
    description: 'SUV điện cao cấp với phong cách sang trọng và trải nghiệm lái êm ái.'
  },
  {
    id: '4',
    name: 'Hyundai Ioniq 5',
    brand: 'Hyundai',
    year: 2024,
    type: 'Electric Crossover',
    rating: 4.6,
    reviewCount: 760,
    batteryLevel: 88,
    range: 450,
    seats: 5,
    location: 'Trạm Aeon Mall Hà Đông',
    hourlyRate: 160000,
    dailyRate: 1050000,
    status: 'Available',
    condition: 'Excellent',
    image: 'https://hyundaiphamvandong3s.vn/wp-content/uploads/hyundai-ioniq-5-ra-mat-Viet-Nam.png',
    features: ['Sạc nhanh', 'Mái che năng lượng mặt trời', 'Không gian rộng rãi'],
    specs: { công_suất: '305 HP', pin: '77 kWh', tăng_tốc: '0-100 km/h 5.1s' },
    description: 'Một trong những mẫu xe điện ấn tượng nhất của Hyundai với thiết kế tương lai.'
  },
  {
    id: '5',
    name: 'Mercedes EQC',
    brand: 'Mercedes-Benz',
    year: 2025,
    type: 'Luxury SUV',
    rating: 4.9,
    reviewCount: 980,
    batteryLevel: 100,
    range: 470,
    seats: 5,
    location: 'Trạm Keangnam Landmark',
    hourlyRate: 210000,
    dailyRate: 1400000,
    status: 'Available',
    condition: 'Excellent',
    image: 'https://img.carbiz.vn/files/2024/07/26/Mercedes-Benz%20bi%20ngung%20san%20xuat/Mercedes%20EQC%20bi%20ngung%20san%20xuat-2.png',
    features: ['Cao cấp', 'Yên tĩnh tuyệt đối', 'Điều hòa thông minh'],
    specs: { công_suất: '402 HP', pin: '90 kWh', tăng_tốc: '0-100 km/h 5.1s' },
    description: 'Xe điện sang trọng của Mercedes mang lại trải nghiệm yên tĩnh và mạnh mẽ.'
  },
  {
    id: '6',
    name: 'Audi e-tron',
    brand: 'Audi',
    year: 2024,
    type: 'Electric SUV',
    rating: 4.8,
    reviewCount: 1340,
    batteryLevel: 90,
    range: 440,
    seats: 5,
    location: 'Trạm The Garden',
    hourlyRate: 185000,
    dailyRate: 1200000,
    status: 'Maintenance Due',
    condition: 'Good',
    image: 'https://www.thecarexpert.co.uk/wp-content/uploads/2019/06/Audi-Q8-e-tron-2133x1200-cropped.jpg',
    features: ['Ổn định cao', 'Sang trọng', 'Cảm giác lái mượt'],
    specs: { công_suất: '402 HP', pin: '95 kWh', tăng_tốc: '0-100 km/h 5.7s' },
    description: 'Xe điện hạng sang kết hợp công nghệ Đức với hiệu suất mạnh mẽ.'
  },
  {
    id: '7',
    name: 'Porsche Taycan',
    brand: 'Porsche',
    year: 2025,
    type: 'Electric Sports Car',
    rating: 5.0,
    reviewCount: 2100,
    batteryLevel: 98,
    range: 460,
    seats: 4,
    location: 'Trạm Metropolis Liễu Giai',
    hourlyRate: 250000,
    dailyRate: 1600000,
    status: 'Available',
    condition: 'Excellent',
    image: 'https://www.topgear.com/sites/default/files/cars-car/image/2024/06/1-Porsche-Taycan-2024-UK-review.jpg?w=1280&h=720',
    features: ['Siêu tốc', 'Sang trọng', 'Cảm giác thể thao'],
    specs: { công_suất: '616 HP', pin: '93.4 kWh', tăng_tốc: '0-100 km/h 3.4s' },
    description: 'Siêu xe điện đẳng cấp với khả năng tăng tốc cực nhanh và thiết kế tinh tế.'
  },
  {
    id: '8',
    name: 'Kia EV6',
    brand: 'Kia',
    year: 2024,
    type: 'Electric Crossover',
    rating: 4.6,
    reviewCount: 640,
    batteryLevel: 85,
    range: 420,
    seats: 5,
    location: 'Trạm Mỹ Đình',
    hourlyRate: 145000,
    dailyRate: 950000,
    status: 'Available',
    condition: 'Good',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhJ9mKzPVrss9tDb4MXbhhJ0dQXtm2FxtGsw&s',
    features: ['Tăng tốc nhanh', 'Thiết kế thể thao', 'Hệ thống an toàn'],
    specs: { công_suất: '320 HP', pin: '77.4 kWh', tăng_tốc: '0-100 km/h 5.2s' },
    description: 'Mẫu xe điện nổi bật của Kia với hiệu năng cao và kiểu dáng bắt mắt.'
  },
  {
    id: '9',
    name: 'Volvo XC40 Recharge',
    brand: 'Volvo',
    year: 2024,
    type: 'Electric SUV',
    rating: 4.8,
    reviewCount: 820,
    batteryLevel: 82,
    range: 410,
    seats: 5,
    location: 'Trạm Hồ Tây',
    hourlyRate: 160000,
    dailyRate: 1080000,
    status: 'Available',
    condition: 'Excellent',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVzDMVkheHcQzCaD_AJmSlh7ZyVNt3Dr19Pg&s',
    features: ['An toàn cao', 'Phong cách Bắc Âu', 'Tiện nghi hiện đại'],
    specs: { công_suất: '402 HP', pin: '78 kWh', tăng_tốc: '0-100 km/h 4.9s' },
    description: 'SUV điện Thụy Điển với sự cân bằng hoàn hảo giữa sức mạnh và an toàn.'
  },
  {
    id: '10',
    name: 'Nissan Ariya',
    brand: 'Nissan',
    year: 2025,
    type: 'Electric SUV',
    rating: 4.5,
    reviewCount: 590,
    batteryLevel: 88,
    range: 430,
    seats: 5,
    location: 'Trạm Cầu Giấy',
    hourlyRate: 140000,
    dailyRate: 920000,
    status: 'Maintenance Due',
    condition: 'Good',
    image: 'https://cdn2.tuoitre.vn/thumb_w/1200/471584752817336320/2023/4/14/nissan-ariya-12-1681429642573853472991-56-0-496-840-crop-16814305215451480043533.jpg',
    features: ['Thiết kế hiện đại', 'Hệ thống thông minh', 'Vận hành êm'],
    specs: { công_suất: '389 HP', pin: '87 kWh', tăng_tốc: '0-100 km/h 5.1s' },
    description: 'SUV điện mạnh mẽ với phong cách Nhật Bản thanh lịch và nhiều tính năng thông minh.'
  }
];

export default mockVehicles;
