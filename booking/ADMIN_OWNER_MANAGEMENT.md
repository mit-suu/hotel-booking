# Admin Owner Management Feature

## 🎯 **Tính năng mới: Admin có thể thay đổi chủ sở hữu khách sạn**

Admin bây giờ có thể thay đổi owner (chủ sở hữu) của bất kỳ khách sạn nào thông qua trang Edit Hotel.

## ✅ **Backend Implementation**

### **1. DTO Updates**
- `HotelUpdateRequest.java`: Thêm field `UUID ownerId`
- `HotelCreateRequest.java`: Đã có sẵn field `UUID ownerId`

### **2. Service Layer**
- `HotelServiceImpl.updateHotelByAdmin()`: Thêm logic validate và change owner
- `UserService.getHostUsers()`: Method mới để lấy danh sách users có role HOST
- `UserServiceImp.getHostUsers()`: Implementation với pagination

### **3. Repository Layer**
- `UserRepository.findByRolesContaining()`: Method mới để tìm users theo role

### **4. Controller Layer**
- `UserController.getHosts()`: Endpoint mới `/users/hosts` với `@IsAdmin`

### **5. Owner Change Logic**
```java
// Handle owner change (only admin can do this)
if (request.getOwnerId() != null && !request.getOwnerId().equals(hotel.getOwner().getId())) {
    log.info("Admin changing hotel owner from {} to {}", hotel.getOwner().getId(), request.getOwnerId());
    
    // Validate new owner exists
    User newOwner = userRepository.findById(request.getOwnerId())
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    
    hotel.setOwner(newOwner);
}
```

## ✅ **Frontend Implementation**

### **1. API Updates**
- `api.ts`: Thêm `ownerId` vào `HotelUpdateRequest`
- `userAPI.getHosts()`: Method mới để lấy danh sách hosts

### **2. AdminHotelEdit Component**
- Thêm state `hosts` và `hostsLoading`
- Function `fetchHosts()` để load danh sách hosts
- UI section "Quản lý chủ sở hữu" với dropdown selection

### **3. UI Features**
- Hiển thị thông tin chủ sở hữu hiện tại
- Dropdown để chọn chủ sở hữu mới từ danh sách hosts
- Loading state khi fetch hosts
- Warning message nếu không có hosts
- Helpful tooltips

## 📋 **API Endpoints**

### **Backend Endpoints**
```
GET /users/hosts              - Lấy danh sách users có role HOST (Admin only)
PUT /hotels/admin/{id}        - Cập nhật hotel với ownerId mới (Admin only)
```

### **Frontend API Calls**
```typescript
userAPI.getHosts(pageNumber, pageSize, sortBy)
hotelAPI.updateHotelByAdmin(id, formData) // formData.ownerId
```

## 🎨 **UI/UX Design**

### **Owner Management Section**
```
┌─────────────────────────────────────────────┐
│ 👤 Quản lý chủ sở hữu                      │
├─────────────────────────────────────────────┤
│ Chủ sở hữu hiện tại:                       │
│ ┌─────────────────────────────────────────┐ │
│ │ Nguyễn Văn A                            │ │
│ │ nguyen.vana@email.com                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Chọn chủ sở hữu mới:                       │
│ [Dropdown với danh sách hosts        ▼]    │
│ 💡 Tip: Chỉ hiển thị users có role HOST    │
└─────────────────────────────────────────────┘
```

## 🔄 **Workflow**

### **Admin Change Owner Process:**
1. Admin vào Edit Hotel page
2. System tự động load danh sách hosts
3. Admin thấy owner hiện tại trong "Chủ sở hữu hiện tại"
4. Admin chọn owner mới từ dropdown (hoặc giữ nguyên)
5. Admin click "Lưu thay đổi"
6. Backend validate new owner và update hotel
7. Redirect về detail page với owner mới

### **Security & Validation:**
- ✅ Chỉ Admin mới có quyền change owner
- ✅ Validate new owner tồn tại
- ✅ Validate new owner có role HOST
- ✅ Log change owner activities
- ✅ Frontend chỉ hiển thị users có role HOST

## 🧪 **Testing Scenarios**

### **1. Normal Flow**
- Admin select new host from dropdown
- Save form successfully
- Verify owner changed in detail page
- Verify logs show owner change

### **2. Edge Cases**
- No hosts available (empty dropdown)
- Select same owner (no change)
- Network error when loading hosts
- Invalid owner ID (backend validation)

### **3. Security Tests**
- Non-admin user cannot access hosts endpoint
- Non-admin cannot change owner
- Invalid owner ID rejected
- Owner without HOST role rejected

## 🚀 **Benefits**

### **Admin Capabilities:**
- **Reassign Hotels**: Move hotels between hosts easily
- **Host Management**: Better control over host assignments
- **Business Flexibility**: Support host role changes
- **Troubleshooting**: Fix ownership issues quickly

### **System Improvements:**
- **Clear Ownership**: Always know who owns what
- **Audit Trail**: Log all ownership changes
- **Role-based Security**: Only authorized users can change owners
- **Data Integrity**: Validate all ownership transfers

## 📊 **Impact**

### **Admin Workflow Enhancement:**
- Faster hotel ownership management
- Better host assignment flexibility
- Reduced support tickets
- Improved data accuracy

### **Technical Benefits:**
- Clean separation of concerns
- Robust validation and security
- Comprehensive error handling
- Maintainable codebase

## 🔧 **Future Enhancements**

### **Possible Improvements:**
- Bulk owner change for multiple hotels
- Owner change history/audit log UI
- Email notifications for ownership changes
- Owner transfer confirmation workflow
- Advanced search/filter for hosts

---

## 🚀 **Status: PRODUCTION READY**

Chức năng Admin Owner Management đã hoàn thành và sẵn sàng cho production! ✨ 