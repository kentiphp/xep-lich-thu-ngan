"use client";

import { useState } from "react";

export default function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        title="Hướng dẫn sử dụng"
      >
        <span className="text-2xl">?</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                📖 Hướng dẫn sử dụng
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Quy định ca làm */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  ⏰ Quy định ca làm việc
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700">
                    <strong>Ca 1:</strong> 8:30 - 17:00
                  </p>
                  <p className="text-gray-700">
                    <strong>Ca 2:</strong> 14:00 - 23:00
                  </p>
                  <p className="text-gray-700">
                    <strong>Số người/ca:</strong> 1-2 người
                  </p>
                  <p className="text-orange-700 font-medium">
                    ⚠️ Khi 1 người nghỉ: người còn lại phải làm full cả 2 ca
                  </p>
                </div>
              </section>

              {/* Quản lý nhân viên */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  👥 Quản lý nhân viên
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      Click nút <strong>"Sửa tên"</strong> để thay đổi tên nhân
                      viên
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      Nhập tên mới và nhấn <strong>Enter</strong> hoặc click{" "}
                      <strong>"Lưu"</strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      Nhấn <strong>Escape</strong> hoặc click{" "}
                      <strong>"Hủy"</strong> để hủy
                    </span>
                  </li>
                </ul>
              </section>

              {/* Xem lịch */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📅 Xem và quản lý lịch
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-green-600">•</span>
                    <span>
                      Click vào <strong>ngày bất kỳ</strong> để xem chi tiết ca
                      làm việc
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">•</span>
                    <span>
                      Sử dụng nút <strong>"← Tuần trước"</strong> và{" "}
                      <strong>"Tuần sau →"</strong> để điều hướng
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">•</span>
                    <span>
                      Click <strong>"Tuần này"</strong> để quay về tuần hiện tại
                    </span>
                  </li>
                </ul>
              </section>

              {/* Đánh dấu nghỉ */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  🏖️ Đánh dấu ngày nghỉ
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Mở chi tiết ngày cần đánh dấu</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span>
                      Click vào tên nhân viên trong phần{" "}
                      <strong>"Đánh dấu nghỉ"</strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span>
                      Nút chuyển sang{" "}
                      <strong className="text-red-600">màu đỏ</strong> khi được
                      đánh dấu nghỉ
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span>
                      Lịch tự động điều chỉnh: người còn lại sẽ làm full 2 ca
                    </span>
                  </li>
                </ul>
              </section>

              {/* Lưu trữ */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  💾 Lưu trữ dữ liệu
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">
                    ✓ Dữ liệu được <strong>tự động lưu</strong> vào trình duyệt
                    (localStorage)
                  </p>
                  <p className="text-gray-700 mb-2">
                    ✓ Mỗi tuần có lịch <strong>riêng biệt</strong> và độc lập
                  </p>
                  <p className="text-orange-600 font-medium">
                    ⚠️ Xóa cache trình duyệt sẽ mất dữ liệu đã lưu
                  </p>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
