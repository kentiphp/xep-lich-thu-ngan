# 🗄️ Database Configuration

## Vercel Postgres (Neon)

Ứng dụng sử dụng **Vercel Postgres** (powered by Neon) để lưu trữ dữ liệu.

### Database Schema

#### 1. `employees` Table

```sql
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_backup BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `preferences` Table

```sql
CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  preference TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, day_of_week)
);
```

#### 3. `schedules` Table

```sql
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  week_start TEXT NOT NULL,
  schedule_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(week_start)
);
```

### API Endpoints

#### Employees

- `GET /api/employees` - Lấy danh sách nhân viên
- `POST /api/employees` - Thêm/cập nhật nhân viên
- `DELETE /api/employees?id={id}` - Xóa nhân viên

#### Preferences

- `GET /api/preferences` - Lấy preferences của tất cả nhân viên
- `POST /api/preferences` - Lưu preferences (bulk update)

#### Schedules

- `GET /api/schedule?weekStart={date}` - Lấy lịch của tuần
- `POST /api/schedule` - Lưu lịch tuần

#### Initialization

- `GET /api/init` - Khởi tạo database tables (chỉ cần gọi 1 lần)

### Environment Variables

Cần các biến môi trường sau trong `.env.local`:

```env
POSTGRES_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
```

Các biến này được tự động tạo khi kết nối Vercel project với Postgres database.

### Local Development

1. **Pull environment variables từ Vercel:**

   ```bash
   vercel env pull
   ```

2. **Khởi tạo database tables:**
   Truy cập `http://localhost:3000/api/init` trong browser

3. **Verify connection:**
   ```bash
   curl http://localhost:3000/api/employees
   ```

### Production Deployment

Khi deploy lên Vercel:

1. Database connection tự động được cấu hình
2. Nhớ truy cập `https://your-app.vercel.app/api/init` để tạo tables
3. Dữ liệu sẽ được lưu vĩnh viễn trong Postgres

### Migration từ localStorage

Nếu bạn đang nâng cấp từ phiên bản cũ dùng localStorage:

1. Dữ liệu localStorage sẽ **không tự động** chuyển sang database
2. Bạn cần nhập lại thông tin nhân viên và preferences
3. Lịch cũ có thể được tạo lại bằng tính năng "Tự động xếp lịch"

### Troubleshooting

**Lỗi: "Failed to fetch employees"**

- Kiểm tra environment variables đã được cấu hình chưa
- Verify database connection string đúng
- Đảm bảo đã gọi `/api/init` để tạo tables

**Dữ liệu không được lưu**

- Mở DevTools Console để xem lỗi API
- Kiểm tra Network tab để thấy API calls
- Verify rằng không còn dùng localStorage

**Test database connection:**

```bash
# Thêm nhân viên test
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"id":"test","name":"Test","color":"#ff0000","isBackup":false}'

# Kiểm tra
curl http://localhost:3000/api/employees

# Xóa
curl -X DELETE "http://localhost:3000/api/employees?id=test"
```
