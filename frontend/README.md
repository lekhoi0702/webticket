# WebTicket Admin Panel

Frontend admin panel cho hệ thống quản lý vé sự kiện, được xây dựng bằng React + Bootstrap.

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## Cấu trúc Project

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   │   └── Layout.jsx  # Main layout với sidebar
│   ├── pages/          # Các trang chính
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Events.jsx
│   │   ├── EventForm.jsx
│   │   ├── Orders.jsx
│   │   ├── Users.jsx
│   │   └── Tickets.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Các chức năng

### 1. Dashboard
- Hiển thị thống kê tổng quan
- Total Orders, Revenue, Tickets Sold
- Orders today, Revenue this month
- Recent orders

### 2. Events Management
- Xem danh sách events với pagination
- Tạo mới event
- Chỉnh sửa event
- Xóa event
- Tìm kiếm events

### 3. Orders Management
- Xem danh sách orders với filters
- Filter theo status và payment status
- Xem chi tiết order
- Cập nhật order status và payment status

### 4. Users Management
- Xem danh sách users
- Pagination
- Hiển thị thông tin user

### 5. Tickets Management
- Verify ticket bằng code
- Check-in ticket
- Xem thông tin ticket

## API Configuration

API base URL được cấu hình trong `src/services/api.js`. 
Mặc định: `http://127.0.0.1:8000/api/v1`

## Tech Stack

- React 18
- React Router 6
- Bootstrap 5
- React Bootstrap
- Axios
- React Toastify
- React Icons

