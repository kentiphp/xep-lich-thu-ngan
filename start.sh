#!/bin/bash

echo "🏥 Khởi động hệ thống xếp lịch thu ngân..."
echo "📦 Đang cài đặt dependencies (nếu cần)..."

# Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
    echo "📥 Cài đặt packages..."
    npm install
fi

echo "🚀 Khởi động development server..."
echo "🌐 Mở trình duyệt tại: http://localhost:3000"
echo ""
echo "Nhấn Ctrl+C để dừng server"
echo "---"

npm run dev
