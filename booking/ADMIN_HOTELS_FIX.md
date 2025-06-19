# Admin Hotels Fix - Vấn đề Hotel biến mất sau toggle status

## 🐛 **Vấn đề được báo cáo:**
- Khi admin cập nhật trạng thái hotel (active/inactive), hotel không còn xuất hiện trong danh sách

## 🔍 **Nguyên nhân xác định:**

### **1. Sử dụng sai API endpoints**
```typescript
❌ CŨ:
hotelAPI.getAllHotels()              // Chỉ trả về active hotels
hotelAPI.getAllHotelsWithFilters()   // Method không tồn tại  
hotelAPI.deleteHotel()               // Method không tồn tại
hotelAPI.toggleFeaturedStatus()      // Method không tồn tại

✅ FIXED:
hotelAPI.getAdminHotels()            // Trả về TẤT CẢ hotels (admin view)
hotelAPI.getAdminHotelsWithFilters() // Correct admin filter method
hotelAPI.deleteHotelByAdmin()        // Correct admin delete method
hotelAPI.toggleHotelFeatured()       // Correct featured toggle method
```

### **2. Filter parameters sai field names**
```typescript
❌ CŨ:
filterParams.active = statusFilter     // Backend expects 'isActive'
filterParams.featured = featuredFilter // Backend expects 'isFeatured'

✅ FIXED:  
filterParams.isActive = statusFilter
filterParams.isFeatured = featuredFilter
```

### **3. Filter logic conflict**
- Khi toggle status của hotel từ `active: true` → `active: false`
- Nếu đang có filter `statusFilter = true`, hotel mới toggle sẽ bị ẩn
- Solution: Clear filter sau khi toggle để show updated hotel

## ✅ **Các fix đã áp dụng:**

### **1. API Endpoints Correction**
```typescript
// Fetch hotels
if (searchTerm) {
  response = await hotelAPI.searchHotels(searchTerm, page, size, sortBy);
} else if (hasFilters) {
  response = await hotelAPI.getAdminHotelsWithFilters(filterParams); // ✅ FIXED
} else {
  response = await hotelAPI.getAdminHotels(page, size, sortBy);        // ✅ FIXED
}

// Delete operations  
await hotelAPI.deleteHotelByAdmin(hotelId);                          // ✅ FIXED

// Toggle operations
await hotelAPI.toggleHotelStatus(hotelId);                           // ✅ Exists
await hotelAPI.toggleHotelFeatured(hotelId);                         // ✅ FIXED
```

### **2. Filter Parameters Fix**
```typescript
// Correct backend field mapping
if (statusFilter !== undefined) filterParams.isActive = statusFilter;     // ✅ FIXED
if (featuredFilter !== undefined) filterParams.isFeatured = featuredFilter; // ✅ FIXED
```

### **3. Smart Filter Reset After Toggle**
```typescript
const handleToggleStatus = async (hotelId: string) => {
  const response = await hotelAPI.toggleHotelStatus(hotelId);
  
  // Reset status filter to ensure toggled hotel appears
  if (statusFilter !== undefined) {
    setStatusFilter(undefined);  // ✅ Clear filter to show result
  }
  
  fetchHotels(currentPage);
};
```

### **4. Debug Logging Added**
```typescript
console.log('🔍 Filter params:', filterParams);
console.log('📡 API Response:', response.data);
console.log('✅ Hotels loaded:', data.result.content.length);
console.log('🔄 Toggling status for hotel:', hotelId);
```

## 🎯 **Testing Steps:**

1. **Mở Admin Hotels page**
2. **Kiểm tra browser console** - sẽ thấy logs về filter params và API calls
3. **Toggle status của một hotel** - sẽ thấy:
   - Log `🔄 Toggling status for hotel: {id}`
   - Log `✅ Toggle status response: {...}`
   - Nếu có status filter active, sẽ thấy `🔄 Clearing status filter`
   - Hotel vẫn hiển thị sau toggle

4. **Test các filters** - đảm bảo:
   - City/Country filter hoạt động
   - Star rating filter hoạt động  
   - Status filter (Active/Inactive) hoạt động
   - Featured filter hoạt động
   - Price range filter hoạt động

## 🔄 **Backend API Requirements:**

Đảm bảo backend có các endpoints:
- ✅ `GET /hotels/admin` - All hotels for admin
- ✅ `GET /hotels/admin/filter` - Admin filter with `isActive`, `isFeatured` params
- ✅ `PUT /hotels/admin/{id}/toggle-status` - Toggle hotel status
- ✅ `PUT /hotels/admin/{id}/toggle-featured` - Toggle featured status
- ✅ `DELETE /hotels/admin/{id}` - Delete hotel

## 📊 **Expected Behavior After Fix:**

| Action | Result |
|--------|--------|
| Load page | Shows ALL hotels (active + inactive) |
| Toggle Active→Inactive | Hotel stays visible, status badge updates |
| Toggle Inactive→Active | Hotel stays visible, status badge updates |
| Toggle Featured | Hotel stays visible, featured badge updates |
| Apply filters | Only matching hotels show |
| Clear filters | All hotels show again |

## 🚀 **Status: READY FOR TESTING**

Vấn đề đã được fix, sẵn sàng cho testing! 