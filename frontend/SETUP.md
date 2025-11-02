# Hướng dẫn Setup Frontend Admin Panel

## Yêu cầu

- Node.js >= 16.x
- npm hoặc yarn

## Cài đặt

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Hoặc dùng yarn
yarn install
```

## Chạy Development Server

```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## Build Production

```bash
npm run build
```

Files build sẽ được tạo trong thư mục `dist/`

## Cấu trúc Project

```
frontend/
├── src/
│   ├── components/        # Components tái sử dụng
│   │   └── Layout.jsx    # Layout với sidebar navigation
│   ├── pages/            # Các trang chính
│   │   ├── Login.jsx           # Trang đăng nhập
│   │   ├── Dashboard.jsx      # Dashboard với thống kê
│   │   ├── Events.jsx         # Quản lý events (list)
│   │   ├── EventForm.jsx      # Form create/edit event
│   │   ├── Orders.jsx         # Quản lý orders
│   │   ├── Users.jsx          # Quản lý users
│   │   └── Tickets.jsx        # Verify và check-in tickets
│   ├── services/         # API services
│   │   └── api.js        # Tất cả API calls
│   ├── App.jsx           # Main app với routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.js        # Vite configuration
└── README.md
```

## Tính năng

### 1. Authentication
- Login với email/password
- Không dùng JWT token (simplified)

### 2. Dashboard
- Thống kê tổng quan: Total Orders, Revenue, Tickets Sold
- Orders today, Revenue this month
- Upcoming events
- Recent orders table

### 3. Events Management
- Danh sách events với pagination
- Search events
- Tạo mới event
- Chỉnh sửa event
- Xóa event
- Hiển thị status, capacity, tickets sold

### 4. Orders Management
- Danh sách orders với pagination
- Filter theo order status và payment status
- Xem chi tiết order trong modal
- Cập nhật order status và payment status
- Hiển thị order items

### 5. Users Management
- Danh sách users với pagination
- Hiển thị thông tin: role, status, created date

### 6. Tickets Management
- Verify ticket bằng code
- Check-in ticket
- Hiển thị thông tin ticket chi tiết

## API Endpoints sử dụng

- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/auth/me` - Lấy thông tin user hiện tại
- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/orders` - Danh sách orders (với filters)
- `PUT /api/v1/admin/orders/{id}/status` - Update order status
- `GET /api/v1/admin/users` - Danh sách users
- `GET /api/v1/admin/events/stats/{id}` - Event statistics
- `GET /api/v1/events` - Danh sách events
- `POST /api/v1/events` - Tạo event
- `PUT /api/v1/events/{id}` - Update event
- `DELETE /api/v1/events/{id}` - Delete event
- `GET /api/v1/tickets/verify/{code}` - Verify ticket
- `POST /api/v1/tickets/checkin` - Check-in ticket

## Troubleshooting

### Lỗi CORS
Đảm bảo backend đã cấu hình CORS để cho phép frontend. 
Kiểm tra `app/core/config.py`: `BACKEND_CORS_ORIGINS`

### Lỗi kết nối API
Kiểm tra `API_BASE_URL` trong `src/services/api.js` phải trùng với backend URL.

### Module not found
Chạy lại `npm install` để cài đặt dependencies.

