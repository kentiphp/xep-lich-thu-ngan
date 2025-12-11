# 🏥 Hệ thống xếp lịch thu ngân

Ứng dụng web quản lý và xếp lịch làm việc cho nhân viên thu ngân, được xây dựng bằng Next.js, TypeScript và Tailwind CSS.

## ✨ Tính năng

### 📋 Quản lý ca làm việc

- **Ca 1**: 8:30 - 17:00
- **Ca 2**: 14:00 - 23:00
- Mỗi ca có **1-2 người** làm việc
- Khi 1 người nghỉ, người còn lại phải làm **full 2 ca**

### 👥 Quản lý nhân viên

- Thêm/sửa thông tin nhân viên
- Mỗi nhân viên có màu riêng để dễ phân biệt trên lịch
- Lưu trữ dữ liệu trên Vercel Postgres database

### 📅 Xem và chỉnh sửa lịch

- Hiển thị lịch làm việc theo tuần
- Điều hướng qua các tuần (trước/sau/tuần hiện tại)
- Đánh dấu ngày nghỉ cho từng nhân viên
- Tự động điều chỉnh lịch khi có người nghỉ

### 💾 Lưu trữ dữ liệu

- Sử dụng Vercel Postgres (Neon) để lưu trữ
- Dữ liệu được tự động đồng bộ với database khi thay đổi
- Giữ lịch sử lịch làm việc cho từng tuần
- Dữ liệu được bảo toàn ngay cả khi xóa cache trình duyệt

## 🚀 Cài đặt và chạy

### Yêu cầu

- Node.js 18+
- npm hoặc yarn

### Các bước chạy

1. **Di chuyển vào thư mục dự án**:

   ```bash
   cd xep-lich-thu-ngan
   ```

2. **Chạy development server**:

   ```bash
   npm run dev
   ```

3. **Mở trình duyệt**:
   Truy cập [http://localhost:3000](http://localhost:3000)

### Các lệnh khác

```bash
# Build cho production
npm run build

# Chạy production build
npm run start

# Kiểm tra linting
npm run lint
```

## 📁 Cấu trúc dự án

```
xep-lich-thu-ngan/
├── app/
│   ├── layout.tsx       # Layout chính
│   ├── page.tsx         # Trang chủ (main logic)
│   └── globals.css      # CSS toàn cục
├── components/
│   ├── EmployeeManager.tsx     # Component quản lý nhân viên
│   ├── WeekScheduleView.tsx    # Component hiển thị lịch tuần
│   └── WeekNavigator.tsx       # Component điều hướng tuần
├── lib/
│   ├── schedule.ts      # Logic xếp lịch
│   └── db.ts            # Database operations (Vercel Postgres)
├── types/
│   └── index.ts         # TypeScript type definitions
└── package.json
```

## 🎨 Công nghệ sử dụng

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Data Storage**: Vercel Postgres (Neon)
- **Database Client**: @vercel/postgres

## 📖 Hướng dẫn sử dụng

### 1. Quản lý nhân viên

- Click nút "Sửa tên" để đổi tên nhân viên
- Nhập tên mới và click "Lưu" hoặc nhấn Enter
- Click "Hủy" hoặc nhấn Escape để hủy thay đổi

### 2. Xem lịch làm việc

- Lịch hiển thị 7 ngày trong tuần (Thứ 2 - Chủ nhật)
- Click vào ngày để xem chi tiết ca làm việc
- Mỗi ngày hiển thị 2 ca và nhân viên được xếp

### 3. Đánh dấu ngày nghỉ

- Click vào ngày bất kỳ để mở rộng
- Click vào tên nhân viên trong phần "Đánh dấu nghỉ"
- Nút sẽ chuyển sang màu đỏ khi nhân viên được đánh dấu nghỉ
- Lịch tự động điều chỉnh: người còn lại sẽ làm full 2 ca

### 4. Điều hướng tuần

- Click "← Tuần trước" để xem tuần trước
- Click "Tuần sau →" để xem tuần sau
- Click "Tuần này" để quay về tuần hiện tại

## 🔧 Logic xếp lịch

### Quy tắc tự động

1. Mặc định: **Cả 2 nhân viên** được xếp vào cả 2 ca
2. Khi 1 người nghỉ: **Người còn lại** làm full cả 2 ca
3. Dữ liệu được **tự động lưu** khi có thay đổi
4. Mỗi tuần có lịch **riêng biệt** và độc lập

### Tùy chỉnh

Bạn có thể dễ dàng tùy chỉnh logic trong file `lib/schedule.ts`:

- Thay đổi quy tắc xếp ca
- Thêm điều kiện đặc biệt
- Tùy chỉnh thuật toán tự động

## 📝 Ghi chú

- Dữ liệu được lưu trong **Vercel Postgres database**
- Dữ liệu được bảo toàn vĩnh viễn, không bị mất khi xóa cache
- Ứng dụng hoạt động hoàn toàn ở **client-side**
- Không cần database hoặc backend

## 🤝 Phát triển thêm

Một số tính năng có thể thêm vào:

- [ ] Export lịch ra Excel/PDF
- [ ] Thêm nhiều nhân viên hơn
- [ ] Thống kê số giờ làm việc
- [ ] Gửi thông báo nhắc nhở
- [ ] Tích hợp với calendar (Google Calendar)
- [ ] Thêm backend để đồng bộ dữ liệu

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa

---

**Phát triển bởi**: AI Assistant với kinh nghiệm 5 năm 😊
**Ngày tạo**: December 2025
