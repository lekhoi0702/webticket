# Hướng dẫn Sửa lỗi CORS và Backend

## Các thay đổi đã thực hiện:

### 1. CORS Configuration
- ✅ Đã sửa `allow_credentials=False` (không cần cookies)
- ✅ Đã thêm các origins được phép: localhost:3000, 127.0.0.1:3000, etc.
- ✅ Đã cải thiện CORS middleware settings

### 2. Events Endpoint
- ✅ Đã sửa để nhận string parameters thay vì enum trực tiếp
- ✅ Đã thêm error handling tốt hơn
- ✅ Đã thêm try-catch để tránh lỗi 500

### 3. Frontend API Client
- ✅ Đã set `withCredentials: false`
- ✅ Đã thêm error interceptors

## Các bước khắc phục:

### Bước 1: Khởi động lại Backend
```bash
# Dừng backend hiện tại (Ctrl+C nếu đang chạy)
cd backend

# Kích hoạt virtual environment (nếu chưa)
# Windows:
venv\Scripts\activate

# Khởi động lại backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Bước 2: Kiểm tra Backend đang chạy
Mở trình duyệt và truy cập:
- http://127.0.0.1:8000/docs (Swagger UI)
- http://127.0.0.1:8000/health

Nếu thấy response, backend đã chạy thành công.

### Bước 3: Kiểm tra Frontend
```bash
cd frontend
npm run dev
```

Frontend sẽ chạy trên http://localhost:3000

### Bước 4: Xóa Cache và Reload
- Nhấn `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac) để hard reload
- Hoặc mở DevTools (F12) > Network tab > chọn "Disable cache"

## Kiểm tra CORS đã hoạt động:

Mở DevTools (F12) > Console, không còn thấy lỗi CORS.

Kiểm tra Network tab:
- Request đến `/api/v1/events` có status 200
- Response headers có `Access-Control-Allow-Origin: http://localhost:3000`

## Nếu vẫn gặp lỗi:

1. **Kiểm tra port frontend:**
   - Đảm bảo frontend chạy trên port đã được thêm vào CORS config
   - Nếu dùng port khác, thêm vào `backend/app/core/config.py`:
   ```python
   BACKEND_CORS_ORIGINS: List[str] = [
       "http://localhost:YOUR_PORT",
       ...
   ]
   ```

2. **Kiểm tra backend logs:**
   - Xem terminal chạy backend có lỗi gì không
   - Kiểm tra database connection

3. **Test API trực tiếp:**
   ```bash
   curl http://127.0.0.1:8000/api/v1/events?page=1&size=10
   ```
   
   Nếu thành công, backend đang hoạt động đúng.

## Troubleshooting:

### Lỗi: "Connection refused"
- Backend chưa chạy hoặc chạy sai port
- Kiểm tra: `netstat -an | findstr 8000` (Windows)

### Lỗi: "CORS policy blocked"
- Đảm bảo đã khởi động lại backend sau khi sửa config
- Kiểm tra `allow_credentials=False`
- Kiểm tra frontend đang chạy trên origin được phép

### Lỗi: "500 Internal Server Error"
- Kiểm tra database connection
- Xem backend logs để biết lỗi cụ thể
- Đảm bảo đã chạy `sample_data.sql` để có dữ liệu mẫu


