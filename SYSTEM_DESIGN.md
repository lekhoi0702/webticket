# Thiết Kế Hệ Thống WebTicket - Quản Lý Bán Vé Sự Kiện

## 📋 Mục Lục
1. [Phân Tích Database & Workflow](#phân-tích-database--workflow)
2. [Chức Năng Admin](#chức-năng-admin)
3. [Chức Năng Customer](#chức-năng-customer)
4. [API Endpoints Đầy Đủ](#api-endpoints-đầy-đủ)
5. [Frontend Pages Đầy Đủ](#frontend-pages-đầy-đủ)

---

## 🔍 Phân Tích Database & Workflow

### Database Schema
```
users (admin/customer)
  ├── user_id, username, email, password_hash, full_name, phone
  ├── role (admin/customer), status (active/suspended/deleted)
  └── Relationships: orders, tickets

events
  ├── event_id, title, slug, description, category, organizer
  ├── venue_name, venue_address, city
  ├── event_date, event_time, event_end_date, event_end_time
  ├── image_url, banner_url, has_seat_map, seat_map_config
  ├── status (draft/published/ongoing/completed/cancelled)
  ├── is_featured, total_capacity, tickets_sold
  └── Relationships: ticket_types, seats, orders, tickets

ticket_types
  ├── ticket_type_id, event_id, name, description, price
  ├── quantity_available, quantity_sold
  ├── min_purchase, max_purchase
  ├── sale_start_date, sale_end_date
  └── status (active/sold_out/inactive)

seats
  ├── seat_id, event_id, section, row_label, seat_number
  ├── price, status (available/reserved/booked/blocked)
  └── order_id, booked_at

orders
  ├── order_id, order_number, user_id, event_id
  ├── customer_name, customer_email, customer_phone
  ├── subtotal, total_amount
  ├── payment_method (credit_card/bank_transfer/e_wallet/cash)
  ├── payment_status (pending/completed/failed/refunded/cancelled)
  ├── order_status (pending/confirmed/cancelled)
  └── transaction_id, paid_at, notes

order_items
  ├── order_item_id, order_id
  ├── ticket_type_id (nullable) hoặc seat_id (nullable)
  ├── quantity, unit_price, subtotal

tickets
  ├── ticket_id, ticket_code (unique)
  ├── order_id, order_item_id, user_id, event_id
  ├── ticket_type_name, seat_info
  ├── price, status (active/used/cancelled/refunded)
  └── checked_in_at
```

### Workflow Hệ Thống

#### 1. Workflow Admin
```
Login (username) 
  → Dashboard (thống kê)
  → Quản lý Sự kiện
    → Tạo/Sửa/Xóa Event
    → Quản lý Ticket Types (thêm/sửa/xóa loại vé)
    → Quản lý Seats (thêm/sửa/xóa chỗ ngồi, bulk create)
  → Quản lý Đơn hàng
    → Xem danh sách đơn hàng
    → Cập nhật trạng thái đơn hàng
    → Xem chi tiết đơn hàng
  → Quản lý Người dùng
    → Xem danh sách users
    → Khóa/Mở khóa user
    → Xem thống kê user
  → Quản lý Vé
    → Verify ticket (kiểm tra vé)
    → Check-in ticket (quét vé vào cửa)
    → Xem danh sách vé
```

#### 2. Workflow Customer
```
Đăng ký/Đăng nhập (email)
  → Trang chủ (xem danh sách events)
    → Tìm kiếm/Lọc theo category/city
  → Xem chi tiết event
    → Chọn loại vé (nếu có ticket types)
    → Chọn chỗ ngồi (nếu có seat map)
    → Đặt vé
  → Thanh toán
    → Điền thông tin khách hàng
    → Chọn phương thức thanh toán
    → Tạo đơn hàng
  → Xác nhận đơn hàng
    → Hiển thị mã đơn hàng
    → Thông tin vé đã mua
  → Quản lý đơn hàng của tôi
    → Xem danh sách đơn hàng
    → Xem chi tiết đơn hàng
    → Hủy đơn hàng (nếu chưa thanh toán)
  → Quản lý vé của tôi
    → Xem danh sách vé
    → Xem chi tiết vé (mã vé, QR code)
    → Tải vé (PDF)
```

---

## 👨‍💼 Chức Năng Admin

### 1. Dashboard (Tổng quan)
✅ **Đã có:**
- Tổng số đơn hàng
- Tổng doanh thu
- Tổng số vé đã bán
- Sự kiện sắp tới
- Đơn hàng gần đây

🔄 **Cần bổ sung:**
- Biểu đồ doanh thu theo tháng/tuần
- Top 5 sự kiện bán chạy nhất
- Biểu đồ vé bán theo category
- Thống kê theo thời gian (ngày/tuần/tháng/năm)
- Export báo cáo (PDF/Excel)

### 2. Quản Lý Sự Kiện
✅ **Đã có:**
- CRUD Events
- Quản lý Ticket Types
- Quản lý Seats (single + bulk)

🔄 **Cần bổ sung:**
- **Import/Export Events** (CSV/Excel)
- **Duplicate Event** (sao chép sự kiện)
- **Event Templates** (tạo template cho sự kiện tương tự)
- **Bulk Actions** (xuất bản/hủy nhiều events cùng lúc)
- **Event Analytics** (thống kê chi tiết từng event)
  - Số vé bán theo loại
  - Doanh thu theo ngày
  - Tỷ lệ chuyển đổi
  - Heatmap chỗ ngồi đã bán

### 3. Quản Lý Đơn Hàng
✅ **Đã có:**
- Xem danh sách đơn hàng
- Cập nhật trạng thái đơn hàng
- Filter theo status, payment_status

🔄 **Cần bổ sung:**
- **Chi tiết đơn hàng** (modal/page riêng)
  - Thông tin khách hàng
  - Danh sách vé trong đơn
  - Lịch sử thay đổi trạng thái
  - Ghi chú/notes
- **Tìm kiếm đơn hàng** theo:
  - Order number
  - Customer email/phone
  - Event name
- **Export đơn hàng** (CSV/PDF)
- **Refund Order** (hoàn tiền)
- **Resend Email Confirmation** (gửi lại email xác nhận)
- **Print Invoice** (in hóa đơn)

### 4. Quản Lý Người Dùng
✅ **Đã có:**
- Xem danh sách users
- Pagination

🔄 **Cần bổ sung:**
- **Chi tiết User**
  - Thông tin cá nhân
  - Lịch sử đơn hàng
  - Lịch sử vé đã mua
  - Thống kê chi tiêu
- **Khóa/Mở khóa User** (suspend/activate)
- **Xóa User** (soft delete)
- **Tìm kiếm User** (email, phone, full_name)
- **Export User List** (CSV)
- **User Analytics**
  - Top khách hàng VIP
  - Thống kê theo thời gian đăng ký
  - Phân tích hành vi mua hàng

### 5. Quản Lý Vé (Ticket Verification & Check-in)
✅ **Đã có:**
- Verify ticket
- Check-in ticket

🔄 **Cần bổ sung:**
- **QR Code Scanner** (quét QR code từ vé)
- **Bulk Check-in** (check-in nhiều vé cùng lúc)
- **Check-in History** (lịch sử check-in)
- **Export Check-in Report** (báo cáo check-in)
- **Real-time Check-in Dashboard** (bảng điều khiển real-time)
  - Số vé đã check-in
  - Số vé chưa check-in
  - Thời gian check-in trung bình
- **Seat Map Visualization** (hiển thị chỗ ngồi đã check-in trên sơ đồ)

### 6. Báo Cáo & Analytics
❌ **Chưa có:**
- **Revenue Reports**
  - Báo cáo doanh thu theo thời gian
  - Báo cáo doanh thu theo event
  - Báo cáo doanh thu theo category
- **Sales Reports**
  - Báo cáo bán vé theo event
  - Báo cáo bán vé theo loại
  - Báo cáo conversion rate
- **Customer Reports**
  - Báo cáo khách hàng mới
  - Báo cáo khách hàng quay lại
  - Customer lifetime value
- **Export Reports** (PDF/Excel/CSV)

---

## 👤 Chức Năng Customer

### 1. Trang Chủ (Homepage)
✅ **Đã có:**
- Danh sách events
- Tìm kiếm
- Filter theo category

🔄 **Cần bổ sung:**
- **Featured Events** (sự kiện nổi bật) - slider/carousel
- **Upcoming Events** (sự kiện sắp tới) - countdown timer
- **Popular Events** (sự kiện phổ biến)
- **Categories Grid** (lưới danh mục với icon)
- **Event Cards Enhancement**
  - Hiển thị số lượng vé còn lại
  - Badge "Sắp hết vé"
  - Rating/Reviews (nếu có)
  - Share buttons

### 2. Xem Chi Tiết Event
✅ **Đã có:**
- Thông tin event cơ bản
- Chọn ticket types
- Đặt vé

🔄 **Cần bổ sung:**
- **Seat Selection** (nếu có seat map)
  - Visual seat map
  - Chọn chỗ ngồi trực tiếp trên map
  - Hiển thị giá từng chỗ
  - Filter theo section
- **Event Gallery** (thêm hình ảnh)
- **Event Description** (rich text)
- **Event Schedule** (lịch trình chi tiết)
- **Venue Map** (Google Maps embed)
- **Social Share** (chia sẻ lên mạng xã hội)
- **Add to Calendar** (thêm vào lịch)
- **Related Events** (sự kiện liên quan)
- **Reviews/Ratings** (đánh giá từ người đã tham gia)

### 3. Đặt Vé (Booking)
✅ **Đã có:**
- Form thông tin khách hàng
- Chọn phương thức thanh toán
- Tạo đơn hàng

🔄 **Cần bổ sung:**
- **Step-by-step Wizard**
  1. Chọn vé/chỗ ngồi
  2. Thông tin khách hàng
  3. Xác nhận & Thanh toán
- **Multiple Tickets for Different People**
  - Nhập thông tin cho từng vé (nếu cần)
- **Promo Code/Discount** (mã giảm giá)
- **Voucher System** (hệ thống voucher)
- **Save Customer Info** (lưu thông tin cho lần sau)
- **Guest Checkout** (đặt vé không cần đăng nhập)
- **Seat Preview** (xem lại chỗ ngồi đã chọn)

### 4. Thanh Toán
✅ **Đã có:**
- Tạo đơn hàng với payment_status = pending

🔄 **Cần bổ sung:**
- **Payment Gateway Integration**
  - Stripe/PayPal/VNPay
  - QR Code payment (MoMo/ZaloPay)
- **Payment Confirmation Page**
  - Hiển thị thông tin thanh toán
  - QR code để quét
  - Countdown timer (nếu có thời gian giới hạn)
- **Auto-update Payment Status** (webhook từ payment gateway)
- **Payment History** (lịch sử thanh toán)

### 5. Quản Lý Đơn Hàng Của Tôi
✅ **Đã có:**
- Xem danh sách đơn hàng

🔄 **Cần bổ sung:**
- **Chi tiết Đơn hàng**
  - Thông tin đơn hàng đầy đủ
  - Danh sách vé
  - Trạng thái thanh toán
  - Timeline đơn hàng
- **Hủy Đơn hàng**
  - Chỉ hủy được nếu chưa thanh toán
  - Confirm dialog
- **Tải Invoice** (tải hóa đơn PDF)
- **Resend Confirmation Email** (gửi lại email xác nhận)
- **Track Order** (theo dõi đơn hàng)

### 6. Quản Lý Vé Của Tôi
✅ **Đã có:**
- Xem danh sách vé

🔄 **Cần bổ sung:**
- **Chi tiết Vé**
  - QR Code lớn
  - Mã vé
  - Thông tin event
  - Thông tin chỗ ngồi (nếu có)
- **Tải Vé PDF** (download vé dạng PDF)
- **Add to Wallet** (thêm vào Apple Wallet/Google Wallet)
- **Share Ticket** (chia sẻ vé với người khác)
- **Print Ticket** (in vé)
- **Ticket Validity Check** (kiểm tra tính hợp lệ của vé)
- **Upcoming Events** (sự kiện sắp tới của tôi)

### 7. Tài Khoản Cá Nhân
❌ **Chưa có:**
- **Profile Page**
  - Xem thông tin cá nhân
  - Cập nhật thông tin (full_name, phone, email)
  - Đổi mật khẩu
  - Upload avatar
- **Preferences**
  - Cài đặt thông báo
  - Ngôn ngữ
  - Theme (nếu có dark mode)
- **Address Book** (sổ địa chỉ - nếu cần giao vé)
- **Payment Methods** (lưu thẻ thanh toán)

### 8. Thông Báo & Email
❌ **Chưa có:**
- **Email Notifications**
  - Email xác nhận đơn hàng
  - Email nhắc nhở sự kiện sắp tới
  - Email vé đã sẵn sàng
  - Email hủy đơn hàng
- **In-app Notifications**
  - Thông báo đơn hàng mới
  - Thông báo vé sắp hết hạn
  - Thông báo event sắp diễn ra

---

## 🔌 API Endpoints Đầy Đủ

### Auth Endpoints
```
✅ POST   /api/v1/auth/register       - Đăng ký
✅ POST   /api/v1/auth/login          - Đăng nhập
✅ GET    /api/v1/auth/me              - Lấy thông tin user hiện tại
🔄 POST   /api/v1/auth/logout          - Đăng xuất
🔄 POST   /api/v1/auth/refresh-token  - Refresh token
🔄 POST   /api/v1/auth/forgot-password - Quên mật khẩu
🔄 POST   /api/v1/auth/reset-password - Đặt lại mật khẩu
🔄 POST   /api/v1/auth/verify-email    - Xác thực email
```

### Events Endpoints
```
✅ GET    /api/v1/events              - Danh sách events (có filter)
✅ GET    /api/v1/events/{id}         - Chi tiết event
✅ GET    /api/v1/events/slug/{slug}  - Chi tiết event theo slug
✅ POST   /api/v1/events              - Tạo event (admin)
✅ PUT    /api/v1/events/{id}         - Cập nhật event (admin)
✅ DELETE /api/v1/events/{id}         - Xóa event (admin)

✅ GET    /api/v1/events/{id}/ticket-types     - Danh sách ticket types
✅ POST   /api/v1/events/{id}/ticket-types   - Tạo ticket type (admin)
✅ PUT    /api/v1/events/{id}/ticket-types/{tt_id} - Cập nhật (admin)
✅ DELETE /api/v1/events/{id}/ticket-types/{tt_id} - Xóa (admin)

✅ GET    /api/v1/events/{id}/seats           - Danh sách seats
✅ POST   /api/v1/events/{id}/seats           - Tạo seat (admin)
✅ POST   /api/v1/events/{id}/seats/bulk      - Tạo bulk seats (admin)
✅ PUT    /api/v1/events/{id}/seats/{seat_id} - Cập nhật (admin)
✅ DELETE /api/v1/events/{id}/seats/{seat_id} - Xóa (admin)

🔄 GET    /api/v1/events/{id}/analytics       - Thống kê event (admin)
🔄 POST   /api/v1/events/{id}/duplicate       - Sao chép event (admin)
🔄 POST   /api/v1/events/import               - Import events (admin)
🔄 GET    /api/v1/events/export               - Export events (admin)
```

### Orders Endpoints
```
✅ POST   /api/v1/orders              - Tạo đơn hàng
✅ GET    /api/v1/orders              - Danh sách đơn hàng của tôi
✅ GET    /api/v1/orders/{id}         - Chi tiết đơn hàng
✅ GET    /api/v1/orders/number/{number} - Chi tiết theo số đơn
✅ PUT    /api/v1/orders/{id}/cancel  - Hủy đơn hàng
✅ POST   /api/v1/orders/{id}/payment - Xác nhận thanh toán

🔄 GET    /api/v1/orders/{id}/invoice - Tải hóa đơn PDF
🔄 POST   /api/v1/orders/{id}/resend-email - Gửi lại email
🔄 POST   /api/v1/orders/{id}/refund  - Hoàn tiền (admin)
```

### Tickets Endpoints
```
✅ GET    /api/v1/tickets              - Danh sách vé của tôi
✅ GET    /api/v1/tickets/{code}        - Chi tiết vé
✅ GET    /api/v1/tickets/verify/{code} - Verify vé (admin)
✅ POST   /api/v1/tickets/checkin     - Check-in vé (admin)

🔄 GET    /api/v1/tickets/{code}/pdf   - Tải vé PDF
🔄 GET    /api/v1/tickets/{code}/qr   - Lấy QR code
🔄 POST   /api/v1/tickets/{code}/share - Chia sẻ vé
```

### Users Endpoints
```
✅ GET    /api/v1/users/me             - Thông tin user hiện tại
✅ PUT    /api/v1/users/me             - Cập nhật profile
✅ GET    /api/v1/users/{id}           - Chi tiết user (public)

🔄 PUT    /api/v1/users/me/password    - Đổi mật khẩu
🔄 POST   /api/v1/users/me/avatar      - Upload avatar
🔄 GET    /api/v1/users/me/orders      - Đơn hàng của tôi (alias)
🔄 GET    /api/v1/users/me/tickets     - Vé của tôi (alias)
```

### Admin Endpoints
```
✅ GET    /api/v1/admin/dashboard      - Thống kê tổng quan
✅ GET    /api/v1/admin/orders         - Tất cả đơn hàng
✅ PUT    /api/v1/admin/orders/{id}/status - Cập nhật trạng thái
✅ GET    /api/v1/admin/users           - Tất cả users
✅ GET    /api/v1/admin/events/stats/{id} - Thống kê event

🔄 GET    /api/v1/admin/reports/revenue - Báo cáo doanh thu
🔄 GET    /api/v1/admin/reports/sales   - Báo cáo bán hàng
🔄 GET    /api/v1/admin/reports/customers - Báo cáo khách hàng
🔄 GET    /api/v1/admin/users/{id}      - Chi tiết user (admin)
🔄 PUT    /api/v1/admin/users/{id}/status - Cập nhật trạng thái user
🔄 GET    /api/v1/admin/tickets          - Tất cả vé
🔄 GET    /api/v1/admin/tickets/checkin-stats - Thống kê check-in
```

---

## 🎨 Frontend Pages Đầy Đủ

### Admin Pages
```
✅ /admin/login                 - Đăng nhập admin
✅ /admin/dashboard             - Tổng quan
✅ /admin/events                 - Danh sách sự kiện
✅ /admin/events/new             - Tạo sự kiện
✅ /admin/events/edit/:id        - Chỉnh sửa sự kiện
✅ /admin/events/:id             - Quản lý vé & chỗ ngồi
✅ /admin/orders                 - Danh sách đơn hàng
✅ /admin/users                  - Danh sách users
✅ /admin/tickets                - Verify & Check-in vé

🔄 /admin/orders/:id             - Chi tiết đơn hàng
🔄 /admin/users/:id              - Chi tiết user
🔄 /admin/reports                - Báo cáo & Analytics
🔄 /admin/settings               - Cài đặt hệ thống
```

### Customer Pages
```
✅ /                             - Trang chủ
✅ /events                       - Danh sách sự kiện
✅ /events/:id                    - Chi tiết sự kiện
✅ /login                        - Đăng nhập
✅ /register                     - Đăng ký
✅ /booking                      - Đặt vé
✅ /booking-success              - Xác nhận đơn hàng
✅ /my-orders                    - Đơn hàng của tôi
✅ /my-tickets                   - Vé của tôi

🔄 /my-orders/:id                - Chi tiết đơn hàng
🔄 /my-tickets/:code              - Chi tiết vé (QR code)
🔄 /profile                      - Tài khoản cá nhân
🔄 /profile/settings             - Cài đặt
🔄 /payment/:orderId             - Trang thanh toán
🔄 /payment/success              - Thanh toán thành công
🔄 /payment/failed               - Thanh toán thất bại
```

---

## 🚀 Ưu Tiên Triển Khai

### Phase 1 - Core Features (Quan trọng nhất)
1. ✅ Authentication (đã có)
2. ✅ Event Management (đã có)
3. ✅ Ticket Types & Seats (đã có)
4. ✅ Booking & Orders (đã có)
5. 🔄 Payment Integration (cần thêm)
6. 🔄 Ticket PDF Export (cần thêm)
7. 🔄 QR Code for Tickets (cần thêm)

### Phase 2 - Enhancement
1. 🔄 Customer Profile Page
2. 🔄 Order Detail Pages (admin & customer)
3. 🔄 Ticket Detail with QR Code
4. 🔄 Email Notifications
5. 🔄 Search & Advanced Filters
6. 🔄 Seat Map Selection (visual)

### Phase 3 - Advanced Features
1. 🔄 Reports & Analytics
2. 🔄 Promo Codes & Discounts
3. 🔄 Reviews & Ratings
4. 🔄 Social Sharing
5. 🔄 Event Templates
6. 🔄 Bulk Operations

---

## 📝 Ghi Chú

- ✅ = Đã có sẵn
- 🔄 = Cần bổ sung/thêm mới
- ❌ = Chưa có (cần tạo mới)

Tài liệu này sẽ được cập nhật khi có thay đổi trong hệ thống.

