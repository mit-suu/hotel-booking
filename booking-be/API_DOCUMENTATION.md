# VietBooking API Documentation

## Tổng quan
VietBooking là hệ thống quản lý khách sạn với các chức năng đầy đủ cho admin, chủ khách sạn và khách hàng.

## Base URL
```
http://localhost:8080
```

## Authentication
Hệ thống sử dụng JWT token cho authentication. Thêm header:
```
Authorization: Bearer <token>
```

## Admin Endpoints

### Dashboard & Statistics
- `GET /admin/dashboard` - Lấy thống kê tổng quan dashboard
- `GET /admin/stats/hotels` - Thống kê khách sạn
- `GET /admin/stats/room-types` - Thống kê loại phòng
- `GET /admin/stats/reviews` - Thống kê đánh giá
- `GET /admin/stats/users` - Thống kê người dùng

## Hotel Management

### Admin Hotel Operations
- `GET /hotels/admin` - Lấy tất cả khách sạn (admin)
- `GET /hotels/admin/filter` - Lọc khách sạn với nhiều tiêu chí
- `POST /hotels/admin` - Tạo khách sạn mới
- `PUT /hotels/admin/{id}` - Cập nhật khách sạn
- `DELETE /hotels/admin/{id}` - Xóa khách sạn
- `PUT /hotels/admin/{id}/toggle-status` - Bật/tắt trạng thái khách sạn
- `PUT /hotels/admin/{id}/toggle-featured` - Bật/tắt khách sạn nổi bật
- `GET /hotels/admin/owner/{ownerId}` - Lấy khách sạn theo chủ sở hữu

### Admin Hotel Statistics
- `GET /hotels/admin/stats/total` - Tổng số khách sạn
- `GET /hotels/admin/stats/active` - Số khách sạn đang hoạt động
- `GET /hotels/admin/stats/featured` - Số khách sạn nổi bật
- `GET /hotels/admin/stats/owner/{ownerId}` - Số khách sạn theo chủ sở hữu

### Public Hotel Operations
- `GET /hotels/{id}` - Lấy thông tin khách sạn theo ID
- `GET /hotels/search?keyword={keyword}` - Tìm kiếm khách sạn
- `GET /hotels/city/{city}` - Lấy khách sạn theo thành phố
- `GET /hotels/country/{country}` - Lấy khách sạn theo quốc gia
- `GET /hotels/rating/{starRating}` - Lấy khách sạn theo số sao
- `GET /hotels/active` - Lấy khách sạn đang hoạt động
- `GET /hotels/featured` - Lấy khách sạn nổi bật
- `GET /hotels/my` - Lấy khách sạn của tôi (chủ sở hữu)


### Hotel Request/Response Models

#### HotelCreateRequest
```json
{
  "name": "string (required, 2-100 chars)",
  "description": "string (max 2000 chars)",
  "address": "string (required, max 500 chars)",
  "city": "string (max 100 chars)",
  "country": "string (max 100 chars)",
  "phone": "string (optional, phone format)",
  "email": "string (optional, email format)",
  "website": "string (optional, URL format)",
  "starRating": "integer (optional, 1-5)",
  "checkInTime": "string (optional, HH:mm format)",
  "checkOutTime": "string (optional, HH:mm format)",
  "imageUrl": "string",
  "pricePerNight": "decimal (> 0)",

  "amenities": "string",
  "cancellationPolicy": "string (max 1000 chars)",
  "petPolicy": "string (max 1000 chars)",
  "ownerId": "UUID (optional)",
  "isActive": "boolean (default: true)",
  "isFeatured": "boolean (default: false)"
}
```

#### HotelResponse
```json
{
  "id": "UUID",
  "name": "string",
  "description": "string",
  "address": "string",
  "city": "string",
  "country": "string",
  "phone": "string",
  "email": "string",
  "website": "string",
  "starRating": "integer",
  "checkInTime": "string",
  "checkOutTime": "string",
  "imageUrl": "string",
  "isActive": "boolean",
  "isFeatured": "boolean",
  "pricePerNight": "decimal",

  "amenities": "string",
  "cancellationPolicy": "string",
  "petPolicy": "string",
  "ownerId": "UUID",
  "ownerName": "string",
  "ownerEmail": "string",
  "totalRoomTypes": "integer",
  "totalRooms": "integer",
  "availableRooms": "integer",
  "averageRating": "double",
  "totalReviews": "integer",
  "roomTypes": "array of RoomTypeResponse (optional)",
  "recentReviews": "array of ReviewResponse (optional)",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "createdBy": "UUID",
  "updatedBy": "UUID"
}
```

## Room Type Management

### Admin Room Type Operations
- `GET /room-types/admin` - Lấy tất cả loại phòng (admin)
- `GET /room-types/admin/filter` - Lọc loại phòng với nhiều tiêu chí
- `POST /room-types/admin` - Tạo loại phòng mới
- `PUT /room-types/admin/{id}` - Cập nhật loại phòng
- `DELETE /room-types/admin/{id}` - Xóa loại phòng
- `PUT /room-types/admin/{id}/toggle-status` - Bật/tắt trạng thái loại phòng

### Admin Room Type Statistics
- `GET /room-types/admin/stats/total` - Tổng số loại phòng
- `GET /room-types/admin/stats/active` - Số loại phòng đang hoạt động
- `GET /room-types/admin/stats/hotel/{hotelId}` - Số loại phòng theo khách sạn

### Public Room Type Operations
- `GET /room-types/{id}` - Lấy thông tin loại phòng theo ID
- `GET /room-types/hotel/{hotelId}` - Lấy loại phòng theo khách sạn
- `GET /room-types/hotel/{hotelId}/active` - Lấy loại phòng đang hoạt động theo khách sạn
- `GET /room-types/hotel/{hotelId}/available` - Lấy loại phòng có sẵn theo khách sạn
- `GET /room-types/search?keyword={keyword}` - Tìm kiếm loại phòng
- `GET /room-types/occupancy/{minOccupancy}` - Lấy loại phòng theo sức chứa tối thiểu
- `GET /room-types/price-range?minPrice={min}&maxPrice={max}` - Lấy loại phòng theo khoảng giá
- `GET /room-types/available` - Lấy tất cả loại phòng có sẵn

### Room Type Request/Response Models

#### RoomTypeCreateRequest
```json
{
  "name": "string (required, 2-100 chars)",
  "description": "string (max 1000 chars)",
  "maxOccupancy": "integer (required, 1-10)",
  "bedType": "string (max 50 chars)",
  "roomSize": "double (1-1000 sqm)",
  "pricePerNight": "decimal (required, > 0)",
  "totalRooms": "integer (required, 1-1000)",
  "imageUrl": "string",
  "amenities": "string",
  "hotelId": "UUID (required)",
  "isActive": "boolean (default: true)"
}
```

#### RoomTypeResponse
```json
{
  "id": "UUID",
  "name": "string",
  "description": "string",
  "maxOccupancy": "integer",
  "bedType": "string",
  "roomSize": "double",
  "pricePerNight": "decimal",
  "totalRooms": "integer",
  "availableRooms": "integer",
  "imageUrl": "string",
  "isActive": "boolean",
  "amenities": "string",
  "hotelId": "UUID",
  "hotelName": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "createdBy": "UUID",
  "updatedBy": "UUID"
}
```

## Review Management

### Admin Review Operations
- `GET /reviews/admin` - Lấy tất cả đánh giá (admin)
- `GET /reviews/admin/filter` - Lọc đánh giá với nhiều tiêu chí
- `DELETE /reviews/admin/{id}` - Xóa đánh giá
- `PUT /reviews/admin/{id}/approve` - Phê duyệt đánh giá
- `PUT /reviews/admin/{id}/disapprove` - Từ chối đánh giá
- `PUT /reviews/admin/{id}/verify` - Xác minh đánh giá
- `GET /reviews/admin/user/{userId}` - Lấy đánh giá theo người dùng

### Admin Review Statistics
- `GET /reviews/admin/stats/total` - Tổng số đánh giá
- `GET /reviews/admin/stats/approved` - Số đánh giá đã phê duyệt
- `GET /reviews/admin/stats/verified` - Số đánh giá đã xác minh
- `GET /reviews/admin/stats/hotel/{hotelId}` - Số đánh giá theo khách sạn
- `GET /reviews/admin/stats/user/{userId}` - Số đánh giá theo người dùng

### Public Review Operations
- `GET /reviews/{id}` - Lấy thông tin đánh giá theo ID
- `GET /reviews/hotel/{hotelId}` - Lấy đánh giá theo khách sạn
- `GET /reviews/hotel/{hotelId}/approved` - Lấy đánh giá đã phê duyệt theo khách sạn
- `GET /reviews/hotel/{hotelId}/verified` - Lấy đánh giá đã xác minh theo khách sạn
- `GET /reviews/hotel/{hotelId}/average-rating` - Lấy điểm đánh giá trung bình
- `GET /reviews/rating/{rating}` - Lấy đánh giá theo số sao
- `GET /reviews/search?keyword={keyword}` - Tìm kiếm đánh giá

### User Review Operations
- `POST /reviews` - Tạo đánh giá mới
- `PUT /reviews/{id}` - Cập nhật đánh giá của tôi
- `GET /reviews/my` - Lấy đánh giá của tôi

### Review Request/Response Models

#### ReviewCreateRequest
```json
{
  "rating": "integer (required, 1-5)",
  "comment": "string (max 2000 chars)",
  "hotelId": "UUID (required)",
  "userId": "UUID (optional, use current user if not provided)"
}
```

#### ReviewResponse
```json
{
  "id": "UUID",
  "rating": "integer",
  "comment": "string",
  "isVerified": "boolean",
  "isApproved": "boolean",
  "helpfulCount": "integer",
  "hotelId": "UUID",
  "hotelName": "string",
  "userId": "UUID",
  "userName": "string",
  "userEmail": "string (only in admin view)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Common Query Parameters

### Pagination
- `page`: Số trang (default: 0)
- `size`: Kích thước trang (default: 10)
- `sortBy`: Trường sắp xếp (default: varies by endpoint)
- `sortDir`: Hướng sắp xếp (`asc` hoặc `desc`, default: varies by endpoint)

### Hotel Filters
- `isActive`: Trạng thái hoạt động (boolean)
- `isFeatured`: Trạng thái nổi bật (boolean)
- `starRating`: Số sao (1-5)
- `city`: Thành phố
- `ownerId`: ID chủ sở hữu

### Room Type Filters
- `hotelId`: ID khách sạn
- `isActive`: Trạng thái hoạt động (boolean)
- `minOccupancy`: Sức chứa tối thiểu
- `maxOccupancy`: Sức chứa tối đa
- `minPrice`: Giá tối thiểu
- `maxPrice`: Giá tối đa

### Review Filters
- `hotelId`: ID khách sạn
- `userId`: ID người dùng
- `rating`: Số sao đánh giá (1-5)
- `isApproved`: Trạng thái phê duyệt (boolean)
- `isVerified`: Trạng thái xác minh (boolean)

### Booking Filters
- `status`: Trạng thái đặt phòng (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
- `paymentStatus`: Trạng thái thanh toán (PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED)
- `hotelId`: ID khách sạn
- `guestName`: Tên khách
- `checkInDate`: Ngày nhận phòng
- `checkOutDate`: Ngày trả phòng

## Booking Management

### Guest Booking Operations
- `POST /bookings` - Tạo đặt phòng mới
- `GET /bookings/my` - Lấy danh sách đặt phòng của tôi
- `GET /bookings/my/{id}` - Lấy chi tiết đặt phòng của tôi
- `PUT /bookings/my/{id}` - Cập nhật đặt phòng của tôi
- `PATCH /bookings/my/{id}/cancel` - Hủy đặt phòng của tôi

### Host Booking Operations
- `GET /bookings/host` - Lấy tất cả đặt phòng của host
- `GET /bookings/host/{id}` - Lấy chi tiết đặt phòng (host)
- `PUT /bookings/host/{id}` - Cập nhật đặt phòng (host)
- `PATCH /bookings/host/{id}/confirm` - Xác nhận đặt phòng
- `PATCH /bookings/host/{id}/cancel` - Hủy đặt phòng
- `PATCH /bookings/host/{id}/complete` - Hoàn thành đặt phòng
- `GET /bookings/hotel/{hotelId}` - Lấy đặt phòng theo khách sạn

### Admin Booking Operations
- `GET /bookings/admin` - Lấy tất cả đặt phòng (admin)
- `GET /bookings/admin/{id}` - Lấy chi tiết đặt phòng (admin)
- `PUT /bookings/admin/{id}` - Cập nhật đặt phòng (admin)
- `DELETE /bookings/admin/{id}` - Xóa đặt phòng

### Booking Search & Filter
- `GET /bookings/search?keyword={keyword}` - Tìm kiếm đặt phòng
- `GET /bookings/date-range?startDate={start}&endDate={end}` - Lấy đặt phòng theo khoảng thời gian

### Booking Statistics
- `GET /bookings/admin/stats/total` - Tổng số đặt phòng (admin)
- `GET /bookings/host/stats/total` - Tổng số đặt phòng của host

### Booking Utility
- `GET /bookings/check-availability?roomTypeId={id}&checkInDate={date}&checkOutDate={date}` - Kiểm tra tình trạng phòng

### Booking Request/Response Models

#### BookingCreateRequest
```json
{
  "hotelId": "UUID (required)",
  "roomTypeId": "UUID (required)",
  "guestName": "string (required, 2-100 chars)",
  "guestEmail": "string (required, email format)",
  "guestPhone": "string (phone format)",
  "checkInDate": "date (required, future or present)",
  "checkOutDate": "date (required, future)",
  "guests": "integer (required, 1-10)",
  "totalAmount": "decimal (required, > 0)",
  "paymentMethod": "string (max 50 chars)",
  "specialRequests": "string (max 1000 chars)"
}
```

#### BookingUpdateRequest
```json
{
  "guestName": "string (2-100 chars)",
  "guestEmail": "string (email format)",
  "guestPhone": "string (phone format)",
  "checkInDate": "date (future or present)",
  "checkOutDate": "date (future)",
  "guests": "integer (1-10)",
  "totalAmount": "decimal (> 0)",
  "status": "PENDING|CONFIRMED|CANCELLED|COMPLETED|NO_SHOW",
  "paymentStatus": "PENDING|PAID|FAILED|REFUNDED|PARTIALLY_REFUNDED",
  "paymentMethod": "string (max 50 chars)",
  "specialRequests": "string (max 1000 chars)"
}
```

#### BookingResponse
```json
{
  "id": "UUID",
  "guestName": "string",
  "guestEmail": "string",
  "guestPhone": "string",
  "hotelId": "UUID",
  "hotelName": "string",
  "hotelAddress": "string",
  "hotelPhone": "string",
  "hotelEmail": "string",
  "roomTypeId": "UUID",
  "roomTypeName": "string",
  "roomDescription": "string",
  "maxOccupancy": "integer",
  "bedType": "string",
  "userId": "UUID",
  "userName": "string",
  "checkInDate": "date",
  "checkOutDate": "date",
  "guests": "integer",
  "totalAmount": "decimal",
  "status": "enum",
  "paymentStatus": "enum",
  "paymentMethod": "string",
  "bookingReference": "string",
  "specialRequests": "string",
  "numberOfNights": "integer",
  "pricePerNight": "decimal",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "createdBy": "UUID",
  "updatedBy": "UUID"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "string",
  "result": "object or array"
}
```

### Page Response
```json
{
  "success": true,
  "message": "string",
  "result": {
    "content": "array",
    "page": "integer",
    "size": "integer",
    "totalElements": "long",
    "totalPages": "integer",
    "first": "boolean",
    "last": "boolean"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "string",
  "code": "integer"
}
```

## Admin Dashboard Response

### AdminDashboardResponse
```json
{
  "totalHotels": "long",
  "activeHotels": "long",
  "inactiveHotels": "long",
  "featuredHotels": "long",
  "totalRoomTypes": "long",
  "activeRoomTypes": "long",
  "inactiveRoomTypes": "long",
  "totalReviews": "long",
  "approvedReviews": "long",
  "pendingReviews": "long",
  "verifiedReviews": "long",
  "totalUsers": "long"
}
```

## Security Notes

1. **Admin Endpoints**: Tất cả endpoints có prefix `/admin` hoặc annotation `@IsAdmin` yêu cầu quyền admin
2. **Authentication**: Sử dụng JWT token trong header Authorization
3. **Validation**: Tất cả request đều được validate theo constraints đã định nghĩa
4. **Error Handling**: Hệ thống có error handling toàn cục với các error codes cụ thể

## Status Codes

- `200 OK`: Thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Chưa xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `500 Internal Server Error`: Lỗi server

## Examples

### Tạo khách sạn mới
```bash
POST /hotels/admin
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "name": "Grand Hotel Saigon",
  "description": "Luxury hotel in the heart of Ho Chi Minh City",
  "address": "123 Nguyen Hue Street, District 1",
  "city": "Ho Chi Minh City",
  "country": "Vietnam",
  "phone": "+84-28-1234-5678",
  "email": "info@grandhotelsaigon.com",
  "starRating": 5,
  "checkInTime": "14:00",
  "checkOutTime": "12:00",
  "pricePerNight": 150.00,
  "latitude": 10.7769,
  "longitude": 106.7009,
  "amenities": "WiFi, Pool, Spa, Restaurant, Gym",
  "isActive": true,
  "isFeatured": true
}
```

### Tìm kiếm khách sạn
```bash
GET /hotels/search?keyword=grand&page=0&size=10&sortBy=name&sortDir=asc
```

### Lấy thống kê dashboard
```bash
GET /admin/dashboard
Authorization: Bearer <admin-token>
``` 