# 📋 Quy tắc xếp lịch tự động

## 🎯 Mục tiêu

Hệ thống xếp lịch tự động cho nhân viên thu ngân với các quy tắc mới:

## ✅ Quy tắc chính

### 1. **Mỗi ca ít nhất 1 người**
- Ca 1 (8:30 - 17:00): Tối thiểu 1 nhân viên
- Ca 2 (14:00 - 23:00): Tối thiểu 1 nhân viên

### 2. **Mỗi người làm tối đa 1 ca/ngày**
- Một nhân viên chỉ được xếp vào 1 ca trong ngày
- Không có trường hợp làm full 2 ca
- Mỗi ngày mỗi người hoặc làm Ca 1 HOẶC Ca 2 HOẶC nghỉ

### 3. **Phân loại nhân viên**

#### Nhân viên đủ điều kiện (`canWorkAlone = true`)
- Có thể đứng ca một mình
- Hiển thị badge "✅ Đủ điều kiện" trong danh sách
- Được ưu tiên xếp vào ca trước

#### Nhân viên chưa đủ điều kiện (`canWorkAlone = false`)
- Phải làm chung với nhân viên đủ điều kiện
- Không được đứng ca một mình
- Nếu không có người đủ điều kiện, có thể ghép 2 người chưa đủ điều kiện

## 🔄 Thuật toán xếp ca

### Bước 1: Lọc nhân viên nghỉ
- Loại bỏ nhân viên trong danh sách `dayOff`
- Xử lý preference "off" từ cài đặt

### Bước 2: Phân loại nhân viên
```
Nhân viên đủ điều kiện:
  - Muốn ca sáng
  - Muốn ca tối
  - Linh hoạt

Nhân viên chưa đủ điều kiện:
  - Muốn ca sáng
  - Muốn ca tối
  - Linh hoạt
```

### Bước 3: Xếp Ca 1 (Sáng)

**Ưu tiên:**
1. Nhân viên đủ điều kiện + muốn ca sáng
2. Nhân viên đủ điều kiện + linh hoạt
3. Nhân viên đủ điều kiện + muốn ca tối
4. Nếu không có người đủ điều kiện → Dùng người chưa đủ điều kiện

**Ghép cặp:**
- Nếu có người đủ điều kiện → Thêm người chưa đủ điều kiện nếu có (ưu tiên muốn ca sáng)
- Nếu không có người đủ điều kiện → Ghép 2 người chưa đủ điều kiện

### Bước 4: Xếp Ca 2 (Tối)

**Lấy người còn lại (chưa xếp ca 1)**

**Ưu tiên:**
1. Nhân viên đủ điều kiện + muốn ca tối
2. Nhân viên đủ điều kiện + linh hoạt
3. Nhân viên đủ điều kiện + muốn ca sáng
4. Nếu không có người đủ điều kiện → Dùng người chưa đủ điều kiện

**Ghép cặp:**
- Tương tự Ca 1

## 📊 Ví dụ

### Ví dụ 1: Đủ người và có đủ điều kiện

**Nhân viên:**
- A (đủ điều kiện, muốn ca sáng)
- B (chưa đủ điều kiện, muốn ca tối)

**Kết quả:**
- Ca 1: A
- Ca 2: B

### Ví dụ 2: Có người đủ điều kiện và người chưa đủ

**Nhân viên:**
- A (đủ điều kiện, linh hoạt)
- B (chưa đủ điều kiện, muốn ca sáng)
- C (chưa đủ điều kiện, muốn ca tối)

**Kết quả:**
- Ca 1: A, B (người đủ điều kiện + người chưa đủ muốn sáng)
- Ca 2: C

### Ví dụ 3: Không có người đủ điều kiện

**Nhân viên:**
- A (chưa đủ điều kiện, muốn ca sáng)
- B (chưa đủ điều kiện, muốn ca tối)
- C (chưa đủ điều kiện, linh hoạt)

**Kết quả:**
- Ca 1: A, C (2 người chưa đủ điều kiện)
- Ca 2: B

### Ví dụ 4: Chỉ có 1 nhân viên

**Nhân viên:**
- A (đủ điều kiện)

**Kết quả:**
- Ca 1: A
- Ca 2: [] (thiếu người)

⚠️ **Lưu ý:** Hệ thống sẽ cảnh báo ca thiếu người (hiển thị màu đỏ)

## 🎨 Hiển thị trên giao diện

### Badge nhân viên
- ✅ **Đủ điều kiện**: Màu xanh lá
- Không có badge: Chưa đủ điều kiện

### Cảnh báo ca
- 🔴 **Màu đỏ**: Ca thiếu người (0 nhân viên)
- 🟡 **Màu vàng**: Có người nghỉ trong ngày
- ⚪ **Màu trắng**: Bình thường

## 🔧 Quản lý nhân viên

### Đánh dấu "Đủ điều kiện"

1. Vào trang **Quản lý nhân viên**
2. Tích checkbox **"Đủ điều kiện 1 mình"** cho nhân viên
3. Nhấn **Lưu**
4. Quay lại trang chủ và **Tạo lại lịch** để áp dụng

### Ý nghĩa
- Nhân viên đủ điều kiện có thể đứng ca một mình
- Nhân viên chưa đủ điều kiện phải có người đủ điều kiện đi kèm (hoặc ghép 2 người chưa đủ)

## 🔄 So sánh với hệ thống cũ

| Tiêu chí | Cũ (Backup) | Mới (Qualification) |
|----------|-------------|---------------------|
| Khái niệm | Nhân viên trám ca | Nhân viên đủ/chưa đủ điều kiện |
| Quy tắc | Backup chỉ xếp khi thiếu | Chưa đủ DK phải đi kèm người đủ DK |
| Làm full ca | Có (khi có người nghỉ) | Không (1 người max 1 ca/ngày) |
| Linh hoạt | Thấp | Cao hơn |

## 📝 Migration

Nếu đang dùng hệ thống cũ với `isBackup`, cần chạy migration:

```sql
-- Xem file scripts/migrate-db.sql
ALTER TABLE employees ADD COLUMN can_work_alone BOOLEAN DEFAULT FALSE;
ALTER TABLE employees DROP COLUMN is_backup;
```

Hoặc gọi API init để tạo lại schema:
```bash
curl http://localhost:3000/api/init
```
